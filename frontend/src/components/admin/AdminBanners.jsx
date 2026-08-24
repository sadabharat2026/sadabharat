import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { FiEdit2, FiPlus, FiTrash2, FiEye, FiImage, FiX, FiUploadCloud } from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';
import realApi from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBanners = () => {
  const { banners, fetchData } = useShop();
  const [activeTab, setActiveTab] = useState('Store Banners');
  const [isAdding, setIsAdding] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    image: '',
    link: '',
    type: 'Main Slider',
    description: '',
    subtitle: '',
    price: '',
    btnText: 'SHOP NOW',
    isVideo: false,
    slot: 1,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('documents', file);

      const res = await realApi.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success && res.data.data.length > 0) {
        const uploadedUrl = res.data.data[0];
        const backendUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';
        const url = (uploadedUrl.startsWith('http://') || uploadedUrl.startsWith('https://')) 
          ? uploadedUrl 
          : `${backendUrl}${uploadedUrl}`;
        const isVideo = file.type.startsWith('video/');
        setForm(prev => ({ ...prev, image: url, isVideo }));
      } else {
        throw new Error('Upload failed on server.');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Securely remove this visual asset? This will reflect on the live storefront.')) {
      try {
        await realApi.delete(`/banners/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to remove banner');
      }
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || '',
      image: banner.image || '',
      link: banner.link || '',
      type: banner.type || 'Main Slider',
      description: banner.description || '',
      subtitle: banner.subtitle || '',
      price: banner.price || '',
      btnText: banner.btnText || 'SHOP NOW',
      isVideo: banner.isVideo || false,
      slot: banner.slot ?? banner.sequence ?? 1,
      seoTitle: banner.seoTitle || '',
      seoDescription: banner.seoDescription || '',
      seoKeywords: banner.seoKeywords || ''
    });
    setIsAdding(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return alert('Please upload an asset.');

    setLoading(true);
    try {
      if (editingBanner) {
        await realApi.put(`/banners/${editingBanner._id}`, { ...form, sequence: form.slot });
      } else {
        await realApi.post('/banners', { ...form, sequence: form.slot });
      }
      setIsAdding(false);
      setEditingBanner(null);
      setForm({ title: '', image: '', link: '', type: 'Main Slider', description: '', subtitle: '', price: '', btnText: 'SHOP NOW', isVideo: false, slot: 1, seoTitle: '', seoDescription: '', seoKeywords: '' });
      fetchData();
    } catch (err) {
      console.error('API Error:', err);
      alert(editingBanner ? `Error updating banner: ${err.response?.data?.message || err.message}` : `Error creating banner: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingBanner(null);
    setForm({ title: '', image: '', link: '', type: 'Main Slider', description: '', subtitle: '', price: '', btnText: 'SHOP NOW', isVideo: false, slot: 1, seoTitle: '', seoDescription: '', seoKeywords: '' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 min-h-screen">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-['Cormorant',_serif] font-bold text-admin-dark leading-none mb-2">
            Store Banners
          </h1>
          <p className="text-gray-500 text-sm font-sans">
            Visual merchandising assets
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-brand-dark text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-dark/20 flex items-center gap-2 hover:bg-black transition-all"
        >
          <FiPlus size={16} /> New Banner
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-100 mb-6">
        {['Store Banners', 'Vendor Banners'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-brand-dark' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-dark" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xl space-y-6 font-sans mb-8 relative"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-brand-dark">
                {editingBanner ? 'Edit Campaign Banner' : 'Create Campaign Banner'}
              </h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-gray-50 rounded-lg"><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-400">Campaign Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none" placeholder="e.g. Summer Radiance" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-400">Subtitle</label>
                <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none" placeholder="Seasonal Sale | 50% Off" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-400">Display Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none">
                  <option>Main Slider</option>
                  <option>Mid-Section</option>
                  <option>Category Banner</option>
                  <option>Trending</option>
                  <option>Offers</option>
                  <option>AppPromo</option>
                  <option>Vendor Dashboard</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-400">Starting Price / Badge</label>
                <input type="text" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none" placeholder="₹300" />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-brand-dark">
                  Slot (display order)
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  required
                  value={form.slot}
                  onChange={e => setForm({ ...form, slot: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-gray-50 border border-brand-dark/20 text-[11px] font-bold p-2 outline-none rounded-lg focus:border-brand-dark"
                  placeholder="1 = first, 2 = second..."
                />
                <p className="text-[9px] text-gray-400">Lower slot number shows first on the website.</p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[8px] font-black uppercase text-gray-400">Description / Tagline</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none" placeholder="Grab the best deals on Skincare..." />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-400">CTA Button Text</label>
                <input type="text" value={form.btnText} onChange={e => setForm({ ...form, btnText: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none" placeholder="SHOP NOW" />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-400">Landing Path</label>
                <input type="text" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none" placeholder="/shop/skincare" />
              </div>

              {/* SEO Elements */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[8px] font-black uppercase text-gray-400">SEO Title</label>
                <input type="text" value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none" placeholder="SEO Title" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[8px] font-black uppercase text-gray-400">SEO Keywords</label>
                <input type="text" value={form.seoKeywords} onChange={e => setForm({ ...form, seoKeywords: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none" placeholder="comma, separated, keywords" />
              </div>
              <div className="space-y-1 md:col-span-4">
                <label className="text-[8px] font-black uppercase text-gray-400">SEO Description</label>
                <input type="text" value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} className="w-full bg-gray-50 border-none text-[10px] font-bold p-2 outline-none" placeholder="SEO Meta Description" />
              </div>

              <div className="space-y-1 md:col-span-4">
                <label className="text-[8px] font-black uppercase text-gray-400">Campaign Visual (Image or Video)</label>
                <div
                  onClick={() => document.getElementById('banner-upload').click()}
                  className="relative aspect-[21/9] md:aspect-[32/9] bg-gray-50 border border-dashed border-gray-200 rounded-none flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-admin-accent/[0.02] hover:border-admin-accent/30 transition-all overflow-hidden"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-1 animate-pulse">
                      <FiUploadCloud className="text-admin-accent animate-bounce" size={24} />
                      <span className="text-[8px] font-black text-admin-accent uppercase tracking-widest">Uploading Asset...</span>
                    </div>
                  ) : form.image ? (
                    <div className="w-full h-full relative group">
                      {form.isVideo ? (
                        <video src={form.image} className="w-full h-full object-cover" muted loop autoPlay />
                      ) : (
                        <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiUploadCloud className="text-white" size={24} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <FiImage size={24} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Select Visual Content</span>
                    </div>
                  )}
                  <input
                    id="banner-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="pt-4 md:col-span-2 lg:col-span-4 flex justify-end">
                <button type="submit" disabled={loading || isUploading} className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-dark/20 hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2">
                  {loading ? 'Saving Changes...' : (isUploading ? 'Finalizing Asset...' : (editingBanner ? 'Update Campaign' : 'Deploy Campaign'))}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {banners
          .filter(b => activeTab === 'Store Banners' ? b.type !== 'Vendor Dashboard' : b.type === 'Vendor Dashboard')
          .slice()
          .sort((a, b) => (a.slot ?? a.sequence ?? 999) - (b.slot ?? b.sequence ?? 999))
          .map((banner) => {
          return (
            <div key={banner._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm group relative overflow-hidden flex flex-col">
              <div className="p-3 pb-0">
                <div className="relative aspect-[21/9] bg-gray-50 overflow-hidden rounded-xl border border-gray-50">
                  {banner.isVideo || (typeof banner.image === 'string' && (banner.image.endsWith('.mp4') || banner.image.endsWith('.webm') || banner.image.includes('video'))) ? (
                    <video src={banner.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted loop autoPlay />
                  ) : (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute top-2 left-2 flex gap-1 items-center">
                    <span className="bg-[#D4AF37] text-[#054425] text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-md">
                      Slot #{banner.slot ?? banner.sequence ?? 1}
                    </span>
                    <span className="bg-brand-dark/90 text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-sm backdrop-blur-md">{banner.type}</span>
                    {(banner.isVideo || (typeof banner.image === 'string' && banner.image.endsWith('.mp4'))) && (
                      <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-1 rounded uppercase tracking-widest shadow-sm">Video</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-sans font-bold text-gray-800 mb-1 truncate">{banner.title}</h3>
                      <span className="text-xs text-gray-500 font-medium block truncate">{banner.link ? `URL: ${banner.link}` : 'Internal Link'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <button onClick={() => window.open(banner.image, '_blank')} className="flex items-center justify-center gap-1.5 p-2 text-gray-500 hover:text-brand-dark hover:bg-gray-50 rounded-lg transition-colors flex-1">
                    <FiEye size={14} />
                  </button>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <button onClick={() => handleEdit(banner)} className="flex items-center justify-center gap-1.5 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex-1">
                    <FiEdit2 size={14} />
                  </button>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <button onClick={() => handleDelete(banner._id)} className="flex items-center justify-center gap-1.5 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-1">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setIsAdding(true)}
          className="border-2 border-dashed border-gray-200 rounded-2xl min-h-[220px] flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-brand-pink hover:text-brand-pink hover:bg-brand-pink/5 transition-all group bg-white"
        >
          <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-brand-pink/10 flex items-center justify-center transition-colors">
            <FiPlus size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Add New Banner</span>
        </button>
      </div>
    </div>
  );
};

export default AdminBanners;
