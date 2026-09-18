import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell,
  Command,
  Settings,
  LogOut
} from 'lucide-react';
import { User, ActiveTab } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  user: User;
  onConnectDrive: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenImportModal: () => void;
  onOpenSmartSearch: () => void;
  activeTab: string;
  onSelectTab?: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onConnectDrive,
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  onOpenImportModal,
  onOpenSmartSearch,
  activeTab,
  onSelectTab,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const horizontalNavItems = [
    { id: 'media' as ActiveTab, label: 'Library' },
    { id: 'generator' as ActiveTab, label: 'Create' },
    { id: 'calendar' as ActiveTab, label: 'Calendar' },
    { id: 'analytics' as ActiveTab, label: 'Analytics' }
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E6EC] bg-white backdrop-blur-md select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left Side: Brand Logo & Identity */}
        <div className="cursor-pointer" onClick={() => onSelectTab && onSelectTab('dashboard')}>
          <Logo layout="horizontal" size={26} />
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {horizontalNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab && onSelectTab(item.id)}
              className={`text-sm font-semibold tracking-tight transition-all-fast cursor-pointer ${
                activeTab === item.id
                  ? 'text-[#14137B] font-bold'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side: Search, Notifications & Avatar */}
        <div className="flex items-center gap-3.5 flex-1 max-w-sm justify-end">
          
          {/* Global Search Bar */}
          <div className="relative group flex-1 hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14137B] transition-colors" strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search media or captions..."
              className="w-full pl-9 pr-14 h-9.5 text-xs font-semibold rounded-lg bg-[#F5F7FA]/60 border border-[#E2E6EC] focus:outline-none focus:ring-1 focus:ring-[#14137B] focus:border-[#14137B] text-[#111111] placeholder-gray-400 transition-all"
            />
            <button
              onClick={onOpenSmartSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded bg-[#FFFFFF] text-gray-500 border border-[#E2E6EC] flex items-center gap-0.5 cursor-pointer"
              title="Smart AI Search (Cmd+K)"
            >
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </button>
          </div>

          {/* Notifications bell */}
          <button className="p-2 rounded-lg text-gray-500 hover:text-[#111111] hover:bg-gray-50 transition-colors cursor-pointer relative">
            <Bell className="w-4.5 h-4.5" strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#14137B] rounded-full" />
          </button>

          {/* User profile avatar */}
          <div ref={userMenuRef} className="relative">
            <div
              onClick={() => setShowUserMenu((v) => !v)}
              className="w-8.5 h-8.5 rounded-full overflow-hidden border border-[#E2E6EC] cursor-pointer hover:border-[#14137B] transition-colors"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#EDEDF8] text-[#14137B] flex items-center justify-center font-extrabold text-xs">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'BE'}
                </div>
              )}
            </div>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E6EC] rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-3.5 py-2 border-b border-[#E2E6EC]">
                  <p className="text-xs font-bold text-[#111111] truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); onSelectTab && onSelectTab('settings'); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-[#F5F7FA] transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#14137B] hover:bg-[#EDEDF8] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
