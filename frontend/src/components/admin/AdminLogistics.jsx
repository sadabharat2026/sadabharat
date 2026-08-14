import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPercent, FiTruck, FiSave, FiAlertCircle, FiSettings, FiCheckCircle, FiShield, FiLink, FiMapPin, FiPhone } from 'react-icons/fi';

// MOCK API for Frontend-Only mode
const api = {
  get: async () => ({ data: { data: { products: [], categories: [], banners: [], settings: {}, orders: [], users: [], stats: [], recentTransactions: [], dailyRevenue: [], vendors: [], blogs: [], returns: [], testimonials: [], reviews: [], replacements: [], supportTickets: [], locations: [], coupons: [], logs: [] }, status: 'success' } }),
  post: async () => ({ data: { data: { order: { orderId: 'MOCK-ORDER-123' } }, status: 'success' } }),
  patch: async () => ({ data: { status: 'success' } }),
  delete: async () => ({ data: { status: 'success' } })
};


const AdminLogistics = () => {
  const [settings, setSettings] = useState({
    taxRate: 18,
    deliveryCharge: 50,
    freeDeliveryThreshold: 1000,
    estDeliveryDays: '3-5 Business Days',
    shippingPartner: 'Standard Courier',
    trackingUrl: 'https://shiprocket.co/tracking/',
    supportContact: '+91 97727 77736'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.data.settings) {
        setSettings({
          taxRate: res.data.data.settings.taxRate,
          deliveryCharge: res.data.data.settings.deliveryCharge,
          freeDeliveryThreshold: res.data.data.settings.freeDeliveryThreshold,
          estDeliveryDays: res.data.data.settings.estDeliveryDays || '3-5 Business Days',
          shippingPartner: res.data.data.settings.shippingPartner || 'Standard Courier',
          trackingUrl: res.data.data.settings.trackingUrl || 'https://shiprocket.co/tracking/',
          supportContact: res.data.data.settings.supportContact || '+91 97727 77736',
          isCodEnabled: res.data.data.settings.isCodEnabled ?? true,
          codCharge: res.data.data.settings.codCharge || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch sanctuary settings:', err);
      setMessage({ type: 'error', content: 'Failed to synchronize with sanctuary vault.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', content: '' });
    try {
      await api.patch('/settings/update', settings);
      setMessage({ type: 'success', content: 'Sanctuary logistics & financial attributes refined successfully.' });
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', content: err.response?.data?.message || 'Failed to refine sanctuary settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-['Cormorant',_serif] font-bold text-admin-dark leading-none mb-2">
            Logistics & Tax Authority
          </h1>
          <p className="text-gray-500 text-[13px] font-poppins">Global sanctuary configuration</p>
        </div>
        <div className="flex items-center gap-2 bg-admin-accent/5 px-4 py-2 rounded-full border border-admin-accent/10">
          <FiShield className="text-admin-accent" size={14} />
          <span className="text-[11px] font-black text-admin-accent uppercase tracking-widest">Secure Master Controls</span>
        </div>
      </div>

      {message.content && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}
        >
          {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          <span className="text-[11px] font-bold uppercase tracking-wide">{message.content}</span>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Taxation Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-4 border-b border-gray-50 pb-4 text-brand-gold">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-2xl flex items-center justify-center">
              <FiPercent size={20} />
            </div>
            <div>
              <h3 className="text-sm font-sans font-medium text-gray-800 leading-none">Taxation Mapping</h3>
              <p className="text-xs font-medium text-gray-500 mt-1 capitalize">GST Authority Calculations</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-sans font-medium text-gray-600 capitalize">Global GST Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                  className="w-full bg-gray-50 border border-transparent p-4 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-admin-accent/30 transition-all shadow-inner"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Financials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-4 border-b border-gray-50 pb-4 text-admin-accent">
            <div className="w-10 h-10 bg-admin-accent/10 rounded-2xl flex items-center justify-center">
              <FiTruck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-sans font-medium text-gray-800 leading-none">Shipping Financials</h3>
              <p className="text-xs font-medium text-gray-500 mt-1 capitalize">Standard Carrier Fees</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-sans font-medium text-gray-600 capitalize">Base Delivery</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">₹</span>
                  <input
                    type="number"
                    value={settings.deliveryCharge}
                    onChange={(e) => setSettings({ ...settings, deliveryCharge: parseFloat(e.target.value) })}
                    className="w-full bg-gray-50 border border-transparent p-4 pl-7 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-admin-accent/30 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-sans font-medium text-gray-600 capitalize">Free Threshold</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">₹</span>
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: parseFloat(e.target.value) })}
                    className="w-full bg-gray-50 border border-transparent p-4 pl-7 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-admin-accent/30 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* COD Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-4 border-b border-gray-50 pb-4 text-brand-gold">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-2xl flex items-center justify-center">
              <FiShield size={20} />
            </div>
            <div>
              <h3 className="text-sm font-sans font-medium text-gray-800 leading-none">Payment Strategy</h3>
              <p className="text-xs font-medium text-gray-500 mt-1 capitalize">COD Management</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
              <span className="text-sm font-medium text-gray-800">Enable COD</span>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, isCodEnabled: !settings.isCodEnabled })}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.isCodEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isCodEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 capitalize">COD Fee (Convenience)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">₹</span>
                <input
                  type="number"
                  value={settings.codCharge}
                  onChange={(e) => setSettings({ ...settings, codCharge: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-50 border border-transparent p-4 pl-7 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-admin-accent/30 transition-all shadow-inner"
                  required
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 lg:row-span-2"
        >
          <div className="flex items-center gap-4 border-b border-gray-50 pb-4 text-admin-dark">
            <div className="w-10 h-10 bg-admin-dark/5 rounded-2xl flex items-center justify-center">
              <FiSettings size={20} />
            </div>
            <div>
              <h3 className="text-sm font-sans font-medium text-gray-800 leading-none">Carrier Experience</h3>
              <p className="text-xs font-medium text-gray-500 mt-1 capitalize">Customer Facing Timeline</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 capitalize">Primary Partner</label>
              <input
                type="text"
                value={settings.shippingPartner}
                onChange={(e) => setSettings({ ...settings, shippingPartner: e.target.value })}
                className="w-full bg-gray-50 border border-transparent p-4 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-admin-accent/30 transition-all shadow-inner"
                placeholder="Delhivery, Shiprocket..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Est. Timeline</label>
              <input
                type="text"
                value={settings.estDeliveryDays}
                onChange={(e) => setSettings({ ...settings, estDeliveryDays: e.target.value })}
                className="w-full bg-gray-50 border border-transparent p-4 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-admin-accent/30 transition-all shadow-inner"
                placeholder="3-5 Business Days"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tracking URL Template</label>
              <div className="relative">
                <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  type="text"
                  value={settings.trackingUrl}
                  onChange={(e) => setSettings({ ...settings, trackingUrl: e.target.value })}
                  className="w-full bg-gray-50 border border-transparent p-4 pl-10 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-admin-accent/30 transition-all shadow-inner"
                  placeholder="https://shiprocket.co/tracking/"
                />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Logistics Support</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  type="text"
                  value={settings.supportContact}
                  onChange={(e) => setSettings({ ...settings, supportContact: e.target.value })}
                  className="w-full bg-gray-50 border border-transparent p-4 pl-10 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-admin-accent/30 transition-all shadow-inner"
                  placeholder="+91 97727 77736"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security & Impact Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-admin-dark p-6 rounded-3xl border border-white/5 shadow-2xl space-y-6 md:col-span-2 lg:col-span-2"
        >
          <div className="flex items-start gap-4 text-white/80">
            <div className="p-3 bg-white/5 rounded-xl text-admin-accent">
              <FiAlertCircle size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-sans font-medium text-gray-800 capitalize text-[#E8B4B8]">Sacred Integrity Protocol</h4>
              <p className="text-[9px] font-medium text-white/40 leading-relaxed max-w-lg">
                Changes made here will rewrite your checkout math in real-time. Modifying the **GST Rate** will affect invoice generation, while the **Free Shipping Threshold** will instantly update customer cart behavior.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-white/5">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-brand-dark bg-admin-accent/20 flex items-center justify-center text-[8px] font-black text-admin-accent uppercase tracking-widest">Log</div>
              <div className="w-8 h-8 rounded-full border-2 border-brand-dark bg-brand-gold/20 flex items-center justify-center text-[8px] font-black text-brand-gold uppercase tracking-widest">Tax</div>
              <div className="w-8 h-8 rounded-full border-2 border-brand-dark bg-white/5 flex items-center justify-center text-[8px] font-black text-white/60 uppercase tracking-widest">Ops</div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#E8B4B8] text-admin-dark px-12 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-white transition-all disabled:opacity-50"
            >
              {saving ? 'Synchronizing Vault...' : <><FiSave size={16} /> Update Logistics</>}
            </button>
          </div>
        </motion.div>
      </form>

      <style>{`
        .italic-placeholder::placeholder { font-style: italic; opacity: 0.3; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

export default AdminLogistics;
