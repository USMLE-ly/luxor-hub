"use client"

import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  imageBg?: string;
  tintClass?: string;
}

interface GlassTabsProps {
  tabs: GlassTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const defaultImage = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80';

const defaultTints: Record<string, string> = {
  analyze: 'bg-indigo-500/40',
  recommendations: 'bg-emerald-500/40',
  review: 'bg-amber-500/40',
};

export default function GlassTabs({ tabs, activeTab, onTabChange, className }: GlassTabsProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-2 w-full max-w-lg mx-auto', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const tint = tab.tintClass || defaultTints[tab.id] || 'bg-purple-500/40';
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative overflow-hidden rounded-xl p-3 text-white shadow-lg transition-all duration-300',
              isActive ? 'scale-105 shadow-xl ring-1 ring-white/20' : 'opacity-70 hover:scale-[1.02] hover:opacity-90'
            )}
          >
            <div className="absolute inset-0 z-0">
              <img
                src={tab.imageBg || defaultImage}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className={cn('absolute inset-0', tint)} />
            </div>
            <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-medium">
              {tab.icon} {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
