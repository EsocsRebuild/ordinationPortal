'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CandidateProfile, InAppMessage } from '@/types';

export interface RealtimeEventData {
  id: string;
  type: 
    | 'CANDIDATE_UPDATED'
    | 'TIER_APPROVED'
    | 'CHECK_IN_ACCREDITED'
    | 'MESSAGE_SENT'
    | 'AUDIT_LOG_ADDED'
    | 'ATTENDANCE_CHANGED'
    | 'CERTIFICATE_ISSUED'
    | 'HIERARCHY_UPDATED'
    | 'SYSTEM_BROADCAST'
    | 'CONNECTED';
  timestamp: string;
  payload: any;
  actor?: string;
  candidateId?: string;
  targetRole?: string;
}

type EventListener = (event: RealtimeEventData) => void;

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private listeners: Set<EventListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private isConnected = false;
  private reconnectTimeout: any = null;
  private latency = 8;
  private statusListeners: Set<(connected: boolean, latency: number) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('esocs_realtime_channel');
        this.broadcastChannel.onmessage = (e) => {
          if (e.data) {
            this.notifyListeners(e.data, false);
          }
        };
      } catch (err) {
        // BroadcastChannel not available in environment
      }
      this.connect();
    }
  }

  public connect() {
    if (typeof window === 'undefined' || this.eventSource) return;

    try {
      const startTime = performance.now();
      this.eventSource = new EventSource('/api/realtime/stream');

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.latency = Math.round(performance.now() - startTime);
        this.notifyStatus();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: RealtimeEventData = JSON.parse(event.data);
          this.notifyListeners(data, true);
        } catch (err) {
          // Ignored parse error
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.notifyStatus();
        this.cleanup();
        
        // Reconnect after 3s
        if (!this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
          }, 3000);
        }
      };
    } catch (err) {
      this.isConnected = false;
      this.notifyStatus();
    }
  }

  private cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeStatus(listener: (connected: boolean, latency: number) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.isConnected, this.latency);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public broadcastLocal(event: RealtimeEventData) {
    this.notifyListeners(event, true);
  }

  private notifyListeners(event: RealtimeEventData, broadcastToOtherTabs = true) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in realtime listener:', e);
      }
    });

    if (broadcastToOtherTabs && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
      } catch (e) {
        // Channel post message failure fallback
      }
    }
  }

  private notifyStatus() {
    this.statusListeners.forEach((listener) => {
      try {
        listener(this.isConnected, this.latency);
      } catch (e) {}
    });
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      latency: this.latency,
    };
  }
}

// Global Singleton Client
export const realtimeClient = new RealtimeClient();

// =============================================================================
// REACT HOOKS
// =============================================================================

/**
 * Hook to monitor live connection & latency status
 */
export function useRealtimeSync() {
  const [status, setStatus] = useState({ connected: false, latency: 12 });

  useEffect(() => {
    return realtimeClient.subscribeStatus((connected, latency) => {
      setStatus({ connected, latency });
    });
  }, []);

  return status;
}

/**
 * Hook to listen to a specific realtime event type
 */
export function useRealtimeEvent(
  targetType: RealtimeEventData['type'] | 'ALL',
  callback: (event: RealtimeEventData) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return realtimeClient.subscribe((event) => {
      if (targetType === 'ALL' || event.type === targetType) {
        callbackRef.current(event);
      }
    });
  }, [targetType]);
}

/**
 * Hook to keep a candidate profile updated live in real time
 */
export function useRealtimeCandidate(
  candidateId: string,
  initialData: CandidateProfile
): [CandidateProfile, React.Dispatch<React.SetStateAction<CandidateProfile>>];
export function useRealtimeCandidate(
  candidateId?: string,
  initialData?: CandidateProfile | null
): [CandidateProfile | null, React.Dispatch<React.SetStateAction<CandidateProfile | null>>];
export function useRealtimeCandidate(
  candidateId?: string,
  initialData?: CandidateProfile | null
): [any, any] {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(initialData || null);

  useEffect(() => {
    if (initialData) {
      setCandidate(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!candidateId) return;

    return realtimeClient.subscribe((event) => {
      if (
        (event.type === 'CANDIDATE_UPDATED' || event.type === 'CHECK_IN_ACCREDITED') &&
        event.payload &&
        (event.payload.id === candidateId || event.payload.regNumber === candidateId || event.candidateId === candidateId)
      ) {
        setCandidate((prev) => (prev ? { ...prev, ...event.payload } : event.payload));
      }
    });
  }, [candidateId]);

  return [candidate, setCandidate] as const;
}

/**
 * Hook to stream messages live with zero lag
 */
export function useRealtimeMessages(
  candidateId?: string
) {
  const [messages, setMessages] = useState<InAppMessage[]>([]);

  useEffect(() => {
    if (!candidateId) return;

    let isMounted = true;
    fetch(`/api/messages?candidateId=${candidateId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.data?.messages && Array.isArray(data.data.messages)) {
          setMessages(data.data.messages);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [candidateId]);

  useEffect(() => {
    if (!candidateId) return;

    return realtimeClient.subscribe((event) => {
      if (event.type === 'MESSAGE_SENT' && event.payload) {
        const msg = event.payload as InAppMessage;
        if (msg.candidateId === candidateId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      }
    });
  }, [candidateId]);

  return [messages, setMessages] as const;
}
