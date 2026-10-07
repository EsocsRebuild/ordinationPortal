'use client';

import React from 'react';
import { UserRole, UserSession } from '@/types';
import { INITIAL_USERS } from '@/lib/mockData';
import { ROLE_CONFIGS } from '@/utils/security';
import { Shield, User, Users, FileCheck, Award, Crown, Check } from 'lucide-react';

interface RoleSwitcherProps {
  currentSession: UserSession;
  onSelectRole: (session: UserSession) => void;
}

export function RoleSwitcher({ currentSession, onSelectRole }: RoleSwitcherProps) {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'candidate':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'parish_leader':
        return <Users className="w-4 h-4 text-indigo-500" />;
      case 'screening_officer':
        return <FileCheck className="w-4 h-4 text-amber-500" />;
      case 'advisory_board':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 'super_admin':
        return <Crown className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-subtle">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-church-600 dark:text-church-400" />
          Active Portal Role Session
        </span>
        <span className="text-[10px] text-slate-400">Zero State Conflict Guard</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {INITIAL_USERS.map((user) => {
          const isActive = user.role === currentSession.role;
          const config = ROLE_CONFIGS[user.role];

          return (
            <button
              key={user.role}
              onClick={() => onSelectRole(user)}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all border ${
                isActive
                  ? 'bg-church-50 border-church-300 dark:bg-church-950/60 dark:border-church-700 shadow-sm ring-1 ring-church-500/20'
                  : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              <div className="mt-0.5 shrink-0 p-1.5 bg-white dark:bg-slate-900 rounded-md shadow-xs border border-slate-200 dark:border-slate-700">
                {getRoleIcon(user.role)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {config.badgeLabel}
                  </p>
                  {isActive && <Check className="w-3.5 h-3.5 text-church-700 dark:text-gold-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user.name.split(' ')[0]} {user.name.split(' ').slice(-1)[0]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

