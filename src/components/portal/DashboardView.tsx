import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, FileText, CreditCard, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, Package,
  AlertTriangle, Star, ChevronRight, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { orders as mockOrders, invoices as mockInvoices, customerProfile as defaultProfile, monthlySpending, categorySpending, formatCurrency, formatDate } from '@/data/portalData';
import { useAuth } from '@/contexts/AuthContext';
import { useERPNext, formatERPDate, mapOrderStatus } from '@/hooks/useERPNext';
import { useERPNextSettings } from '@/contexts/ERPNextContext';
import StatusBadge from './StatusBadge';
import type { ViewType } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { isConfigured, settings } = useERPNextSettings();
  const { getDashboardData } = useERPNext();
  const [dashData, setDashData] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [usingLive, setUsingLive] = useState(false);

  const userName = profile?.full_name || defaultProfile.name;
  const userCompany = profile?.company || defaultProfile.company;
  const userCustomerId = settings?.customer_id || profile?.customer_id || defaultProfile.customerId;
  const userLoyaltyPoints = profile?.loyalty_points ?? defaultProfile.loyaltyPoints;
  const userLoyaltyTier = profile?.loyalty_tier || defaultProfile.loyaltyTier;
  const userCreditLimit = profile?.credit_limit ?? defaultProfile.creditLimit;
  const userOutstanding = profile?.outstanding_balance ?? defaultProfile.outstandingBalance;
  const userTotalSpent = profile?.total_spent ?? defaultProfile.totalSpent;

  useEffect(() => {
    const fetchDash = async () => {
      if (!isConfigured) return;
      setDashLoading(true);
      const filters = settings?.customer_id ? [['customer', '=', settings.customer_id]] : undefined;
      const result = await getDashboardData(filters);
      if (result.success && result.data) {
        setDashData(result.data);
        setUsingLive(true);
      }
      setDashLoading(false);
    };
    fetchDash();
  }, [isConfigured, settings, getDashboardData]);

  const totalOrders = usingLive ? (dashData?.total_orders || 0) : mockOrders.length;
  const activeOrders = usingLive ? (dashData?.recent_orders?.filter((o: any) => !['Completed', 'Cancelled', 'Closed'].includes(o.status)).length || 0) : mockOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
  const unpaidInvoices = usingLive ? (dashData?.unpaid_invoices?.length || 0) : mockInvoices.filter(i => i.status !== 'Paid').length;
  const totalOutstanding = usingLive ? Number(dashData?.outstanding_summary?.total_outstanding || 0) : mockInvoices.reduce((sum, i) => sum + i.amountDue, 0);
  const recentOrders = usingLive ? (dashData?.recent_orders || []) : mockOrders.slice(0, 5);
  const overdueInvoices = usingLive ? (dashData?.unpaid_invoices?.filter((i: any) => i.status === 'Overdue') || []) : mockInvoices.filter(i => i.status === 'Overdue');

  const fmtAmount = (amt: number) => {
    if (usingLive) return `PGK ${amt.toLocaleString('en', { minimumFractionDigits: 2 })}`;
    return formatCurrency(amt);
  };

  const metrics = [
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      subtitle: `${activeOrders} active`,
      icon: ShoppingCart,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Outstanding Balance',
      value: fmtAmount(totalOutstanding),
      subtitle: `${unpaidInvoices} unpaid invoices`,
      icon: FileText,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      trend: '-8%',
      trendUp: false,
    },
    {
      title: 'Total Spent (FY)',
      value: fmtAmount(userTotalSpent),
      subtitle: 'Since Apr 2025',
      icon: CreditCard,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      trend: '+24%',
      trendUp: true,
    },
    {
      title: 'Loyalty Points',
      value: userLoyaltyPoints.toLocaleString(),
      subtitle: `${userLoyaltyTier} Member`,
      icon: Star,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      trend: '+340',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-slate-400 text-sm">Welcome back,</p>
              {usingLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-medium">
                  <Wifi className="w-3 h-3" /> Connected to ERPNext
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold">{userName}</h1>
            <p className="text-slate-400 mt-1">{userCompany} &middot; {userCustomerId}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('orders')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> View Orders
            </button>
            <button
              onClick={() => onNavigate('support')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
            >
              Get Support
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Loading */}
      {dashLoading && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <Loader2 className="w-6 h-6 text-red-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading dashboard data from ERPNext...</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${metric.textColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${metric.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  {metric.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {metric.trend}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-500 mt-1">{metric.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {(overdueInvoices.length > 0 || activeOrders > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {overdueInvoices.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-red-800">Overdue Invoices</h3>
                <p className="text-sm text-red-600 mt-0.5">
                  {overdueInvoices.length} invoice(s) overdue
                  {!usingLive && ` totaling ${formatCurrency(overdueInvoices.reduce((s: number, i: any) => s + (i.amountDue || 0), 0))}`}
                </p>
              </div>
              <button onClick={() => onNavigate('invoices')} className="text-sm font-medium text-red-700 hover:text-red-800 whitespace-nowrap">View</button>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-blue-800">Active Orders</h3>
              <p className="text-sm text-blue-600 mt-0.5">{activeOrders} order(s) in progress.</p>
            </div>
            <button onClick={() => onNavigate('orders')} className="text-sm font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap">Track</button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Spending</h3>
              <p className="text-sm text-gray-500">Last 6 months overview</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <TrendingUp className="w-4 h-4" /> +24% vs last period
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlySpending} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `K${(v / 1000).toFixed(0)}`} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Spending']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" fill="#dc2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Spending by Category</h3>
          <p className="text-sm text-gray-500 mb-4">Current financial year</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categorySpending} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categorySpending.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categorySpending.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-gray-600 truncate flex-1">{cat.name}</span>
                <span className="text-gray-900 font-medium">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Credit Info */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button onClick={() => onNavigate('orders')} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order: any) => (
              <div key={usingLive ? order.name : order.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{usingLive ? order.name : order.id}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {usingLive ? (order.customer_name || formatERPDate(order.transaction_date)) : order.items.map((i: any) => i.name).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <StatusBadge status={usingLive ? mapOrderStatus(order.status) : order.status} />
                  <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                    {usingLive ? `PGK ${Number(order.grand_total).toLocaleString('en', { minimumFractionDigits: 2 })}` : formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Credit Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Credit Limit</span>
                <span className="font-semibold text-gray-900">{fmtAmount(userCreditLimit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Outstanding</span>
                <span className="font-semibold text-amber-600">{fmtAmount(userOutstanding)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available</span>
                <span className="font-semibold text-emerald-600">{fmtAmount(userCreditLimit - userOutstanding)}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Utilization</span>
                  <span>{userCreditLimit > 0 ? ((userOutstanding / userCreditLimit) * 100).toFixed(1) : '0'}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all"
                    style={{ width: `${userCreditLimit > 0 ? (userOutstanding / userCreditLimit) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'New Order', icon: ShoppingCart, view: 'orders' as ViewType },
                { label: 'Pay Invoice', icon: CreditCard, view: 'invoices' as ViewType },
                { label: 'Track Shipment', icon: Package, view: 'orders' as ViewType },
                { label: 'Get Help', icon: Clock, view: 'support' as ViewType },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onNavigate(action.view)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all text-center group"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-red-700">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-semibold">{userLoyaltyTier} Member</h3>
            </div>
            <p className="text-3xl font-bold">{userLoyaltyPoints.toLocaleString()}</p>
            <p className="text-red-200 text-sm mt-1">Loyalty Points</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-red-200">Earn more points with every purchase</p>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
                <div className="bg-amber-300 h-1.5 rounded-full" style={{ width: `${Math.min((userLoyaltyPoints / 5000) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
