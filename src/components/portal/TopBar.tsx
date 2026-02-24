import React, { useState } from 'react';
import {
  Search, Bell, ChevronDown, User, Settings, LogOut,
  Menu, LogIn
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { ViewType } from './Sidebar';

interface TopBarProps {
  currentView: ViewType;
  onMobileMenuToggle: () => void;
  onNavigate: (view: ViewType) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

const viewTitles: Record<ViewType, string> = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  invoices: 'Invoices',
  payments: 'Payments',
  returns: 'Returns & Refunds',
  profile: 'My Profile',
  support: 'Support',
  settings: 'Settings',
};

const TopBar: React.FC<TopBarProps> = ({ currentView, onMobileMenuToggle, onNavigate, onOpenAuth }) => {
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const notifications = [
    { id: 1, title: 'New order synced from ERPNext', time: '2 hours ago', read: false },
    { id: 2, title: 'Invoice payment received', time: '1 day ago', read: false },
    { id: 3, title: 'Return request approved', time: '2 days ago', read: true },
    { id: 4, title: 'ERPNext sync completed', time: '4 days ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayTier = profile?.loyalty_tier || 'Member';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{viewTitles[currentView]}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Quick search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-56 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50"
          />
        </div>

        {user ? (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-xl z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!notif.read ? 'bg-red-50/30' : ''}`}>
                          <div className="flex items-start gap-2">
                            {!notif.read && <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />}
                            <div>
                              <p className={`text-sm ${!notif.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button className="w-full text-center text-sm text-red-600 hover:text-red-700 font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-none">{displayName.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{displayTier}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl z-50 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                    </div>
                    <button
                      onClick={() => { onNavigate('profile'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <button
                      onClick={() => { onNavigate('settings'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
