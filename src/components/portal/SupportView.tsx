import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, X, MessageSquare, Clock, AlertCircle, ChevronRight,
  Send, Search, LifeBuoy, Loader2, RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import { supportTickets as initialTickets, formatDate, SupportTicket } from '@/data/portalData';
import { useERPNext, formatERPDate } from '@/hooks/useERPNext';
import { useERPNextSettings } from '@/contexts/ERPNextContext';
import StatusBadge from './StatusBadge';

const SupportView: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [newMessage, setNewMessage] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    message: '',
  });
  const [formError, setFormError] = useState('');

  // ERPNext state
  const [erpIssues, setErpIssues] = useState<any[]>([]);
  const [erpLoading, setErpLoading] = useState(false);
  const [erpError, setErpError] = useState<string | null>(null);
  const [usingLive, setUsingLive] = useState(false);

  const { getList } = useERPNext();
  const { isConfigured, settings } = useERPNextSettings();

  const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  const categories = ['Billing', 'Shipping', 'Sales', 'Warranty', 'Account', 'Technical', 'Other'];

  const fetchIssues = useCallback(async () => {
    if (!isConfigured) return;
    setErpLoading(true);
    setErpError(null);

    try {
      const filters: any[] = [];
      if (settings?.customer_id) {
        filters.push(['customer', '=', settings.customer_id]);
      }
      if (statusFilter !== 'All') {
        filters.push(['status', '=', statusFilter]);
      }
      if (searchQuery) {
        filters.push(['subject', 'like', `%${searchQuery}%`]);
      }

      const result = await getList('Issue', {
        fields: ['name', 'subject', 'status', 'priority', 'creation', 'modified', 'issue_type', 'customer'],
        filters,
        order_by: 'modified desc',
        limit_page_length: 50
      });

      if (result.success && result.data) {
        setErpIssues(result.data);
        setUsingLive(true);
      } else {
        setErpError(result.error || 'Failed to fetch issues');
        setUsingLive(false);
      }
    } catch (err: any) {
      setErpError(err.message);
      setUsingLive(false);
    } finally {
      setErpLoading(false);
    }
  }, [isConfigured, settings, statusFilter, searchQuery, getList]);

  useEffect(() => {
    if (isConfigured) {
      fetchIssues();
    }
  }, [fetchIssues, isConfigured]);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = !searchQuery || t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.category || !formData.message) {
      setFormError('Please fill in all required fields.');
      return;
    }
    const newTicket: SupportTicket = {
      id: `TKT-2026-${String(tickets.length + 100).padStart(4, '0')}`,
      subject: formData.subject,
      category: formData.category,
      priority: formData.priority,
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      messages: [{
        sender: 'Customer',
        message: formData.message,
        date: new Date().toLocaleString(),
        isAgent: false,
      }],
    };
    setTickets([newTicket, ...tickets]);
    setShowForm(false);
    setFormData({ subject: '', category: '', priority: 'Medium', message: '' });
    setFormError('');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    if (usingLive) return; // Can't send messages to ERPNext issues from here
    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, {
        sender: 'Customer',
        message: newMessage,
        date: new Date().toLocaleString(),
        isAgent: false,
      }],
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setNewMessage('');
  };

  const displayTickets = usingLive ? erpIssues : filteredTickets;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">{displayTickets.length} tickets</p>
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
            <button onClick={fetchIssues} disabled={erpLoading} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${erpLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Ticket
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: usingLive ? erpIssues.filter(i => i.status === 'Open').length : tickets.filter(t => t.status === 'Open').length, color: 'text-amber-600' },
          { label: 'In Progress', value: usingLive ? erpIssues.filter(i => i.status === 'Replied').length : tickets.filter(t => t.status === 'In Progress').length, color: 'text-blue-600' },
          { label: 'Resolved', value: usingLive ? erpIssues.filter(i => i.status === 'Resolved').length : tickets.filter(t => t.status === 'Resolved').length, color: 'text-emerald-600' },
          { label: 'Closed', value: usingLive ? erpIssues.filter(i => i.status === 'Closed').length : tickets.filter(t => t.status === 'Closed').length, color: 'text-gray-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {erpLoading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Fetching support tickets from ERPNext...</p>
        </div>
      )}

      {/* Two-column layout */}
      {!erpLoading && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Ticket List */}
          <div className="xl:col-span-2 space-y-3">
            {usingLive ? erpIssues.map((issue) => (
              <button
                key={issue.name}
                onClick={() => setSelectedTicket(issue)}
                className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-md hover:shadow-gray-100/50 transition-all ${
                  selectedTicket?.name === issue.name ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{issue.name}</span>
                      <StatusBadge status={issue.priority || 'Medium'} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-1.5 truncate">{issue.subject}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{issue.issue_type || 'General'}</span>
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{formatERPDate(issue.modified)}</span>
                  </div>
                </div>
              </button>
            )) : filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-md hover:shadow-gray-100/50 transition-all ${
                  selectedTicket?.id === ticket.id ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{ticket.id}</span>
                      <StatusBadge status={ticket.priority} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-1.5 truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{ticket.category}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{formatDate(ticket.lastUpdate)}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.messages.length}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {displayTickets.length === 0 && !erpLoading && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No tickets found</p>
              </div>
            )}
          </div>

          {/* Ticket Detail */}
          <div className="xl:col-span-3">
            {selectedTicket ? (
              <div className="bg-white rounded-xl border border-gray-100 flex flex-col h-[600px]">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{usingLive ? selectedTicket.name : selectedTicket.id}</span>
                        <StatusBadge status={usingLive ? selectedTicket.status : selectedTicket.status} />
                        <StatusBadge status={usingLive ? (selectedTicket.priority || 'Medium') : selectedTicket.priority} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mt-2">{selectedTicket.subject}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {usingLive ? `${selectedTicket.issue_type || 'General'} · Created ${formatERPDate(selectedTicket.creation)}` : `${selectedTicket.category} · Created ${formatDate(selectedTicket.createdDate)}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors xl:hidden"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {usingLive ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Issue details loaded from ERPNext</p>
                      <p className="text-xs text-gray-400 mt-1">Full conversation thread available in ERPNext</p>
                    </div>
                  ) : selectedTicket.messages?.map((msg: any, i: number) => (
                    <div key={i} className={`flex ${msg.isAgent ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.isAgent
                          ? 'bg-gray-100 rounded-tl-sm'
                          : 'bg-red-600 text-white rounded-tr-sm'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${msg.isAgent ? 'text-gray-700' : 'text-red-100'}`}>
                            {msg.sender}
                          </span>
                        </div>
                        <p className={`text-sm ${msg.isAgent ? 'text-gray-700' : 'text-white'}`}>{msg.message}</p>
                        <p className={`text-[10px] mt-2 ${msg.isAgent ? 'text-gray-400' : 'text-red-200'}`}>{msg.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {!usingLive && selectedTicket.status !== 'Closed' && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Select a ticket to view details</p>
                  <p className="text-sm text-gray-400 mt-1">Choose from the list on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Support Ticket</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportView;
