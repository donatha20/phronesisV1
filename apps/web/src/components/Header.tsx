import React from 'react';
import {
  Sparkles, Shield, Compass, BookOpen, Radio, Target,
  Video, Lock, Users, FolderOpen, ChevronDown, Flame,
  HardDrive, CalendarDays, LogOut, UserCog
} from 'lucide-react';
import { UserProfile } from '../types';

export type ActiveTab = 
  | 'DASHBOARD'
  | 'DEVOTIONS'
  | 'PODCASTS'
  | 'SPHERES'
  | 'SESSIONS'
  | 'PRAYER_VAULT'
  | 'MENTORS'
  | 'RESOURCES'
  | 'GOOGLE_DRIVE'
  | 'GOOGLE_CALENDAR'
  | 'SECURITY'
  | 'ADMIN';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenAssistant: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  MENTOR_ELDER: 'Elder Mentor',
  YOUNG_BELIEVER_MENTEE: 'Young Believer',
  ADMIN: 'Administrator',
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenAssistant
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'DASHBOARD', label: 'Overview', icon: Compass },
    { id: 'DEVOTIONS', label: 'Daily Phronesis', icon: BookOpen },
    { id: 'PODCASTS', label: 'Media Hub', icon: Radio },
    { id: 'SPHERES', label: '5 Life Spheres', icon: Target },
    { id: 'SESSIONS', label: 'Discipleship', icon: Video },
    { id: 'GOOGLE_CALENDAR', label: 'Calendar & Meet', icon: CalendarDays },
    { id: 'PRAYER_VAULT', label: 'Prayer Vault', icon: Lock },
    { id: 'MENTORS', label: 'Mentors Directory', icon: Users },
    { id: 'RESOURCES', label: 'Library', icon: FolderOpen },
    { id: 'GOOGLE_DRIVE', label: 'Google Drive', icon: HardDrive },
    { id: 'SECURITY', label: 'Security & Keys', icon: Shield },
    ...(currentUser.role === 'ADMIN'
      ? [{ id: 'ADMIN' as const, label: 'Admin', icon: UserCog }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main top row */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('DASHBOARD')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-950/40">
              <span className="font-serif-display font-black text-xl italic">Φ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-serif-display text-white tracking-wide">PHRONESIS</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Mentorship
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-sans tracking-tight">Cross-Generational Discipleship Platform</p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Streak indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>24d Streak</span>
            </div>

            {/* AI Spiritual Companion Button */}
            <button
              id="spiritual-companion-header-btn"
              onClick={onOpenAssistant}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-950/30 transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="hidden md:inline">Spiritual AI Assistant</span>
              <span className="md:hidden">Assistant</span>
            </button>

            {/* Authenticated user menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs text-stone-200 transition"
              >
                <div className="w-6 h-6 rounded-full bg-amber-600/30 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xs">
                  {currentUser.avatarInitial}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-semibold text-stone-100 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-400">
                    {ROLE_LABEL[currentUser.role] ?? currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-stone-800">
                    <div className="font-semibold text-stone-100 truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-stone-400 truncate">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="mt-1 w-full flex items-center gap-2 p-2.5 rounded-xl text-left text-stone-300 hover:bg-stone-800 transition"
                  >
                    <LogOut className="w-4 h-4 text-stone-400" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Navigation Row (Tabs) */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-stone-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-950/40'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
