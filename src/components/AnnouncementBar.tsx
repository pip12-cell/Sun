import React from 'react';
import { useStore } from '../hooks/useStore';
import { Sparkles } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings, language } = useStore();

  if (!settings.announcement.enabled) return null;

  const text = language === 'ar' ? settings.announcement.ar : settings.announcement.en;

  return (
    <aside
      id="top-announcement-bar"
      aria-label="Announcement"
      className="bg-[#2D5A27] text-[#FAFAF8] text-xs md:text-sm py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 overflow-hidden relative"
    >
      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse shrink-0" />
      <span className="truncate">{text}</span>
      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse shrink-0 hidden sm:inline" />
    </aside>
  );
};
