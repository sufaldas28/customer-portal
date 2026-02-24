import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Filter, ChevronDown, ChevronUp, Eye, Package,
  Truck, MapPin, Calendar, X, Download, ArrowUpDown, Loader2,
  RefreshCw, ChevronLeft, ChevronRight, Wifi, WifiOff
} from 'lucide-react';
import { orders as mockOrders, formatCurrency, formatDate, Order } from '@/data/portalData';
import { useERPNext, formatERPDate, mapOrderStatus } from '@/hooks/useERPNext';
import { useERPNextSettings } from '@/contexts/ERPNextContext';
import StatusBadge from './StatusBadge';

const OrdersView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'total'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [erpOrders, setErpOrders] = useState<any[]>([]);
  const [erpLoading, setErpLoading] = useState(false);
  const [erpError, setErpError] = useState<string | null>(null);
  const [usingLive, setUsingLive] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 20;

  const { getList, getDoc, getCount } = useERPNext();
  const { isConfigured, settings } = useERPNextSettings();

  const statuses = ['All', 'Draft', 'To Deliver and Bill', 'To Bill', 'To Deliver', 'Completed', 'Cancelled'];
  const displayStatuses = ['All', 'Pending', 'Processing', 'Shipped', 'Confirmed', 'Delivered', 'Cancelled'];

  const fetchOrders = useCallback(async () => {
    if (!isConfigured) return;
    setErpLoading(true);
    setErpError(null);

    try {
      const filters: any[] = [];
      if (settings?.customer_id) {
        filters.push(['customer', '=', settings.customer_id]);
      }
      if (statusFilter !== 'All') {
        const erpStatus = statuses[displayStatuses.indexOf(statusFilter)];
        if (erpStatus && erpStatus !== 'All') {
          filters.push(['status', '=', erpStatus]);
        }
      }
      if (searchQuery) {
        filters.push(['name', 'like', `%${searchQuery}%`]);
      }

      const orderBy = sortField === 'date'
        ? `transaction_date ${sortDir}`
        : `grand_total ${sortDir}`;

      const [listResult, countResult] = await Promise.all([
        getList('Sales Order', {
          fields: ['name', 'transaction_date', 'grand_total', 'status', 'customer_name', 'delivery_date', 'payment_terms_template', 'currency', 'total_qty'],
          filters,
          order_by: orderBy,
          limit_page_length: pageSize,
          limit_start: page * pageSize
        }),
        getCount('Sales Order', filters)
      ]);

      if (listResult.success && listResult.data) {
        setErpOrders(listResult.data);
        setUsingLive(true);
      } else {
        setErpError(listResult.error || 'Failed to fetch orders');
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
      fetchOrders();
    }
  }, [fetchOrders, isConfigured]);

  const fetchOrderDetail = async (orderName: string) => {
    setDetailLoading(true);
    const result = await getDoc('Sales Order', orderName);
    if (result.success && result.data) {
      setOrderDetail(result.data);
    }
    setDetailLoading(false);
  };

  // Fallback to mock data
  const filteredMockOrders = useMemo(() => {
    if (usingLive) return [];
    let result = [...mockOrders];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }
    result.sort((a, b) => {
      if (sortField === 'date') {
        return sortDir === 'desc' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return sortDir === 'desc' ? b.total - a.total : a.total - b.total;
    });
    return result;
  }, [searchQuery, statusFilter, sortField, sortDir, usingLive]);

  const toggleSort = (field: 'date' | 'total') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: 'date' | 'total' }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortDir === 'desc' ? <ChevronDown className="w-3.5 h-3.5 text-red-600" /> : <ChevronUp className="w-3.5 h-3.5 text-red-600" />;
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const displayOrders = usingLive ? erpOrders : filteredMockOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">{usingLive ? totalCount : filteredMockOrders.length} orders found</p>
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
            <button
              onClick={fetchOrders}
              disabled={erpLoading}
              className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${erpLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Orders
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

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={usingLive ? "Search by order ID..." : "Search by order ID or product name..."}
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
              {(usingLive ? statuses : ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).map((s, i) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(usingLive ? displayStatuses[i] || s : s); setPage(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === (usingLive ? displayStatuses[i] || s : s)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {usingLive ? (displayStatuses[i] || s) : s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {erpLoading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Fetching orders from ERPNext...</p>
        </div>
      )}

      {/* Orders Table */}
      {!erpLoading && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('date')}>
                    <span className="flex items-center gap-1.5">Date <SortIcon field="date" /></span>
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    {usingLive ? 'Customer' : 'Items'}
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('total')}>
                    <span className="flex items-center justify-end gap-1.5">Amount <SortIcon field="total" /></span>
                  </th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usingLive ? erpOrders.map((order) => (
                  <tr key={order.name} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">{order.name}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatERPDate(order.transaction_date)}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-sm text-gray-700 truncate max-w-[250px]">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.total_qty || 0} items</p>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={mapOrderStatus(order.status)} /></td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                      {order.currency || 'PGK'} {Number(order.grand_total || 0).toLocaleString('en', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => { setSelectedOrder(order); fetchOrderDetail(order.name); }}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : filteredMockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatDate(order.date)}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-sm text-gray-700 truncate max-w-[250px]">{order.items.map(i => i.name).join(', ')}</p>
                      <p className="text-xs text-gray-400">{order.items.reduce((s, i) => s + i.qty, 0)} items</p>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayOrders.length === 0 && !erpLoading && (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination for live data */}
      {usingLive && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-5 py-3">
          <p className="text-sm text-gray-500">
            Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700 font-medium px-2">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setSelectedOrder(null); setOrderDetail(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order {usingLive ? selectedOrder.name : selectedOrder.id}</h3>
                <p className="text-sm text-gray-500">{usingLive ? formatERPDate(selectedOrder.transaction_date) : formatDate(selectedOrder.date)}</p>
              </div>
              <button onClick={() => { setSelectedOrder(null); setOrderDetail(null); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 text-red-600 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading order details...</p>
                </div>
              ) : usingLive && orderDetail ? (
                <>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Status:</span>
                      <StatusBadge status={mapOrderStatus(orderDetail.status || selectedOrder.status)} size="md" />
                    </div>
                    {orderDetail.delivery_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Delivery:</span>
                        <span className="font-medium text-gray-700">{formatERPDate(orderDetail.delivery_date)}</span>
                      </div>
                    )}
                  </div>

                  {orderDetail.customer_address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs font-medium mb-0.5">Shipping Address</p>
                        <p className="text-gray-700">{orderDetail.customer_address}</p>
                      </div>
                    </div>
                  )}

                  {orderDetail.items && orderDetail.items.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Item</th>
                              <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Qty</th>
                              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Rate</th>
                              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {orderDetail.items.map((item: any, i: number) => (
                              <tr key={i}>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-medium text-gray-900">{item.item_name || item.item_code}</p>
                                  <p className="text-xs text-gray-400">{item.item_code}</p>
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-600">{item.qty}</td>
                                <td className="px-4 py-3 text-right text-sm text-gray-600">{Number(item.rate).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{Number(item.amount).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50">
                              <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Grand Total</td>
                              <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                                {orderDetail.currency || 'PGK'} {Number(orderDetail.grand_total).toLocaleString('en', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Payment Terms: </span>
                      <span className="font-medium text-gray-900">{orderDetail.payment_terms_template || 'Standard'}</span>
                    </div>
                  </div>
                </>
              ) : !usingLive && selectedOrder ? (
                <>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Status:</span>
                      <StatusBadge status={selectedOrder.status} size="md" />
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Tracking:</span>
                        <span className="font-mono text-red-600 font-medium">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                  </div>

                  {selectedOrder.estimatedDelivery && (
                    <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700">Estimated delivery: <strong>{formatDate(selectedOrder.estimatedDelivery)}</strong></span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs font-medium mb-0.5">Shipping Address</p>
                      <p className="text-gray-700">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Item</th>
                            <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Qty</th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Rate</th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {selectedOrder.items.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="px-4 py-3">
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-400">{item.sku}</p>
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">{item.qty}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(item.rate)}</td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50">
                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</td>
                            <td className="px-4 py-3 text-right text-base font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Payment Method: </span>
                      <span className="font-medium text-gray-900">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
