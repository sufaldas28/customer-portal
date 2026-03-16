import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Filter, ChevronDown, ChevronUp, Eye, Package,
  Truck, MapPin, Calendar, X, Download, ArrowUpDown, Loader2,
  RefreshCw, ChevronLeft, ChevronRight, Wifi, WifiOff
} from 'lucide-react';
// import { orders as mockOrders, formatCurrency, formatDate, Order } from '@/data/portalData';
import { formatCurrency } from '@/data/portalData';
// import { useERPNext, formatERPDate, mapOrderStatus } from '@/hooks/useERPNext';
import { formatERPDate, mapOrderStatus } from '@/hooks/useERPNext';
import { useERPNextSettings } from '@/contexts/ERPNextContext';
import StatusBadge from './StatusBadge';
import {
  fetchSalesOrders,
  fetchSalesOrderDetail,
  fetchSalesOrderCount
} from "@/contexts/erpApi";

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
  // const [usingLive, setUsingLive] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 20;

  // const { getList, getDoc, getCount } = useERPNext();
  const { isConfigured, settings } = useERPNextSettings();

  const statuses = ['All', 'Draft', 'To Deliver and Bill', 'To Bill', 'To Deliver', 'Completed', 'Cancelled'];
  const displayStatuses = ['All', 'Pending', 'Processing', 'Shipped', 'Confirmed', 'Delivered', 'Cancelled'];

  const fetchOrders = useCallback(async () => {

  // if (!isConfigured) return;

  setErpLoading(true);
  setErpError(null);

  try {

    const orders = await fetchSalesOrders({
      page,
      pageSize,
      searchQuery,
      statusFilter,
      customerId: settings?.customer_id || "",
      sortField,
      sortDir
    });

    const count = await fetchSalesOrderCount();

    setErpOrders(orders);
    setTotalCount(count);

  } catch (err: any) {

    setErpError(err.message);
    setErpOrders([]);

  } finally {

    setErpLoading(false);

  }

}, [
  
  settings,
  statusFilter,
  searchQuery,
  sortField,
  sortDir,
  page
]);

  useEffect(() => {
    // if (isConfigured) {
      fetchOrders();
    // }
  }, [fetchOrders]);

  const fetchOrderDetail = async (orderName: string) => {

  setDetailLoading(true);

  try {

    const detail = await fetchSalesOrderDetail(orderName);
    setOrderDetail(detail);

  } catch (err) {

    console.error(err);

  } finally {

    setDetailLoading(false);

  }

};

 const exportOrders = () => {
  if (!displayOrders || displayOrders.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    "Order",
    "Date",
    "Customer",
    "Status",
    "Delivery Date",
    "Quantity",
    "Total"
  ];

  const rows = displayOrders.map((o) => [
    o.name,
    o.transaction_date,
    o.customer_name,
    o.status,
    o.delivery_date,
    o.total_qty,
    o.grand_total
  ]);

  const csvContent =
    [headers, ...rows]
      .map((e) => e.join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "orders.csv";
  link.click();
};

  // Fallback to mock data
  // const filteredMockOrders = useMemo(() => {
  //   if (usingLive) return [];
  //   let result = [...mockOrders];
  //   if (searchQuery) {
  //     const q = searchQuery.toLowerCase();
  //     result = result.filter(o =>
  //       o.id.toLowerCase().includes(q) ||
  //       o.items.some(i => i.name.toLowerCase().includes(q))
  //     );
  //   }
  //   if (statusFilter !== 'All') {
  //     result = result.filter(o => o.status === statusFilter);
  //   }
  //   result.sort((a, b) => {
  //     if (sortField === 'date') {
  //       return sortDir === 'desc' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime();
  //     }
  //     return sortDir === 'desc' ? b.total - a.total : a.total - b.total;
  //   });
  //   return result;
  // }, [searchQuery, statusFilter, sortField, sortDir, usingLive]);

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
  // const displayOrders = usingLive ? erpOrders : filteredMockOrders;
  const displayOrders = erpOrders;

  return (
  <div className="space-y-6">

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-gray-500">
            {totalCount} orders found
          </p>

          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium">
            <Wifi className="w-3 h-3" /> Live
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start">
        
          <button
            onClick={fetchOrders}
            disabled={erpLoading}
            className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${erpLoading ? "animate-spin" : ""}`} />
          </button>
        

        <button onClick={exportOrders} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Orders
        </button>
      </div>
    </div>

    {erpError && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <WifiOff className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">ERP connection error</p>
          <p className="text-xs text-amber-600 mt-0.5">{erpError}</p>
        </div>
      </div>
    )}

    {/* Search */}
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex flex-col sm:flex-row gap-3">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search by order ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
            showFilters
              ? "border-red-500 text-red-600 bg-red-50"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Status</p>

          <div className="flex flex-wrap gap-2">
            {displayStatuses.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Loading */}
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
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Customer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {erpOrders.map((order) => (
                <tr key={order.name} className="hover:bg-gray-50/50 transition-colors">

                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                    {order.name}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {formatERPDate(order.transaction_date)}
                  </td>

                  <td className="px-5 py-4 hidden lg:table-cell">
                    <p className="text-sm text-gray-700">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.total_qty || 0} items</p>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={mapOrderStatus(order.status)} />
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                    {order.currency || "PGK"}{" "}
                    {Number(order.grand_total || 0).toLocaleString("en", {
                      minimumFractionDigits: 2,
                    })}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        fetchOrderDetail(order.name);
                      }}
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
      </div>
    )}

    {/* Pagination */}
    {totalPages > 1 && (
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-5 py-3">
        <p className="text-sm text-gray-500">
          Showing {page * pageSize + 1}-
          {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
        </p>

        <div className="flex items-center gap-2">

          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm text-gray-700 font-medium px-2">
            Page {page + 1} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      </div>
    )}
{selectedOrder && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order {selectedOrder.name}
          </h3>
          <p className="text-sm text-gray-500">
            {formatERPDate(selectedOrder.transaction_date)}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedOrder(null);
            setOrderDetail(null);
          }}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">

        {detailLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          </div>
        )}

        {!detailLoading && orderDetail && (
          <>
            {/* Customer */}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">
                Customer
              </h4>
              <p className="text-gray-900">{orderDetail.customer_name}</p>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">
                Status
              </h4>
              <StatusBadge status={mapOrderStatus(orderDetail.status)} />
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-3">
                Items
              </h4>

              <div className="border rounded-lg divide-y">
                {orderDetail.items?.map((item: any) => (
                  <div
                    key={item.name}
                    className="flex justify-between px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.item_name}
                      </p>
                      <p className="text-gray-500">
                        Qty: {item.qty}
                      </p>
                    </div>

                    <div className="text-right font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between pt-4 border-t text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(orderDetail.grand_total)}</span>
            </div>
          </>
        )}

      </div>
    </div>
  </div>
)}
  </div>
);
};

export default OrdersView;
