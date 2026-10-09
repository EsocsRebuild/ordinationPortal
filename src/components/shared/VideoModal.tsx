'use client';

import React, { useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Shield, Film, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  category?: string;
}

export function VideoModal({
  isOpen,
  onClose,
  title = '2026 Holy Ordination & Solemn Consecration Documentary',
  category = 'Ordination Protocol & Sanctuary Walkthrough',
}: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(38);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden my-6 flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-church-950 border-b border-church-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-church-900 rounded-lg text-gold-400 border border-gold-400/20">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400">
                {category}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Presentation */}
        <div className="relative aspect-video bg-gradient-to-br from-church-950 via-slate-950 to-church-900 flex flex-col items-center justify-center overflow-hidden">
          {/* Animated Graphical Ambient Elements */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Central Heraldic Shield & Title */}
          <div className="relative z-10 text-center space-y-4 p-6">
            <div className="w-20 h-20 rounded-2xl bg-church-900/90 border border-gold-400/40 flex items-center justify-center text-gold-400 mx-auto shadow-2xl shadow-gold-500/10">
              <Shield className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                Mount Zion Cathedral Holy Ordination Ceremony
              </h4>
              <p className="text-xs text-gold-300 font-serif italic">
                “Upon this Holy Mountain, the Lord shall establish His covenant.”
              </p>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Broadcast' : 'Resume Broadcast'}</span>
            </button>
          </div>

          {/* Video Player Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col gap-2 z-20">
            {/* Progress Bar */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
              <div
                className="bg-gold-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white">
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-[11px] font-mono text-slate-400">04:18 / 12:45</span>
              </div>

              <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider">
                1080p Ultra-HD Master Stream
              </span>
            </div>
          </div>
        </div>

        {/* Chapters & Ordination Notes */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-gold-400 uppercase">Chapter 1</span>
            <p className="font-semibold text-white">Order of Divine Service</p>
            <p className="text-[11px] text-slate-400">Solemn procession and opening psalms.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-gold-400 uppercase">Chapter 2</span>
            <p className="font-semibold text-white">Ordination Vows & Laying of Hands</p>
            <p className="text-[11px] text-slate-400">Consecration prayer by the Prelate.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-gold-400 uppercase">Chapter 3</span>
            <p className="font-semibold text-white">Robing & Insignia Presentation</p>
            <p className="text-[11px] text-slate-400">Conferment of stoles, caps, and robes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

