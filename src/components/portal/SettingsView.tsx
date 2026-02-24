import React, { useState, useEffect } from 'react';
import {
  Settings, Wifi, WifiOff, RefreshCw, CheckCircle2, XCircle,
  Loader2, Database, Server, Shield, User, AlertTriangle, Link2
} from 'lucide-react';
import { useERPNext } from '@/hooks/useERPNext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { testConnection, getList, loading: erpLoading } = useERPNext();
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error' | 'testing'>('unknown');
  const [connectedUser, setConnectedUser] = useState<string>('');
  const [connError, setConnError] = useState<string>('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('erpnext_settings')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (data) {
        setSettings(data);
        setCustomerId(data.customer_id || '');
        setCustomerName(data.customer_name || '');
        if (data.is_connected) {
          setConnectionStatus('connected');
        }
      }
    };
    loadSettings();
  }, [user]);

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnError('');
    setConnectedUser('');

    const result = await testConnection();
    if (result.success) {
      setConnectionStatus('connected');
      setConnectedUser(typeof result.data === 'string' ? result.data : result.data?.message || 'Connected');
    } else {
      setConnectionStatus('error');
      setConnError(result.error || 'Connection failed');
    }
  };

  const handleFetchCustomers = async () => {
    setLoadingCustomers(true);
    const result = await getList('Customer', {
      fields: ['name', 'customer_name', 'customer_group', 'territory'],
      order_by: 'customer_name asc',
      limit_page_length: 100
    });
    if (result.success && result.data) {
      setCustomers(result.data);
    }
    setLoadingCustomers(false);
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    const settingsData = {
      auth_user_id: user.id,
      customer_id: customerId,
      customer_name: customerName,
      is_connected: connectionStatus === 'connected',
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (settings?.id) {
      await supabase
        .from('erpnext_settings')
        .update(settingsData)
        .eq('id', settings.id);
    } else {
      await supabase
        .from('erpnext_settings')
        .insert(settingsData);
    }

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Configure your ERPNext integration and portal preferences</p>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              connectionStatus === 'connected' ? 'bg-emerald-100' :
              connectionStatus === 'error' ? 'bg-red-100' :
              connectionStatus === 'testing' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {connectionStatus === 'connected' ? <Wifi className="w-5 h-5 text-emerald-600" /> :
               connectionStatus === 'error' ? <WifiOff className="w-5 h-5 text-red-600" /> :
               connectionStatus === 'testing' ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> :
               <Server className="w-5 h-5 text-gray-500" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">ERPNext Connection</h3>
              <p className="text-sm text-gray-500">
                {connectionStatus === 'connected' ? `Connected as ${connectedUser}` :
                 connectionStatus === 'error' ? 'Connection failed' :
                 connectionStatus === 'testing' ? 'Testing connection...' :
                 'Not tested yet'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              )}
              {connectionStatus === 'error' && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                  <XCircle className="w-3.5 h-3.5" /> Failed
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Server-Side Configuration</p>
                <p className="text-xs text-gray-500 mt-1">
                  ERPNext API credentials (Base URL, API Key, and API Secret) are securely stored as server-side environment variables. 
                  They are never exposed to the browser. Contact your administrator to update these credentials.
                </p>
              </div>
            </div>
          </div>

          {connError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">Connection Error</p>
                <p className="text-xs text-red-600 mt-0.5">{connError}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleTestConnection}
            disabled={connectionStatus === 'testing'}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {connectionStatus === 'testing' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> Test Connection</>
            )}
          </button>
        </div>
      </div>

      {/* Customer Mapping */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Mapping</h3>
              <p className="text-sm text-gray-500">Link your portal account to an ERPNext customer</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer ID</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g., CUST-00001 or Customer Name"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <button
                onClick={handleFetchCustomers}
                disabled={loadingCustomers || connectionStatus !== 'connected'}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingCustomers ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                Browse
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Enter your ERPNext Customer ID or click Browse to select from available customers</p>
          </div>

          {customers.length > 0 && (
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">ID</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Name</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Group</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((c) => (
                    <tr key={c.name} className={`hover:bg-gray-50 transition-colors ${customerId === c.name ? 'bg-teal-50' : ''}`}>
                      <td className="px-4 py-2.5 text-sm font-mono text-gray-700">{c.name}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-900">{c.customer_name}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500">{c.customer_group}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => { setCustomerId(c.name); setCustomerName(c.customer_name); }}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            customerId === c.name
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {customerId === c.name ? 'Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {customerId && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Linked to: <strong>{customerId}</strong>
                {customerName && <span className="text-blue-600"> ({customerName})</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Data Sync Settings */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Data Sync</h3>
              <p className="text-sm text-gray-500">Configure how data is fetched from ERPNext</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Sales Orders</p>
              <p className="text-xs text-gray-500 mt-1">Fetched in real-time from ERPNext</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Live</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Sales Invoices</p>
              <p className="text-xs text-gray-500 mt-1">Fetched in real-time from ERPNext</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Live</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Payment Entries</p>
              <p className="text-xs text-gray-500 mt-1">Fetched in real-time from ERPNext</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Live</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Customer Data</p>
              <p className="text-xs text-gray-500 mt-1">Synced on login and manual refresh</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-blue-600 font-medium">On Demand</span>
              </div>
            </div>
          </div>

          {settings?.last_sync_at && (
            <p className="text-xs text-gray-400">
              Last synced: {new Date(settings.last_sync_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Settings className="w-4 h-4" /> Save Settings</>
          )}
        </button>
        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <CheckCircle2 className="w-4 h-4" /> Settings saved successfully
          </span>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
