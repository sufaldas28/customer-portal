import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw, Plus, X, Package, ChevronRight, AlertCircle,
  Loader2, RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import { returnRequests, orders as mockOrders, formatCurrency, formatDate, ReturnRequest } from '@/data/portalData';
import { useERPNext, formatERPDate } from '@/hooks/useERPNext';
import { useERPNextSettings } from '@/contexts/ERPNextContext';
import StatusBadge from './StatusBadge';

const ReturnsView: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>(returnRequests);
  const [showForm, setShowForm] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [formData, setFormData] = useState({ orderId: '', itemName: '', qty: 1, reason: '' });
  const [formError, setFormError] = useState('');

  // ERPNext state
  const [erpReturns, setErpReturns] = useState<any[]>([]);
  const [erpLoading, setErpLoading] = useState(false);
  const [erpError, setErpError] = useState<string | null>(null);
  const [usingLive, setUsingLive] = useState(false);

  const { getList } = useERPNext();
  const { isConfigured, settings } = useERPNextSettings();

  const fetchReturns = useCallback(async () => {
    if (!isConfigured) return;
    setErpLoading(true);
    setErpError(null);

    try {
      const filters: any[] = [['is_return', '=', 1], ['docstatus', '=', 1]];
      if (settings?.customer_id) {
        filters.push(['customer', '=', settings.customer_id]);
      }

      const result = await getList('Sales Invoice', {
        fields: ['name', 'posting_date', 'grand_total', 'status', 'customer_name', 'return_against', 'outstanding_amount'],
        filters,
        order_by: 'posting_date desc',
        limit_page_length: 50
      });

      if (result.success && result.data) {
        setErpReturns(result.data);
        setUsingLive(true);
      } else {
        setErpError(result.error || 'Failed to fetch returns');
        setUsingLive(false);
      }
    } catch (err: any) {
      setErpError(err.message);
      setUsingLive(false);
    } finally {
      setErpLoading(false);
    }
  }, [isConfigured, settings, getList]);

  useEffect(() => {
    if (isConfigured) {
      fetchReturns();
    }
  }, [fetchReturns, isConfigured]);

  const eligibleOrders = mockOrders.filter(o => o.status === 'Delivered');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId || !formData.itemName || !formData.reason) {
      setFormError('Please fill in all required fields.');
      return;
    }
    const newReturn: ReturnRequest = {
      id: `RET-2026-${String(returns.length + 20).padStart(4, '0')}`,
      orderId: formData.orderId,
      date: new Date().toISOString().split('T')[0],
      status: 'Requested',
      items: [{ name: formData.itemName, qty: formData.qty, reason: formData.reason }],
      refundAmount: 0,
      refundMethod: 'Pending',
    };
    setReturns([newReturn, ...returns]);
    setShowForm(false);
    setFormData({ orderId: '', itemName: '', qty: 1, reason: '' });
    setFormError('');
  };

  const selectedOrderItems = formData.orderId
    ? mockOrders.find(o => o.id === formData.orderId)?.items || []
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Returns & Refunds</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">{usingLive ? erpReturns.length : returns.length} return requests</p>
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
            <button onClick={fetchReturns} disabled={erpLoading} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${erpLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Return Request
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Returns', value: usingLive ? erpReturns.length : returns.length, color: 'text-gray-900' },
          { label: 'Pending', value: usingLive ? 0 : returns.filter(r => r.status === 'Requested' || r.status === 'Approved').length, color: 'text-amber-600' },
          { label: 'Refunded', value: usingLive ? erpReturns.length : returns.filter(r => r.status === 'Refunded').length, color: 'text-emerald-600' },
          { label: 'Total Refunds', value: usingLive ? `PGK ${erpReturns.reduce((s, r) => s + Math.abs(Number(r.grand_total || 0)), 0).toLocaleString('en', { minimumFractionDigits: 2 })}` : formatCurrency(returns.filter(r => r.status === 'Refunded').reduce((s, r) => s + r.refundAmount, 0)), color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {erpLoading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Fetching returns from ERPNext...</p>
        </div>
      )}

      {/* Return Cards */}
      {!erpLoading && (
        <div className="space-y-4">
          {usingLive ? erpReturns.map((ret) => (
            <div key={ret.name} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:shadow-gray-100/50 transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <RotateCcw className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{ret.name}</p>
                        <StatusBadge status="Refunded" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Return against: <span className="text-red-600 font-medium">{ret.return_against}</span> &middot; {formatERPDate(ret.posting_date)}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        PGK {Math.abs(Number(ret.grand_total)).toLocaleString('en', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : returns.map((ret) => (
            <div key={ret.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:shadow-gray-100/50 transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      ret.status === 'Refunded' ? 'bg-emerald-100' :
                      ret.status === 'Rejected' ? 'bg-red-100' :
                      ret.status === 'Requested' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      <RotateCcw className={`w-5 h-5 ${
                        ret.status === 'Refunded' ? 'text-emerald-600' :
                        ret.status === 'Rejected' ? 'text-red-600' :
                        ret.status === 'Requested' ? 'text-amber-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{ret.id}</p>
                        <StatusBadge status={ret.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Order: <span className="text-red-600 font-medium">{ret.orderId}</span> &middot; {formatDate(ret.date)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReturn(selectedReturn?.id === ret.id ? null : ret)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedReturn?.id === ret.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                <div className="mt-3">
                  {ret.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm ml-[60px]">
                      <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{item.name} (x{item.qty})</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReturn?.id === ret.id && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-3">
                  {ret.items.map((item, i) => (
                    <div key={i}>
                      <p className="text-xs font-medium text-gray-500">Reason</p>
                      <p className="text-sm text-gray-700 mt-0.5">{item.reason}</p>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Refund Amount</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatCurrency(ret.refundAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Refund Method</p>
                      <p className="text-sm text-gray-700 mt-0.5">{ret.refundMethod}</p>
                    </div>
                  </div>

                  <div className="pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-3">Progress</p>
                    <div className="flex items-center gap-1">
                      {['Requested', 'Approved', 'Picked Up', 'Refunded'].map((step, i) => {
                        const statusOrder = ['Requested', 'Approved', 'Picked Up', 'Refunded'];
                        const currentIndex = statusOrder.indexOf(ret.status);
                        const isCompleted = ret.status === 'Rejected' ? i === 0 : i <= currentIndex;
                        const isRejected = ret.status === 'Rejected' && i === 1;
                        return (
                          <React.Fragment key={step}>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 ${
                              isRejected ? 'bg-red-100 text-red-600 border-2 border-red-300' :
                              isCompleted ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {i + 1}
                            </div>
                            {i < 3 && (
                              <div className={`flex-1 h-0.5 ${isCompleted && i < currentIndex ? 'bg-red-600' : 'bg-gray-200'}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {['Requested', 'Approved', 'Picked Up', 'Refunded'].map((step) => (
                        <span key={step} className="text-[10px] text-gray-400 text-center" style={{ width: '60px' }}>{step}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Return Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">New Return Request</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Order *</label>
                <select
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value, itemName: '' })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="">Choose an order...</option>
                  {eligibleOrders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {formatDate(o.date)} ({formatCurrency(o.total)})</option>
                  ))}
                </select>
              </div>

              {formData.orderId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Item *</label>
                  <select
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="">Choose an item...</option>
                    {selectedOrderItems.map((item, i) => (
                      <option key={i} value={item.name}>{item.name} (x{item.qty})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Return *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  placeholder="Describe the reason for your return..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsView;
