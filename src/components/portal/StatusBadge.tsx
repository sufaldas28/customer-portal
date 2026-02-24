import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusColors: Record<string, string> = {
  // Order statuses
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Confirmed': 'bg-blue-50 text-blue-700 border-blue-200',
  'Processing': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Shipped': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200',
  // Invoice statuses
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Unpaid': 'bg-amber-50 text-amber-700 border-amber-200',
  'Overdue': 'bg-red-50 text-red-700 border-red-200',
  'Partially Paid': 'bg-orange-50 text-orange-700 border-orange-200',
  // Payment statuses
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Failed': 'bg-red-50 text-red-700 border-red-200',
  'Refunded': 'bg-purple-50 text-purple-700 border-purple-200',
  // Return statuses
  'Requested': 'bg-amber-50 text-amber-700 border-amber-200',
  'Approved': 'bg-blue-50 text-blue-700 border-blue-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
  'Picked Up': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  // Ticket statuses
  'Open': 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Closed': 'bg-gray-50 text-gray-600 border-gray-200',
  // Priority
  'Low': 'bg-gray-50 text-gray-600 border-gray-200',
  'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
  'High': 'bg-orange-50 text-orange-700 border-orange-200',
  'Critical': 'bg-red-50 text-red-700 border-red-200',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const colorClass = statusColors[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Delivered' || status === 'Paid' || status === 'Completed' || status === 'Resolved' ? 'bg-emerald-500' :
        status === 'Cancelled' || status === 'Failed' || status === 'Rejected' || status === 'Overdue' || status === 'Critical' ? 'bg-red-500' :
        status === 'Shipped' || status === 'Approved' || status === 'Confirmed' || status === 'In Progress' ? 'bg-blue-500' :
        status === 'Refunded' || status === 'Picked Up' ? 'bg-purple-500' :
        'bg-amber-500'
      }`} />
      {status}
    </span>
  );
};

export default StatusBadge;
