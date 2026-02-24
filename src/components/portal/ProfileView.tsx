import React, { useState } from 'react';
import {
  User, Mail, Phone, Building2, MapPin, Plus, Edit2,
  Trash2, Shield, Bell, Save, X, Check, Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { customerProfile as defaultProfile, addresses as initialAddresses, formatCurrency, Address } from '@/data/portalData';

const ProfileView: React.FC = () => {
  const { profile, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'security' | 'preferences'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile?.full_name || defaultProfile.name,
    email: profile?.email || defaultProfile.email,
    phone: profile?.phone || defaultProfile.phone,
    company: profile?.company || defaultProfile.company,
  });
  const [addressList, setAddressList] = useState<Address[]>(initialAddresses);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: false,
    invoiceReminders: true,
    newsletter: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const displayName = profile?.full_name || defaultProfile.name;
  const displayEmail = profile?.email || defaultProfile.email;
  const displayPhone = profile?.phone || defaultProfile.phone;
  const displayCompany = profile?.company || defaultProfile.company;
  const displayCustomerId = profile?.customer_id || defaultProfile.customerId;
  const displayLoyaltyTier = profile?.loyalty_tier || defaultProfile.loyaltyTier;
  const displayTotalSpent = profile?.total_spent ?? defaultProfile.totalSpent;
  const displayMemberSince = profile?.member_since || defaultProfile.memberSince;

  const handleStartEdit = () => {
    setEditForm({
      name: displayName,
      email: displayEmail,
      phone: displayPhone,
      company: displayCompany,
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      company: editForm.company,
    });
    setSaving(false);
    if (!error) {
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddressList(addressList.filter(a => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddressList(addressList.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const handleSaveAddress = (address: Address) => {
    if (editingAddress) {
      setAddressList(addressList.map(a => a.id === address.id ? address : a));
    } else {
      setAddressList([...addressList, { ...address, id: `ADDR-${Date.now()}` }]);
    }
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const tabs = [
    { id: 'info' as const, label: 'Personal Info', icon: User },
    { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'preferences' as const, label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {getInitials(displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
            <p className="text-sm text-gray-500">{displayCompany}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {displayEmail}</span>
              {displayPhone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {displayPhone}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">{displayLoyaltyTier} Member</span>
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
          <Check className="w-4 h-4" /> Profile updated successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            {!isEditing ? (
              <button onClick={handleStartEdit} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 rounded-lg transition-colors">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Full Name', value: isEditing ? editForm.name : displayName, key: 'name', icon: User },
              { label: 'Email Address', value: isEditing ? editForm.email : displayEmail, key: 'email', icon: Mail },
              { label: 'Phone Number', value: isEditing ? editForm.phone : displayPhone, key: 'phone', icon: Phone },
              { label: 'Company', value: isEditing ? editForm.company : displayCompany, key: 'company', icon: Building2 },
            ].map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">{field.label}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{field.value || '—'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Customer ID</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{displayCustomerId}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(displayMemberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Total Spent</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(displayTotalSpent)}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingAddress(null); setShowAddressForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addressList.map((addr) => (
              <div key={addr.id} className={`bg-white rounded-xl border p-5 relative ${addr.isDefault ? 'border-teal-200 ring-1 ring-teal-100' : 'border-gray-100'}`}>
                {addr.isDefault && <span className="absolute top-3 right-3 px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-semibold rounded-full border border-teal-200">DEFAULT</span>}
                <p className="text-sm font-semibold text-gray-900">{addr.label}</p>
                <p className="text-sm text-gray-600 mt-2">{addr.name}</p>
                <p className="text-sm text-gray-600">{addr.line1}</p>
                {addr.line2 && <p className="text-sm text-gray-600">{addr.line2}</p>}
                <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                <p className="text-sm text-gray-600">{addr.country}</p>
                <p className="text-xs text-gray-400 mt-2">{addr.phone}</p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  {!addr.isDefault && (
                    <>
                      <button onClick={() => handleSetDefault(addr.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">Set Default</button>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {showAddressForm && (
            <AddressFormModal address={editingAddress} onSave={handleSaveAddress} onClose={() => { setShowAddressForm(false); setEditingAddress(null); }} />
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
          <form onSubmit={(e) => { e.preventDefault(); setPasswordForm({ current: '', newPass: '', confirm: '' }); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }} className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
            <button type="submit" className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">Update Password</button>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Two-Factor Authentication</h4>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Authenticator App</p>
                <p className="text-xs text-gray-500 mt-0.5">Use an authenticator app for 2FA</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-teal-200">Enable</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Communication Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive order updates and alerts via email' },
              { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Get text messages for important updates' },
              { key: 'orderUpdates', label: 'Order Status Updates', desc: 'Notifications when order status changes' },
              { key: 'promotions', label: 'Promotional Offers', desc: 'Receive special deals and discount offers' },
              { key: 'invoiceReminders', label: 'Invoice Reminders', desc: 'Get reminded about upcoming and overdue invoices' },
              { key: 'newsletter', label: 'Newsletter', desc: 'Monthly newsletter with product updates and tips' },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{pref.desc}</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, [pref.key]: !preferences[pref.key as keyof typeof preferences] })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${preferences[pref.key as keyof typeof preferences] ? 'bg-teal-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences[pref.key as keyof typeof preferences] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AddressFormModal: React.FC<{
  address: Address | null;
  onSave: (address: Address) => void;
  onClose: () => void;
}> = ({ address, onSave, onClose }) => {
  const [form, setForm] = useState<Address>(address || {
    id: '', label: '', name: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'India', phone: '', isDefault: false,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{address ? 'Edit Address' : 'Add New Address'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Label</label>
            <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g., Office - Head Office" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name / Company</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1</label>
            <input type="text" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
            <input type="text" value={form.line2 || ''} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP Code</label>
              <input type="text" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">Save Address</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileView;
