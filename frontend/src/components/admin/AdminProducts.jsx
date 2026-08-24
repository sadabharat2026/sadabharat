import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiX,
  FiImage,
  FiChevronDown,
  FiFilter,
  FiStar,
  FiArrowLeft,
  FiUploadCloud,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';

import api from '../../utils/api';
import { getStoredProductImages, isUsableImageUrl } from '../../utils/productImages';
import { uploadImageFiles } from '../../utils/uploadImages';



const BRA_SIZES = ['32B', '34B', '36B', '38B', '40B', '32C', '34C', '36C', '38C', '40C'];
const GENERAL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

const AdminProducts = () => {
  const { categories, fetchData } = useShop();
  const [adminProducts, setAdminProducts] = useState([]);
  
  const fetchAdminProducts = useCallback(async () => {
    try {
      const res = await api.get('/products/admin');
      if (res.data.success) {
        setAdminProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
    }
  }, []);

  useEffect(() => {
    fetchAdminProducts();
  }, [fetchAdminProducts]);
  const [searchParams] = useSearchParams();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [customSize, setCustomSize] = useState('');
  const [filter, setFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    ingredients: '',
    benefits: '',
    dosage: '',
    disclaimer: '',
    hasVariants: false,
    variants: [{ size: '', price: '', oldPrice: '', stock: '', sku: '' }],
    price: '',
    oldPrice: '',
    stock: '',
    sku: '',
    images: [],
    prescriptionRequired: false,
    noRefund: false,
    codAvailable: false,
    category: '',
    tags: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Prevent negative price or stock
    if ((name === 'price' || name === 'stock') && parseFloat(value) < 0) {
      setForm(prev => ({ ...prev, [name]: '0' }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    setIsUploading(true);
    try {
      const newImages = await uploadImageFiles(files);
      setForm(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', price: '', oldPrice: '', stock: '', sku: '' }]
    }));
  };

  const handleRemoveVariant = (index) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setForm(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  // Handle Filtering and Searching
  const filteredProducts = adminProducts.filter(p => {
    // Status Filter
    const pStatus = p.status || 'approved';
    const matchesStatus = statusFilter === 'All' || pStatus.toLowerCase() === statusFilter.toLowerCase();

    // Category Filter
    const matchesFilter = filter === 'All Categories' || p.category === filter;

    // Search Query (Name, ID, or direct price match)
    const searchLower = searchQuery.toLowerCase().trim();
    const nameMatch = (p.name || '').toLowerCase().includes(searchLower);
    const skuMatch = String(p._id).toLowerCase().includes(searchLower);
    const priceMatch = searchQuery !== '' && String(p.price).includes(searchLower);
    const matchesSearch = searchQuery === '' || nameMatch || skuMatch || priceMatch;

    // Range Filters
    const pPrice = Number(p.price);
    const min = minPrice !== '' ? Number(minPrice) : -Infinity;
    const max = maxPrice !== '' ? Number(maxPrice) : Infinity;

    const matchesMinPrice = pPrice >= min;
    const matchesMaxPrice = pPrice <= max;

    return matchesStatus && matchesFilter && matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  const handleStatusChange = async (id, newStatus) => {
    if (window.confirm(`Are you sure you want to ${newStatus} this product?`)) {
      try {
        await api.put(`/products/${id}/status`, { status: newStatus });
        fetchAdminProducts();
      } catch (err) {
        alert('Failed to update status: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this product permanently from the sacred catalog?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchAdminProducts(); // Refresh admin products
      } catch (err) {
        alert('Failed to remove product: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      ingredients: product.ingredients || '',
      benefits: product.benefits || '',
      dosage: product.dosage || '',
      disclaimer: product.disclaimer || '',
      hasVariants: product.hasVariants || false,
      variants: product.variants?.length ? product.variants : [{ size: '', price: '', oldPrice: '', stock: '', sku: '' }],
      price: product.price || '',
      oldPrice: product.oldPrice || '',
      stock: product.stock || '',
      sku: product.sku || '',
      images: getStoredProductImages(product),
      prescriptionRequired: product.prescriptionRequired || false,
      noRefund: product.noRefund || false,
      codAvailable: product.codAvailable || false,
      category: product.category || '',
      tags: product.tags || ''
    });
    setIsAdding(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || (!form.hasVariants && !form.price)) {
      alert('Please fill out Name, Category, and Price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const images = (form.images || []).filter(isUsableImageUrl);
      if (!images.length) {
        alert('Please upload at least one product image.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...form,
        images,
        image: images[0],
        status: 'approved',
        price: form.hasVariants ? Number(form.variants[0]?.price || 0) : Number(form.price || 0),
        oldPrice: form.hasVariants ? Number(form.variants[0]?.oldPrice || 0) : Number(form.oldPrice || 0),
        stock: form.hasVariants ? Number(form.variants[0]?.stock || 0) : Number(form.stock || 0),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setIsAdding(false);
      setEditingProduct(null);
      setForm({
        name: '', description: '', ingredients: '', benefits: '', dosage: '', disclaimer: '',
        hasVariants: false, variants: [{ size: '', price: '', oldPrice: '', stock: '', sku: '' }],
        price: '', oldPrice: '', stock: '', sku: '', images: [], prescriptionRequired: false,
        noRefund: false, codAvailable: false, category: '', tags: ''
      });
      fetchAdminProducts();
      if (typeof fetchData === 'function') fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      console.error('Error response:', err.response?.data);
      alert('Error saving product: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsAdding(true);
      setEditingProduct(null);
    }
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">
      <AnimatePresence mode="wait">
        {!isAdding ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-['Cormorant',_serif] font-bold text-admin-dark leading-none mb-2">
                  Products
                </h1>
                <p className="text-gray-500 text-[13px] font-poppins">
                  Manage your product listings and inventory.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setForm({
                    name: '', description: '', ingredients: '', benefits: '', dosage: '', disclaimer: '',
                    hasVariants: false, variants: [{ size: '', price: '', oldPrice: '', stock: '', sku: '' }],
                    price: '', oldPrice: '', stock: '', sku: '', images: [], prescriptionRequired: false,
                    noRefund: false, codAvailable: false, category: '', tags: ''
                  });
                  setIsAdding(true);
                }}
                className="bg-admin-dark text-white px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-black/10 hover:bg-black transition-all"
              >
                <FiPlus size={16} /> Add New Product
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 mb-2">
              {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
                    statusFilter === status
                      ? 'bg-admin-dark text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status} Products
                </button>
              ))}
            </div>

            {/* Compact Filter Bar */}
            <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  className="w-full bg-gray-50 border border-transparent focus:border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[11px] font-medium outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="bg-gray-50 border border-transparent focus:border-gray-200 rounded-lg px-3 py-2 text-[11px] font-bold outline-none cursor-pointer"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All Categories</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>

                <button
                  onClick={() => { setFilter('All Categories'); setStatusFilter('All'); setSearchQuery(''); setMinPrice(''); setMaxPrice(''); }}
                  className="bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg px-4 py-2 text-[11px] font-bold text-gray-600 transition-all"
                >
                  Clear Filters
                </button>

                <div className="flex items-center gap-1 bg-gray-50 border border-transparent rounded-lg px-2 py-1">
                  <span className="text-[10px] text-gray-400 font-bold px-1">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-12 bg-transparent border-none outline-none text-[11px] font-bold"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-gray-300">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-12 bg-transparent border-none outline-none text-[11px] font-bold"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Product Table - High Density */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-sm font-sans font-medium text-gray-500 capitalize tracking-normal text-left">PRODUCT NAME</th>
                      <th className="px-6 py-4 text-sm font-sans font-medium text-gray-500 capitalize tracking-normal text-left">BRAND</th>
                      <th className="px-6 py-4 text-sm font-sans font-medium text-gray-500 capitalize tracking-normal text-left">CATEGORY</th>
                      <th className="px-6 py-4 text-sm font-sans font-medium text-gray-500 capitalize tracking-normal text-left">CREATED BY</th>
                      <th className="px-6 py-4 text-sm font-sans font-medium text-gray-500 capitalize tracking-normal text-left">PLACEMENT</th>
                      <th className="px-6 py-4 text-sm font-sans font-medium text-gray-500 capitalize tracking-normal text-left">PRICE</th>
                      <th className="px-6 py-4 text-sm font-sans font-medium text-gray-500 capitalize tracking-normal text-left">STATUS</th>
                      <th className="px-6 py-4 text-sm font-sans font-medium text-gray-500 capitalize tracking-normal text-left">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.length > 0 ? filteredProducts.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 p-1 flex-shrink-0">
                              <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium font-sans text-gray-800 group-hover:text-admin-accent transition-colors line-clamp-1 max-w-[200px]">{p.name}</span>
                              <span className="text-[9px] text-admin-accent font-bold uppercase tracking-wider">ID: {p._id.slice(-6).toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{p.brand || 'Generic'}</span>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <span className="text-xs font-bold text-gray-600">{p.category}</span>
                        </td>
                        <td className="px-6 py-4 text-left">
                          {p.vendor ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-blue-600">{p.vendor.fullName || p.vendor.storeName || 'Vendor'}</span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase">Vendor</span>
                            </div>
                          ) : p.admin ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-admin-accent">{p.admin.name || 'Admin'}</span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase">Admin</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-gray-500">System</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[9px] font-bold uppercase rounded leading-none">{p.subCategory || 'General'}</span>
                            {p.badge && (
                              <span className="px-2 py-0.5 bg-admin-accent/5 text-admin-accent text-[9px] font-bold uppercase rounded leading-none max-w-[80px] truncate">{p.badge}</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-left">
                          <span className="text-xs font-bold text-gray-800">₹{p.price}</span>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase leading-none ${(p.status || 'active') === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                              (p.status || 'active') === 'rejected' ? 'bg-red-50 text-red-600' :
                                p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {(p.status || 'active') === 'pending' ? 'Pending' : (p.status || 'active') === 'rejected' ? 'Rejected' : `${p.stock} Units`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center justify-start gap-1">
                            {(p.status || 'active') === 'pending' && (
                              <>
                                <button onClick={() => handleStatusChange(p._id, 'approved')} className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-500 rounded-lg transition-colors" title="Approve Product"><FiCheckCircle size={13} /></button>
                                <button onClick={() => handleStatusChange(p._id, 'rejected')} className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-orange-500 rounded-lg transition-colors" title="Reject Product"><FiXCircle size={13} /></button>
                              </>
                            )}
                            <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-colors" title="Edit Product"><FiEdit2 size={13} /></button>
                            <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors" title="Delete Product"><FiTrash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="8" className="py-12 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">No Products Match The Filter</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Create Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsAdding(false)}
                  className="w-9 h-9 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 hover:shadow-md transition-all shadow-sm flex-shrink-0"
                >
                  <FiArrowLeft size={16} />
                </button>
                <div>
                  <h1 className="text-3xl font-['Cormorant',_serif] font-bold text-admin-dark leading-none mb-2">
                    {editingProduct ? 'Update Product Details' : 'Initialize New Product'}
                  </h1>
                  <p className="text-gray-500 text-[13px] font-poppins">
                    Store Metadata & Inventory Management
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-admin-dark">Discard</button>
                <button
                  onClick={handleSaveProduct}
                  disabled={isSubmitting || isUploading}
                  className="bg-admin-dark text-white px-7 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-black/10 hover:bg-black transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Syncing...' : (isUploading ? 'Uploading Visual...' : (editingProduct ? 'Commit Edits' : 'Publish Product'))}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-[13px]">General Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Product Name</label>
                <input
                  type="text"
                  name="name" value={form.name} onChange={handleInputChange}
                  
                  placeholder="e.g. Organic Neem Tulsi Face Wash"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Description</label>
                <textarea
                  rows="3"
                  name="description" value={form.description} onChange={handleInputChange}
                  
                  placeholder="Write a detailed product description..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Key Ingredients (comma separated)</label>
                  <textarea
                    rows="2"
                    name="ingredients" value={form.ingredients} onChange={handleInputChange}
                    
                    placeholder="e.g. Bhringraj, Amla, Coconut Oil, Brahmi"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Benefits</label>
                  <textarea
                    rows="2"
                    name="benefits" value={form.benefits} onChange={handleInputChange}
                    
                    placeholder="e.g. Clears acne, Purifies skin..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Dosage and Disclaimer Textareas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Dosage & Usage Guidelines</label>
                  <textarea
                    rows="2"
                    name="dosage" value={form.dosage} onChange={handleInputChange}
                    
                    placeholder="e.g. Take 1 capsule twice daily with warm milk/water after meals or as directed by the physician."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Disclaimer Guidelines</label>
                  <textarea
                    rows="2"
                    name="disclaimer" value={form.disclaimer} onChange={handleInputChange}
                    
                    placeholder="e.g. Keep out of reach of children. Store in a cool dry place. Consult a doctor before use if pregnant."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Variants Editor Section */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="flex items-center gap-2 mb-3 bg-[#F0F7F2] p-2.5 rounded-lg border border-[#C8E6C9]">
              <input
                type="checkbox"
                id="hasVariants"
                name="hasVariants" checked={form.hasVariants} onChange={handleInputChange}
                
                className="w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425] cursor-pointer"
              />
              <label htmlFor="hasVariants" className="text-[11px] font-bold text-[#1B5E20] cursor-pointer select-none">
                This product has variants (e.g. sizes, weights, counts)
              </label>
            </div>

            {form.hasVariants ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 text-[12px]">Manage Variants</h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-2.5 py-1.5 bg-[#054425]/10 text-[#054425] hover:bg-[#054425]/20 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    + Add Variant Row
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] text-gray-500 uppercase font-bold tracking-wider border-b border-gray-100">
                        <th className="px-2 py-2 w-1/4">Size / Unit</th>
                        <th className="px-2 py-2 w-1/5">Price (₹)</th>
                        <th className="px-2 py-2 w-1/5">MRP (₹)</th>
                        <th className="px-2 py-2 w-1/5">Stock</th>
                        <th className="px-2 py-2 w-1/5">SKU</th>
                        <th className="px-2 py-2 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {form.variants.map((v, index) => (
                        <tr key={index} className="text-xs">
                          <td className="p-1">
                            <input
                              type="text"
                              placeholder="e.g. 200 ml"
                              value={v.size}
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              placeholder="349"
                              value={v.price}
                              onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              placeholder="499"
                              value={v.oldPrice}
                              onChange={(e) => handleVariantChange(index, 'oldPrice', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              placeholder="50"
                              value={v.stock}
                              onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              placeholder="SKU"
                              value={v.sku}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425] uppercase"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              disabled={form.variants.length <= 1}
                              className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-30"
                            >
                              <FiX size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-gray-500 font-sans">Single product listing. Dynamic form.variants are disabled. Fill the single Pricing & Stock settings in the sidebar.</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-[13px]">Product Media</h3>
            <p className="text-[11px] text-gray-500 mb-3">
              Upload more than one photo. Extra images auto-scroll on product cards, like the home banners.
            </p>

            <div className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}>
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} multiple accept="image/*" disabled={isUploading} />
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-[#054425]">
                <FiUploadCloud size={20} />
              </div>
              <p className="text-[12px] font-bold text-gray-900 mb-0.5">{isUploading ? 'Uploading photos...' : 'Click to upload or drag & drop'}</p>
              <p className="text-[10px] text-gray-500 font-sans">PNG, JPG or WEBP — add 2+ images for the card carousel</p>
            </div>

            {form.images.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden shrink-0 group">
                    <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiX size={12} />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#054425]/80 text-white text-[8px] font-bold text-center py-0.5">MAIN</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-4">
          {!form.hasVariants && (
            <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3 text-[13px]">Pricing & Stock</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Selling Price (₹)</label>
                  <input
                    type="number"
                    name="price" value={form.price} onChange={handleInputChange}
                    
                    placeholder="299"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">MRP (₹)</label>
                  <input
                    type="number"
                    name="oldPrice" value={form.oldPrice} onChange={handleInputChange}
                    
                    placeholder="399"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock" value={form.stock} onChange={handleInputChange}
                    
                    placeholder="100"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">SKU</label>
                  <input
                    type="text"
                    name="sku" value={form.sku} onChange={handleInputChange}
                    
                    placeholder="SB-NTFW-100"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* New Regulatory & Logistics Policy Controls */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-[13px]">Regulatory & Logistics</h3>
            <div className="space-y-3 font-sans">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="prescriptionRequired" checked={form.prescriptionRequired} onChange={handleInputChange}
                  
                  className="mt-0.5 w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-750 font-bold leading-none">Prescription Required</span>
                  <span className="text-[9px] text-gray-400 font-semibold mt-0.5">Check if this is a prescription-only ayurvedic medicine</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none border-t border-gray-50 pt-2.5">
                <input
                  type="checkbox"
                  name="noRefund" checked={form.noRefund} onChange={handleInputChange}
                  
                  className="mt-0.5 w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-750 font-bold leading-none">No Refund Details</span>
                  <span className="text-[9px] text-gray-400 font-semibold mt-0.5">Check if this product is non-refundable (e.g. hygiene)</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none border-t border-gray-50 pt-2.5">
                <input
                  type="checkbox"
                  name="codAvailable" checked={form.codAvailable} onChange={handleInputChange}
                  
                  className="mt-0.5 w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-750 font-bold leading-none">Cash on Delivery (COD)</span>
                  <span className="text-[9px] text-gray-400 font-semibold mt-0.5">Manage and allow Cash on Delivery for this product</span>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-[13px]">Organization</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Category</label>
                <select
                  name="category" value={form.category} onChange={handleInputChange}
                  
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-700 cursor-pointer"
                >
                  <option>Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Tags</label>
                <input
                  type="text"
                  name="tags" value={form.tags} onChange={handleInputChange}
                  
                  placeholder="e.g. acne, organic, vegan"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#F0F7F2] border border-[#C8E6C9] rounded-xl p-3 flex items-start gap-2">
            <div className="mt-0.5 text-[#388E3C]"><FiCheckCircle size={14} /></div>
            <div>
              <h4 className="text-[11px] font-bold text-[#1B5E20] mb-0.5">Approval Process</h4>
              <p className="text-[10px] text-[#2E7D32] font-sans font-medium leading-relaxed">After submission, your product will be reviewed by our admin team within 24 hours before going live.</p>
            </div>
          </div>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
