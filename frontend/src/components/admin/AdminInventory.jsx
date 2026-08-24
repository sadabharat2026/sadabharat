import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, AlertTriangle, AlertCircle, CheckCircle2, RefreshCw, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    outOfStockCount: 0,
    lowStockCount: 0,
    healthyStockCount: 0,
    valuationLabel: '₹0.00L'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All Stock');
  const [editingId, setEditingId] = useState(null);
  const [editStockValue, setEditStockValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products/admin');
      if (res.data.success) {
        setProducts(res.data.data);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch admin inventory:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleUpdateStock = async (id) => {
    if (editStockValue === '' || isNaN(editStockValue)) return;
    setIsUpdating(true);
    try {
      await api.put(`/inventory/${id}`, { stock: Number(editStockValue) });
      fetchProducts();
      setEditingId(null);
    } catch (error) {
      alert("Failed to update stock: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const inventoryItems = products.map(p => ({
    id: p._id,
    name: p.name,
    sku: p.sku || `SB-${p._id.slice(-6).toUpperCase()}`,
    stock: p.stock ?? 0,
    price: p.price || 0,
    vendorName: p.vendor?.fullName || p.vendor?.storeName || (p.admin ? (p.admin.name || 'Admin') : 'System'),
    alert: 15,
    updated: new Date(p.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: p.stock === 0 ? 'Out of Stock' : p.stock < 15 ? 'Low Stock' : 'Healthy'
  }));

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'Low Stock') return matchesSearch && item.stock < item.alert && item.stock > 0;
    if (filter === 'Out of Stock') return matchesSearch && item.stock === 0;
    return matchesSearch;
  });

  const outOfStockCount = summary.outOfStockCount ?? 0;
  const lowStockCount = summary.lowStockCount ?? 0;
  const healthyStockCount = summary.healthyStockCount ?? 0;

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto -mt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Inventory Vault</h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-sans">Real-time Stock Audits & Warehousing.</p>
        </div>
        <button onClick={fetchProducts} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
          <RefreshCw size={14} /> Refresh Live Data
        </button>
      </div>
      
      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <motion.div 
          initial={{ opacity: 0, rotateX: 90 }} whileInView={{ opacity: 1, rotateX: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-[#FFF0F0] border border-red-100 p-4 rounded-xl flex items-center gap-4 shadow-sm"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm"><AlertCircle size={20} /></div>
          <div>
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide mb-0.5">Out of Stock</p>
            <h3 className="text-xl font-medium text-gray-800 font-sans">{outOfStockCount}</h3>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, rotateX: 90 }} whileInView={{ opacity: 1, rotateX: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="bg-[#FFF8E1] border border-orange-100 p-4 rounded-xl flex items-center gap-4 shadow-sm"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm"><AlertTriangle size={20} /></div>
          <div>
            <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wide mb-0.5">Low Stock</p>
            <h3 className="text-xl font-medium text-gray-800 font-sans">{lowStockCount}</h3>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, rotateX: 90 }} whileInView={{ opacity: 1, rotateX: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="bg-[#E8F5E9] border border-green-100 p-4 rounded-xl flex items-center gap-4 shadow-sm"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2E7D32] shadow-sm"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-wide mb-0.5">Healthy Stock</p>
            <h3 className="text-xl font-medium text-gray-800 font-sans">{healthyStockCount}</h3>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, rotateX: 90 }} whileInView={{ opacity: 1, rotateX: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
          className="bg-[#F3E8FF] border border-purple-100 p-4 rounded-xl flex items-center gap-4 shadow-sm"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm"><Database size={20} /></div>
          <div>
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wide mb-0.5">Vault Valuation</p>
            <h3 className="text-xl font-medium text-gray-800 font-sans">{summary.valuationLabel}</h3>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search SKU, Product, or Vendor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-700 outline-none hover:bg-gray-50 cursor-pointer"
            >
              <option>All Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] text-gray-500 uppercase tracking-widest border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">Product & SKU</th>
                <th className="px-4 py-3 font-semibold">Owner / Vendor</th>
                <th className="px-4 py-3 font-semibold">Current Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last Updated</th>
                <th className="px-4 py-3 font-semibold text-right">Update Stock</th>
              </tr>
            </thead>
            <tbody className="text-[12px] text-gray-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className={`border-b transition-colors relative ${item.stock === 0 ? 'bg-red-50/20 border-red-100' : 'border-gray-50 hover:bg-gray-50/50'}`}>
                  <td className="px-4 py-2.5 relative">
                    {item.stock === 0 && (
                      <motion.div 
                        initial={{ x: '-200%' }}
                        animate={{ x: '1000%' }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-red-500/15 to-transparent pointer-events-none z-0"
                      />
                    )}
                    <div className="relative z-10">
                      <p className="font-medium text-gray-800 leading-tight">{item.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.sku}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                      {item.vendorName}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium font-sans text-[13px] text-gray-800">{item.stock}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      item.status === 'Healthy' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]' : 
                      item.status === 'Low Stock' ? 'bg-[#FFF8E1] text-[#F9A825] border border-[#FFECB3]' : 
                      'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[11px] font-medium">{item.updated}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {editingId === item.id ? (
                        <>
                          <input 
                            type="number" 
                            autoFocus
                            value={editStockValue} 
                            onChange={(e) => setEditStockValue(e.target.value)}
                            disabled={isUpdating}
                            className="w-14 px-2 py-1 border border-[#054425] rounded-md text-[11px] text-center outline-none ring-1 ring-[#054425]/20" 
                          />
                          <button 
                            onClick={() => handleUpdateStock(item.id)} 
                            disabled={isUpdating}
                            className="px-2 py-1 bg-[#054425] text-white font-medium rounded-md hover:bg-black transition-colors text-[11px] disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingId(null)} 
                            disabled={isUpdating}
                            className="px-2 py-1 border border-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors text-[11px] disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => { setEditingId(item.id); setEditStockValue(String(item.stock)); }}
                          className="px-3 py-1 border border-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors text-[11px]"
                        >
                          Edit Stock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 text-sm">
                    No products found in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
