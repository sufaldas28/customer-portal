import React from 'react';
import {
  LayoutDashboard, ShoppingCart, FileText, CreditCard,
  RotateCcw, User, LifeBuoy, LogOut, ChevronLeft, ChevronRight,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export type ViewType = 'dashboard' | 'orders' | 'invoices' | 'payments' | 'returns' | 'profile' | 'support' | 'settings';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/698d2f84e1606522e1e4386f_1770872684443_6ea989b0.png';


const navItems: { id: ViewType; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'support', label: 'Support', icon: LifeBuoy },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, collapsed, onToggleCollapse }) => {
  const { profile, signOut } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[#0f172a] text-white flex flex-col z-40 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      {/* Logo */}

      <div className="flex items-center h-16 px-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#1a1a2e] flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-600/50">
            <img src={LOGO_URL} alt="Courts PNG" className="w-8 h-8 object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-wide truncate">Courts PNG</h1>
              <p className="text-[10px] text-slate-400 truncate">Customer Portal</p>
            </div>
          )}
        </div>
      </div>


      {/* User Info */}
      {profile && !collapsed && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(profile.full_name || 'U')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{profile.company || profile.email}</p>
            </div>
          </div>
        </div>
      )}
      {profile && collapsed && (
        <div className="flex justify-center py-3 border-b border-slate-700/50">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(profile.full_name || 'U')}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-red-500/15 text-red-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-500 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-700/50 p-3 space-y-1">
        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'settings'
              ? 'bg-red-500/15 text-red-400'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Settings className={`w-5 h-5 flex-shrink-0 ${activeView === 'settings' ? 'text-red-400' : 'text-slate-500'}`} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 text-slate-500" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors z-50"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
};

export default Sidebar;
