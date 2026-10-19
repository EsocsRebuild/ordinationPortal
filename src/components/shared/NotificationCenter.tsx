'use client';

import React, { useState } from 'react';
import { Bell, Check, Clock, ShieldCheck, UserCheck, AlertCircle, FileCheck } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'approval' | 'vetting' | 'system' | 'security';
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse ring-2 ring-slate-900" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  Automated Alerts
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center text-slate-400 text-xs space-y-2">
                  <Bell className="w-6 h-6 mx-auto text-slate-600 opacity-60" />
                  <p className="font-medium text-slate-300">No notifications at this time</p>
                  <p className="text-[11px] text-slate-500">Official church alerts and clearance updates will appear here.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3.5 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${
                      !n.read ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                      {n.type === 'approval' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      {n.type === 'vetting' && <UserCheck className="w-4 h-4 text-blue-400" />}
                      {n.type === 'security' && <FileCheck className="w-4 h-4 text-amber-400" />}
                      {n.type === 'system' && <AlertCircle className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className={`text-xs font-semibold truncate ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {n.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-slate-800 bg-slate-950 text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Church Notification Network Active
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
