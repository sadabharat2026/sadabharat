import React, { useState, useEffect } from 'react';
import { Settings, Lock, UserCircle, BellRing } from 'lucide-react';
import api from '../../utils/api';

const VendorSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: '',
    fullName: '',
    email: '',
    phone: '',
    gstNumber: '',
    panNumber: '',
    fssaiLicense: '',
    aadharNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  const tabs = [
    { id: 'profile', name: 'Profile Details', icon: UserCircle },
    { id: 'store', name: 'Store Preferences', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: BellRing },
    { id: 'security', name: 'Security', icon: Lock },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/vendors/profile');
        if (res.data?.success && res.data.data?.vendor) {
          const v = res.data.data.vendor;
          setFormData({
            storeName: v.storeName || '',
            fullName: v.fullName || '',
            email: v.email || '',
            phone: v.phone || '',
            gstNumber: v.gstNumber || '',
            panNumber: v.panNumber || '',
            fssaiLicense: v.fssaiLicense || '',
            aadharNumber: v.aadharNumber || '',
            bankName: v.bankName || '',
            accountNumber: v.accountNumber || '',
            ifscCode: v.ifscCode || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        window.showVendorToast?.('Failed to load profile details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const res = await api.put('/vendors/profile', formData);
      if (res.data?.success) {
        window.showVendorToast?.('Settings updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      window.showVendorToast?.(error.response?.data?.message || 'Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto -mt-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Settings</h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-sans">Manage your store preferences and account details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 font-medium text-[12px] rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === tab.id 
                  ? 'bg-green-50 text-[#054425] font-bold shadow-sm border border-green-100/50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'text-[#054425]' : 'text-gray-400'}/> 
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className="lg:col-span-3 bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 min-h-[400px]">
          {loading ? (
             <div className="flex h-full min-h-[300px] items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#054425]"></div>
             </div>
          ) : activeTab === 'profile' ? (
            <div className="animate-in fade-in duration-300">
              <h3 className="font-bold text-gray-900 text-[14px] mb-4 border-b border-gray-100 pb-2">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Business Name</label>
                   <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Owner Name</label>
                   <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Email Address</label>
                   <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Phone Number</label>
                   <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all" />
                 </div>
              </div>

              <h3 className="font-bold text-gray-900 text-[14px] mt-6 mb-4 border-b border-gray-100 pb-2">Tax & Legal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">GST Number</label>
                   <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all uppercase" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">PAN Number</label>
                   <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all uppercase" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">FSSAI License (If applicable)</label>
                   <input type="text" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Aadhar Card Number</label>
                   <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all" />
                 </div>
              </div>

              <h3 className="font-bold text-gray-900 text-[14px] mt-6 mb-4 border-b border-gray-100 pb-2">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                 <div className="md:col-span-2">
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Bank Name</label>
                   <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Account Number</label>
                   <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">IFSC Code</label>
                   <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 shadow-sm transition-all uppercase" />
                 </div>
              </div>

              <div className="mt-6 flex gap-3 max-w-2xl">
                 <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2.5 bg-[#054425] text-white font-medium rounded-lg text-[12px] shadow-sm hover:bg-[#04331c] transition-colors disabled:opacity-70">
                   {saving ? 'Saving...' : 'Save All Changes'}
                 </button>
                 <button onClick={() => window.location.reload()} className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg text-[12px] hover:bg-gray-50 transition-colors">
                   Cancel
                 </button>
              </div>
            </div>
          ) : activeTab === 'store' ? (
            <div className="animate-in fade-in duration-300">
               <h3 className="font-bold text-gray-900 text-[14px] mb-4 border-b border-gray-100 pb-2">Store Preferences</h3>
               <p className="text-gray-500 text-[12px]">Store preferences coming soon.</p>
            </div>
          ) : activeTab === 'notifications' ? (
            <div className="animate-in fade-in duration-300">
               <h3 className="font-bold text-gray-900 text-[14px] mb-4 border-b border-gray-100 pb-2">Notification Settings</h3>
               <p className="text-gray-500 text-[12px]">Notification settings coming soon.</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
               <h3 className="font-bold text-gray-900 text-[14px] mb-4 border-b border-gray-100 pb-2">Security Settings</h3>
               <p className="text-gray-500 text-[12px]">Security settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorSettings;
