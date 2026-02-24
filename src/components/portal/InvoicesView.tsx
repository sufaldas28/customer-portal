import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Filter, Download, Eye, FileText, X,
  ArrowUpDown, ChevronDown, ChevronUp, Printer,
  Loader2, RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight
} from 'lucide-react';
import { invoices as mockInvoices, formatCurrency, formatDate, Invoice } from '@/data/portalData';
import { useERPNext, formatERPDate, mapInvoiceStatus } from '@/hooks/useERPNext';
import { useERPNextSettings } from '@/contexts/ERPNextContext';
import StatusBadge from './StatusBadge';

const InvoicesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'total' | 'amountDue'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [erpInvoices, setErpInvoices] = useState<any[]>([]);
  const [erpLoading, setErpLoading] = useState(false);
  const [erpError, setErpError] = useState<string | null>(null);
  const [usingLive, setUsingLive] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [invoiceDetail, setInvoiceDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 20;

  const { getList, getDoc, getCount } = useERPNext();
  const { isConfigured, settings } = useERPNextSettings();

  const statuses = ['All', 'Paid', 'Unpaid', 'Overdue', 'Partially Paid'];

  const fetchInvoices = useCallback(async () => {
    if (!isConfigured) return;
    setErpLoading(true);
    setErpError(null);

    try {
      const filters: any[] = [['docstatus', '=', 1]];
      if (settings?.customer_id) {
        filters.push(['customer', '=', settings.customer_id]);
      }
      if (statusFilter === 'Paid') {
        filters.push(['outstanding_amount', '=', 0]);
      } else if (statusFilter === 'Unpaid') {
        filters.push(['outstanding_amount', '>', 0], ['status', '!=', 'Overdue']);
      } else if (statusFilter === 'Overdue') {
        filters.push(['status', '=', 'Overdue']);
      } else if (statusFilter === 'Partially Paid') {
        filters.push(['outstanding_amount', '>', 0], ['outstanding_amount', '<', ['grand_total']]);
      }
      if (searchQuery) {
        filters.push(['name', 'like', `%${searchQuery}%`]);
      }

      const orderByField = sortField === 'date' ? 'posting_date' : sortField === 'total' ? 'grand_total' : 'outstanding_amount';
      const orderBy = `${orderByField} ${sortDir}`;

      const [listResult, countResult] = await Promise.all([
        getList('Sales Invoice', {
          fields: ['name', 'posting_date', 'due_date', 'grand_total', 'outstanding_amount', 'paid_amount', 'status', 'customer_name', 'currency'],
          filters,
          order_by: orderBy,
          limit_page_length: pageSize,
          limit_start: page * pageSize
        }),
        getCount('Sales Invoice', filters)
      ]);

      if (listResult.success && listResult.data) {
        setErpInvoices(listResult.data);
        setUsingLive(true);
      } else {
        setErpError(listResult.error || 'Failed to fetch invoices');
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
  }, [isConfigured, settings, statusFilter, searchQuery, sortField, sortDir, page, getList, getCount]);

  useEffect(() => {
    if (isConfigured) {
      fetchInvoices();
    }
  }, [fetchInvoices, isConfigured]);

  const fetchInvoiceDetail = async (invName: string) => {
    setDetailLoading(true);
    const result = await getDoc('Sales Invoice', invName);
    if (result.success && result.data) {
      setInvoiceDetail(result.data);
    }
    setDetailLoading(false);
  };

  // Fallback mock data
  const totalOutstanding = mockInvoices.reduce((s, i) => s + i.amountDue, 0);
  const overdueAmount = mockInvoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amountDue, 0);
  const paidThisMonth = mockInvoices.filter(i => i.status === 'Paid' && i.date >= '2026-02-01').reduce((s, i) => s + i.total, 0);

  // Live summary
  const liveTotalOutstanding = erpInvoices.reduce((s, i) => s + Number(i.outstanding_amount || 0), 0);
  const liveOverdue = erpInvoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + Number(i.outstanding_amount || 0), 0);

  const filteredMockInvoices = useMemo(() => {
    if (usingLive) return [];
    let result = [...mockInvoices];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.id.toLowerCase().includes(q) || i.orderId.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') {
      result = result.filter(i => i.status === statusFilter);
    }
    result.sort((a, b) => {
      if (sortField === 'date') {
        return sortDir === 'desc' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      const aVal = a[sortField as keyof Invoice] as number;
      const bVal = b[sortField as keyof Invoice] as number;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return result;
  }, [searchQuery, statusFilter, sortField, sortDir, usingLive]);

  const toggleSort = (field: 'date' | 'total' | 'amountDue') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortDir === 'desc' ? <ChevronDown className="w-3.5 h-3.5 text-red-600" /> : <ChevronUp className="w-3.5 h-3.5 text-red-600" />;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">{usingLive ? totalCount : filteredMockInvoices.length} invoices</p>
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
            <button onClick={fetchInvoices} disabled={erpLoading} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${erpLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export All
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {usingLive ? `PGK ${liveTotalOutstanding.toLocaleString('en', { minimumFractionDigits: 2 })}` : formatCurrency(totalOutstanding)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <p className="text-sm text-red-600">Overdue Amount</p>
          <p className="text-2xl font-bold text-red-700 mt-1">
            {usingLive ? `PGK ${liveOverdue.toLocaleString('en', { minimumFractionDigits: 2 })}` : formatCurrency(overdueAmount)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-5">
          <p className="text-sm text-emerald-600">Paid This Month</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {usingLive ? '-' : formatCurrency(paidThisMonth)}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {erpLoading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Fetching invoices from ERPNext...</p>
        </div>
      )}

      {/* Table */}
      {!erpLoading && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('date')}>
                    <span className="flex items-center gap-1.5">Date <SortIcon field="date" /></span>
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Due Date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('total')}>
                    <span className="flex items-center justify-end gap-1.5">Total <SortIcon field="total" /></span>
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hidden sm:table-cell" onClick={() => toggleSort('amountDue')}>
                    <span className="flex items-center justify-end gap-1.5">Due <SortIcon field="amountDue" /></span>
                  </th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usingLive ? erpInvoices.map((inv) => (
                  <tr key={inv.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{inv.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatERPDate(inv.posting_date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden lg:table-cell">{formatERPDate(inv.due_date)}</td>
                    <td className="px-5 py-4"><StatusBadge status={mapInvoiceStatus(inv.status, Number(inv.outstanding_amount))} /></td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                      {inv.currency || 'PGK'} {Number(inv.grand_total).toLocaleString('en', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold hidden sm:table-cell">
                      <span className={Number(inv.outstanding_amount) > 0 ? 'text-amber-600' : 'text-gray-400'}>
                        {Number(inv.outstanding_amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelectedInvoice(inv); fetchInvoiceDetail(inv.name); }} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : filteredMockInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{inv.id}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatDate(inv.date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden lg:table-cell">{formatDate(inv.dueDate)}</td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-4 text-right text-sm font-semibold hidden sm:table-cell">
                      <span className={inv.amountDue > 0 ? 'text-amber-600' : 'text-gray-400'}>{formatCurrency(inv.amountDue)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedInvoice(inv)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(usingLive ? erpInvoices : filteredMockInvoices).length === 0 && !erpLoading && (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No invoices found</p>
            </div>
          )}
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

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setSelectedInvoice(null); setInvoiceDetail(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{usingLive ? selectedInvoice.name : selectedInvoice.id}</h3>
                <p className="text-sm text-gray-500">{usingLive ? selectedInvoice.customer_name : `Order: ${selectedInvoice.orderId}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><Printer className="w-5 h-5" /></button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><Download className="w-5 h-5" /></button>
                <button onClick={() => { setSelectedInvoice(null); setInvoiceDetail(null); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {detailLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 text-red-600 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading invoice details...</p>
                </div>
              ) : usingLive && invoiceDetail ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Invoice Date</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{formatERPDate(invoiceDetail.posting_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{formatERPDate(invoiceDetail.due_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="mt-1"><StatusBadge status={mapInvoiceStatus(invoiceDetail.status, Number(invoiceDetail.outstanding_amount))} /></div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Outstanding</p>
                      <p className={`text-sm font-bold mt-0.5 ${Number(invoiceDetail.outstanding_amount) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {invoiceDetail.currency || 'PGK'} {Number(invoiceDetail.outstanding_amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {invoiceDetail.items && (
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Description</th>
                            <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Qty</th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Rate</th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {invoiceDetail.items.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.item_name || item.description}</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">{item.qty}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">{Number(item.rate).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{Number(item.amount).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Grand Total</span>
                      <span className="font-medium text-gray-900">{invoiceDetail.currency || 'PGK'} {Number(invoiceDetail.grand_total).toLocaleString('en', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Paid Amount</span>
                      <span className="font-medium text-emerald-600">{Number(invoiceDetail.grand_total - invoiceDetail.outstanding_amount).toLocaleString('en', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Balance Due</span>
                      <span className="font-bold text-lg text-gray-900">{invoiceDetail.currency || 'PGK'} {Number(invoiceDetail.outstanding_amount).toLocaleString('en', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {Number(invoiceDetail.outstanding_amount) > 0 && (
                    <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                      Pay {invoiceDetail.currency || 'PGK'} {Number(invoiceDetail.outstanding_amount).toLocaleString('en', { minimumFractionDigits: 2 })} Now
                    </button>
                  )}
                </>
              ) : !usingLive && selectedInvoice ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div><p className="text-xs text-gray-500">Invoice Date</p><p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(selectedInvoice.date)}</p></div>
                    <div><p className="text-xs text-gray-500">Due Date</p><p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(selectedInvoice.dueDate)}</p></div>
                    <div><p className="text-xs text-gray-500">Status</p><div className="mt-1"><StatusBadge status={selectedInvoice.status} /></div></div>
                    <div><p className="text-xs text-gray-500">Amount Due</p><p className={`text-sm font-bold mt-0.5 ${selectedInvoice.amountDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{formatCurrency(selectedInvoice.amountDue)}</p></div>
                  </div>
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Description</th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Qty</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Rate</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Amount</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedInvoice.items.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">{item.qty}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(item.rate)}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium text-gray-900">{formatCurrency(selectedInvoice.total)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Amount Paid</span><span className="font-medium text-emerald-600">{formatCurrency(selectedInvoice.amountPaid)}</span></div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200"><span className="font-semibold text-gray-900">Balance Due</span><span className="font-bold text-lg text-gray-900">{formatCurrency(selectedInvoice.amountDue)}</span></div>
                  </div>
                  {selectedInvoice.amountDue > 0 && (
                    <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">Pay {formatCurrency(selectedInvoice.amountDue)} Now</button>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesView;
