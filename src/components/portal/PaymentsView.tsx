import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, CreditCard, Building2, Smartphone, Banknote,
  Wallet, ChevronDown, ChevronUp, Download, Loader2,
  RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight
} from 'lucide-react';
import { payments as mockPayments, formatCurrency, formatDate } from '@/data/portalData';
import { useERPNext, formatERPDate, mapPaymentStatus } from '@/hooks/useERPNext';
import { useERPNextSettings } from '@/contexts/ERPNextContext';
import StatusBadge from './StatusBadge';

const methodIcons: Record<string, React.ElementType> = {
  'Credit Card': CreditCard,
  'Bank Transfer': Building2,
  'UPI': Smartphone,
  'PayPal': Wallet,
  'Cash': Banknote,
  'Check': Banknote,
  'Wire Transfer': Building2,
  'Bank Draft': Building2,
};

const PaymentsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [erpPayments, setErpPayments] = useState<any[]>([]);
  const [erpLoading, setErpLoading] = useState(false);
  const [erpError, setErpError] = useState<string | null>(null);
  const [usingLive, setUsingLive] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const { getList, getCount } = useERPNext();
  const { isConfigured, settings } = useERPNextSettings();

  const methods = ['All', 'Credit Card', 'Bank Transfer', 'UPI', 'PayPal', 'Cash'];

  const fetchPayments = useCallback(async () => {
    if (!isConfigured) return;
    setErpLoading(true);
    setErpError(null);

    try {
      const filters: any[] = [['docstatus', '=', 1], ['payment_type', '=', 'Receive']];
      if (settings?.customer_id) {
        filters.push(['party', '=', settings.customer_id]);
      }
      if (searchQuery) {
        filters.push(['name', 'like', `%${searchQuery}%`]);
      }

      const [listResult, countResult] = await Promise.all([
        getList('Payment Entry', {
          fields: ['name', 'posting_date', 'paid_amount', 'mode_of_payment', 'reference_no', 'status', 'party_name', 'docstatus', 'paid_from_account_currency'],
          filters,
          order_by: `posting_date ${sortDir}`,
          limit_page_length: pageSize,
          limit_start: page * pageSize
        }),
        getCount('Payment Entry', filters)
      ]);

      if (listResult.success && listResult.data) {
        setErpPayments(listResult.data);
        setUsingLive(true);
      } else {
        setErpError(listResult.error || 'Failed to fetch payments');
        setUsingLive(false);
      }

      if (countResult.success) {
        setTotalCount(typeof countResult.data === 'number' ? countResult.data : 0);
      }
    } catch (err: any) {
      setErpError(err.message);
      setUsingLive(false);
    } finally {
      setErpLoading(false);
    }
  }, [isConfigured, settings, searchQuery, sortDir, page, getList, getCount]);

  useEffect(() => {
    if (isConfigured) {
      fetchPayments();
    }
  }, [fetchPayments, isConfigured]);

  const totalPaid = mockPayments.reduce((s, p) => s + p.amount, 0);
  const thisMonthPaid = mockPayments.filter(p => p.date >= '2026-02-01').reduce((s, p) => s + p.amount, 0);
  const liveTotalPaid = erpPayments.reduce((s, p) => s + Number(p.paid_amount || 0), 0);

  const filteredMockPayments = useMemo(() => {
    if (usingLive) return [];
    let result = [...mockPayments];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.invoiceId.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q)
      );
    }
    if (methodFilter !== 'All') {
      result = result.filter(p => p.method === methodFilter);
    }
    result.sort((a, b) => sortDir === 'desc' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime());
    return result;
  }, [searchQuery, methodFilter, sortDir, usingLive]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">{usingLive ? totalCount : filteredMockPayments.length} transactions</p>
            {usingLive ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium">
                <Wifi className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium">
                <WifiOff className="w-3 h-3" /> Demo
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 self-start">
          {isConfigured && (
            <button onClick={fetchPayments} disabled={erpLoading} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${erpLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Statement
          </button>
        </div>
      </div>

      {erpError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <WifiOff className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Using demo data</p>
            <p className="text-xs text-amber-600 mt-0.5">{erpError}</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {usingLive ? `PGK ${liveTotalPaid.toLocaleString('en', { minimumFractionDigits: 2 })}` : formatCurrency(totalPaid)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{usingLive ? erpPayments.length : mockPayments.length} transactions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {usingLive ? '-' : formatCurrency(thisMonthPaid)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Data Source</p>
          <div className="flex items-center gap-2 mt-2">
            {usingLive ? <Wifi className="w-5 h-5 text-emerald-600" /> : <WifiOff className="w-5 h-5 text-amber-600" />}
            <p className="text-lg font-bold text-gray-900">{usingLive ? 'ERPNext Live' : 'Demo Data'}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by payment ID or reference..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <button
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {sortDir === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            {sortDir === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
        {!usingLive && (
          <div className="flex flex-wrap gap-2 mt-3">
            {methods.map(m => (
              <button key={m} onClick={() => setMethodFilter(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  methodFilter === m ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >{m}</button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {erpLoading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Fetching payments from ERPNext...</p>
        </div>
      )}

      {/* Payment Cards */}
      {!erpLoading && (
        <div className="space-y-3">
          {usingLive ? erpPayments.map((payment) => {
            const Icon = methodIcons[payment.mode_of_payment] || CreditCard;
            return (
              <div key={payment.name} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{payment.name}</p>
                        <StatusBadge status={mapPaymentStatus(payment.status, payment.docstatus)} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Party: <span className="text-red-600 font-medium">{payment.party_name}</span>
                      </p>
                      {payment.reference_no && (
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{payment.reference_no}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      {payment.paid_from_account_currency || 'PGK'} {Number(payment.paid_amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatERPDate(payment.posting_date)}</p>
                    <p className="text-xs text-gray-400">{payment.mode_of_payment || 'N/A'}</p>
                  </div>
                </div>
              </div>
            );
          }) : filteredMockPayments.map((payment) => {
            const Icon = methodIcons[payment.method] || CreditCard;
            return (
              <div key={payment.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{payment.id}</p>
                        <StatusBadge status={payment.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Invoice: <span className="text-red-600 font-medium">{payment.invoiceId}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{payment.reference}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(payment.date)}</p>
                    <p className="text-xs text-gray-400">{payment.method}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(usingLive ? erpPayments : filteredMockPayments).length === 0 && !erpLoading && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No payments found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {usingLive && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-5 py-3">
          <p className="text-sm text-gray-500">
            Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700 font-medium px-2">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsView;
