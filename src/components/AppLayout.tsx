import React, { useState } from 'react';
import Sidebar, { ViewType } from './portal/Sidebar';
import TopBar from './portal/TopBar';
import DashboardView from './portal/DashboardView';
import OrdersView from './portal/OrdersView';
import InvoicesView from './portal/InvoicesView';
import PaymentsView from './portal/PaymentsView';
import ReturnsView from './portal/ReturnsView';
import ProfileView from './portal/ProfileView';
import SupportView from './portal/SupportView';
import SettingsView from './portal/SettingsView';
import AuthModal from './portal/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingCart, FileText, CreditCard, RotateCcw,
  LifeBuoy, Shield, BarChart3, Loader2
} from 'lucide-react';

const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/698d2f84e1606522e1e4386f_1770872684443_6ea989b0.png';


const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={handleViewChange} />;
      case 'orders':
        return <OrdersView />;
      case 'invoices':
        return <InvoicesView />;
      case 'payments':
        return <PaymentsView />;
      case 'returns':
        return <ReturnsView />;
      case 'profile':
        return <ProfileView />;
      case 'support':
        return <SupportView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={handleViewChange} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a2e] shadow-lg flex items-center justify-center mx-auto mb-4 overflow-hidden border border-slate-600/30">
            <img src={LOGO_URL} alt="Courts PNG" className="w-14 h-14 object-contain" />
          </div>
          <Loader2 className="w-6 h-6 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your portal...</p>
        </div>
      </div>
    );
  }


  // Not authenticated - show landing/gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Minimal TopBar for unauthenticated users */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src={LOGO_URL} alt="Courts PNG" className="w-9 h-9 object-contain" />
            </div>

            <div>
              <h1 className="text-sm font-bold text-gray-900 tracking-wide">Courts PNG</h1>
              <p className="text-[10px] text-gray-400">Customer Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAuth('login')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => handleOpenAuth('signup')}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-96 h-96 bg-red-400 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-400 rounded-full blur-3xl opacity-50" />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 lg:py-32 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-medium text-red-300">Powered by ERPNext</span>
            </div>
            <div className="flex justify-center mb-6">
              <img src={LOGO_URL} alt="Courts PNG" className="h-20 lg:h-28 object-contain" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Customer Portal</span>
            </h1>
            <p className="text-lg text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
              Manage your orders, track invoices, process payments, and get support — all in one powerful, unified dashboard connected to your ERPNext instance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <button
                onClick={() => handleOpenAuth('signup')}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-red-500/25 w-full sm:w-auto"
              >
                Create Free Account
              </button>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-colors border border-white/10 w-full sm:w-auto"
              >
                Sign In to Portal
              </button>
            </div>
          </div>
        </div>


        {/* Features Grid */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need, One Dashboard</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Streamline your business operations with comprehensive tools designed for efficiency and clarity.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShoppingCart, title: 'Order Management', desc: 'Track all orders with real-time status updates from ERPNext, detailed views, and shipment tracking.', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
              { icon: FileText, title: 'Invoice Tracking', desc: 'View and manage all invoices with payment status, due date alerts, and outstanding balances.', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
              { icon: CreditCard, title: 'Payment History', desc: 'Complete payment timeline with transaction details, methods, and real-time sync from ERPNext.', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
              { icon: RotateCcw, title: 'Returns & Refunds', desc: 'Submit return requests, track progress, and monitor refund status effortlessly.', color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', text: 'text-purple-600' },
              { icon: LifeBuoy, title: 'Support Center', desc: 'Create tickets, track resolutions, and communicate with support in real-time.', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600' },
              { icon: BarChart3, title: 'Live ERPNext Data', desc: 'Real-time connection to your ERPNext instance with automatic data synchronization.', color: 'from-cyan-500 to-sky-500', bg: 'bg-cyan-50', text: 'text-cyan-600' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.text}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-16 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <span className="text-sm font-semibold text-red-600">Enterprise-Grade Security</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Trusted by Courts PNG Customers</h3>
            <p className="text-gray-500 max-w-lg mx-auto mb-10">Your data is protected with industry-standard encryption, role-based access controls, and secure ERPNext API integration.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { value: 'Live', label: 'ERPNext Sync' },
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '256-bit', label: 'Encryption' },
                { value: '24/7', label: 'Support' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b]">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">Create your account in seconds and start managing your orders, invoices, and support tickets today.</p>
            <button
              onClick={() => handleOpenAuth('signup')}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-red-500/25"
            >
              Create Your Free Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#1a1a2e] border border-gray-200 flex items-center justify-center overflow-hidden">
                <img src={LOGO_URL} alt="Courts PNG" className="w-7 h-7 object-contain" />
              </div>

              <span className="text-sm font-semibold text-gray-900">Courts PNG</span>
            </div>
            <p className="text-xs text-gray-400">&copy; 2026 Courts PNG Customer Portal. All rights reserved.</p>
          </div>
        </footer>

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  // Authenticated - show full portal
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Sidebar - Mobile */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          collapsed={false}
          onToggleCollapse={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <TopBar
          currentView={activeView}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onNavigate={handleViewChange}
          onOpenAuth={handleOpenAuth}
        />
        <main className="p-4 lg:p-8">
          {renderView()}
        </main>
      </div>

      {/* Auth Modal (for re-auth if needed) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default AppLayout;
