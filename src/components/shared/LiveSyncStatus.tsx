'use client';

import React, { useState, useEffect } from 'react';
import { useRealtimeSync, useRealtimeEvent, RealtimeEventData } from '@/services/realtime';
import { Tooltip } from '@/components/ui/Tooltip';
import { Activity, Wifi, WifiOff, Sparkles, X, CheckCircle2, Bell, RefreshCw } from 'lucide-react';

export function LiveSyncStatus() {
  const { connected, latency } = useRealtimeSync();
  const [recentEvents, setRecentEvents] = useState<RealtimeEventData[]>([]);
  const [showEventsDrawer, setShowEventsDrawer] = useState(false);
  const [latestToast, setLatestToast] = useState<RealtimeEventData | null>(null);

  // Listen to all real-time events
  useRealtimeEvent('ALL', (event) => {
    if (event.type === 'CONNECTED') return;
    
    setRecentEvents((prev) => [event, ...prev.slice(0, 19)]);
    setLatestToast(event);
    
    // Auto clear toast after 4s
    setTimeout(() => {
      setLatestToast((curr) => (curr?.id === event.id ? null : curr));
    }, 4000);
  });

  return (
    <>
      {/* Live Badge in Header */}
      <Tooltip content={`Real-time SSE & Broadcast Sync: ${connected ? `Connected (${latency}ms latency)` : 'Connecting...'}`}>
        <button
          type="button"
          onClick={() => setShowEventsDrawer(!showEventsDrawer)}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold inline-flex items-center gap-1.5 transition-all border shadow-xs cursor-pointer ${
            connected
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {connected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="hidden sm:inline">{connected ? 'Live Sync' : 'Syncing'}</span>
          <span className="text-[10px] opacity-70 hidden md:inline">{latency}ms</span>
        </button>
      </Tooltip>

      {/* Floating Instant Event Toast */}
      {latestToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Live Real-Time Update
            </p>
            <p className="text-xs font-semibold truncate text-white">
              {latestToast.type.replace(/_/g, ' ')}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {latestToast.actor ? `By ${latestToast.actor}` : 'Church Server Broadcast'}
            </p>
          </div>
          <button
            onClick={() => setLatestToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Realtime Event Stream Drawer Modal */}
      {showEventsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Real-Time System Activity Feed
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                    ● Connected &bull; Zero-Latency Broadcast
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEventsDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event List */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-2.5 text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Activity className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p>Listening for real-time events across the portal network...</p>
                  <span className="text-[10px] text-slate-500">Approvals, messages, and check-ins appear here instantly.</span>
                </div>
              ) : (
                recentEvents.map((evt) => (
                  <div key={evt.id} className="pt-2.5 first:pt-0 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 animate-pulse" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {evt.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        {evt.actor ? `Executed by ${evt.actor}` : 'System operation recorded'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Multi-Tab Cross-Window Synchronization Active
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

