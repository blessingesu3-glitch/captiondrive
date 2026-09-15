import React from 'react';
import { 
  Home, 
  FolderOpen, 
  Sparkles,
  Calendar,
  BarChart2,
  Bookmark,
  Settings,
  Zap,
  Send,
  History
} from 'lucide-react';
import { ActiveTab, User } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  user: User;
  onConnectDrive: () => void;
  favoritesCount: number;
  captionsCount: number;
  onOpenUpgradeModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  user,
  onConnectDrive,
  favoritesCount,
  captionsCount,
  onOpenUpgradeModal
}) => {
  const primaryNavItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'media' as ActiveTab,
      label: 'Library',
      icon: FolderOpen,
    },
    {
      id: 'generator' as ActiveTab,
      label: 'Create',
      icon: Sparkles,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendar',
      icon: Calendar,
    },
    {
      id: 'social' as ActiveTab,
      label: 'Publish',
      icon: Send,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics',
      icon: BarChart2,
    },
  ];

  const secondaryNavItems = [
    {
      id: 'favorites' as ActiveTab,
      label: 'Saved',
      icon: Bookmark,
      badge: favoritesCount > 0 ? favoritesCount.toString() : null,
    },
    {
      id: 'captions' as ActiveTab,
      label: 'Caption History',
      icon: History,
      badge: captionsCount > 0 ? captionsCount.toString() : null,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const used = user.usage?.captionsGenerated || 0;
  const limit = user.usage?.limit || 20;
  const planName = (user.usage?.plan || 'free').toUpperCase();
  const percent = Math.min(100, Math.round((used / limit) * 100));

  return (
    <aside className="w-[240px] shrink-0 hidden md:flex flex-col border-r border-[#EAE6DF] min-h-[calc(100vh-4.5rem)] p-5 select-none bg-transparent justify-between">
      
      {/* Primary Navigation */}
      <nav className="space-y-1.5 flex-1">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold tracking-tight transition-all-fast cursor-pointer border-none ${
                isActive
                  ? 'text-[#E94B35] bg-[#FFF1ED] font-bold'
                  : 'text-[#555555] hover:bg-white/40 hover:text-[#111111]'
              }`}
            >
              <Icon 
                className={`w-4 h-4 ${
                  isActive ? 'text-[#E94B35]' : 'text-[#888888]'
                }`} 
                strokeWidth={2}
              />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Separator */}
        <div className="h-px bg-[#EAE6DF] my-5 mx-2" />

        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-tight transition-all-fast cursor-pointer border-none ${
                isActive
                  ? 'text-[#E94B35] bg-[#FFF1ED] font-bold'
                  : 'text-[#555555] hover:bg-white/40 hover:text-[#111111]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon 
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#E94B35]' : 'text-[#888888]'
                  }`} 
                  strokeWidth={2}
                />
                <span>{item.label}</span>
              </div>
              
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-[#E94B35] text-white' : 'bg-[#EAE6DF] text-[#555555]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Monthly Usage Counter Card */}
      <div className="mt-auto bg-[#FFF1ED] rounded-2xl p-4 border border-[#FADCD5] text-xs relative flex flex-col gap-2.5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E94B35]">
            {planName} PLAN
          </span>
          <span className="text-[10px] font-bold text-gray-500">
            {used} / {limit} used
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-[#FFDED6] overflow-hidden">
          <div 
            className="h-full bg-[#E94B35] rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        <button
          onClick={onOpenUpgradeModal}
          className="w-full h-8.5 rounded-xl bg-[#E94B35] hover:bg-[#D13E29] text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-xs mt-0.5 transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Upgrade Plan</span>
        </button>
      </div>

    </aside>
  );
};
