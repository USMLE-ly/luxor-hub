"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface GlassTabsProps {
  tabs: GlassTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const bgOverlays: Record<string, string> = {
  analyze: 'bg-indigo-500/30 dark:bg-indigo-800/40',
  recommendations: 'bg-emerald-500/30 dark:bg-emerald-800/40',
  review: 'bg-amber-500/30 dark:bg-amber-800/40',
};

const defaultBg = 'bg-purple-500/30 dark:bg-purple-800/40';

export default function GlassTabs({ tabs, activeTab, onTabChange, className }: GlassTabsProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const overlay = bgOverlays[tab.id] || defaultBg;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'relative overflow-hidden rounded-2xl p-4 text-white shadow-lg isolate cursor-pointer',
              'transition-shadow duration-300',
              isActive ? 'shadow-xl ring-1 ring-white/20' : 'shadow-md opacity-80 hover:opacity-100'
            )}
          >
            {/* Background image overlay */}
            <div className="absolute inset-0 z-[-1]">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80"
                alt=""
                className="w-full h-full object-cover"
              />
              <div className={cn('absolute inset-0', overlay)} />
            </div>

            {/* Content */}
            <div className="flex flex-col items-start gap-1.5">
              <span className="text-lg">{tab.icon}</span>
              <span className={cn(
                'text-sm font-semibold leading-tight',
                isActive ? 'text-white' : 'text-white/80'
              )}>
                {tab.label}
              </span>
            </div>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="glass-tab-active"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-white/60"
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
