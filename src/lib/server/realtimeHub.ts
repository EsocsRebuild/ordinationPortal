import { EventEmitter } from 'events';

export interface RealtimeEvent {
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
    | 'SYSTEM_BROADCAST';
  timestamp: string;
  payload: any;
  actor?: string;
  candidateId?: string;
  targetRole?: string;
}

class RealtimeHub extends EventEmitter {
  private eventHistory: RealtimeEvent[] = [];
  private maxHistory = 100;

  constructor() {
    super();
    this.setMaxListeners(200);
  }

  public publish(type: RealtimeEvent['type'], payload: any, meta?: { actor?: string; candidateId?: string; targetRole?: string }) {
    const event: RealtimeEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
      actor: meta?.actor,
      candidateId: meta?.candidateId,
      targetRole: meta?.targetRole,
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.pop();
    }

    this.emit('event', event);
    return event;
  }

  public getRecentEvents(sinceTimestamp?: string): RealtimeEvent[] {
    if (!sinceTimestamp) {
      return this.eventHistory.slice(0, 30);
    }
    const sinceTime = new Date(sinceTimestamp).getTime();
    return this.eventHistory.filter((e) => new Date(e.timestamp).getTime() > sinceTime);
  }
}

// Global singleton across hot-reloads
const globalRealtimeHub = (global as any).__esocsRealtimeHub || new RealtimeHub();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__esocsRealtimeHub = globalRealtimeHub;
}

export const realtimeHub = globalRealtimeHub;

