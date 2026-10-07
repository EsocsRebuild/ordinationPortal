'use client';

import React, { useState } from 'react';
import { ESOCS_RANKS } from '@/lib/constants';
import { getRobingSpecifications } from '@/utils/ranks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Award, Shield, Check, Info } from 'lucide-react';

export function RobingVisualizer() {
  const [selectedRankId, setSelectedRankId] = useState<string>(ESOCS_RANKS[3].id); // Apostle by default

  const selectedRank = ESOCS_RANKS.find((r) => r.id === selectedRankId) || ESOCS_RANKS[0];
  const robing = getRobingSpecifications(selectedRank.id);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">Canonical Standards</Badge>
            <span className="text-xs font-mono text-slate-500">Holy Order Regalia</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Sacred Robes & Canonical Vestment Inspector
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect canonical vestments, brocade trims, mitres, and liturgical stoles for every sacred rank.
          </p>
        </div>
      </div>

      {/* Rank Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {ESOCS_RANKS.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRankId(r.id)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 border ${
              selectedRankId === r.id
                ? 'bg-church-900 text-gold-300 border-church-800 shadow-sm dark:bg-church-800'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100'
            }`}
          >
            {r.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Visualizer Display Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 bg-slate-50/70 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        {/* Heraldic Vestment Seal Graphic */}
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3">
          <div
            className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 shadow-inner transition-all ${
              selectedRank.robingCategory === 'Red_Gold'
                ? 'bg-gradient-to-br from-rose-950 to-church-950 border-gold-400 text-gold-400'
                : selectedRank.robingCategory === 'Purple_Gold'
                ? 'bg-gradient-to-br from-purple-950 to-church-950 border-purple-400 text-purple-300'
                : 'bg-gradient-to-br from-slate-100 to-white border-gold-400 text-church-900 dark:bg-slate-800 dark:text-gold-300'
            }`}
          >
            <Shield className="w-12 h-12" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 dark:text-gold-400">
              {selectedRank.robingCategory.replace('_', ' & ')} Insignia
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {selectedRank.name}
            </h4>
            <p className="text-[11px] font-mono text-slate-500">Order Level {selectedRank.orderLevel}</p>
          </div>
        </div>

        {/* Vestment Details */}
        <div className="md:col-span-2 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Canonical Robe & Brocade
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {robing.vestmentColor}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Liturgical Stole & Band
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {robing.stoleType}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Headwear / Mitre / Diadem
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {robing.capOrCrown}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Sacred Staff & Altar Seal
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {robing.insigniaNotes}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

