import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiCalendar, FiClock, FiUploadCloud } from 'react-icons/fi';
import api from '../../utils/api';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '', category: '', excerpt: '', content: '', image: '', author: 'Sada Bharat Team', status: 'Published'
    });

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/blogs');
            setBlogs(res.data.data.blogs || []);
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBlogs(); }, []);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isModalOpen]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Base64 File Conversion
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const base64 = await fileToBase64(file);
            setFormData(prev => ({ ...prev, image: base64 }));
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.patch(`/blogs/${editingId}`, formData);
            } else {
                await api.post('/blogs', formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ title: '', category: '', excerpt: '', content: '', image: '', author: 'Sada Bharat Team', status: 'Published' });
            fetchBlogs();
        } catch (err) {
            alert('Operation failed: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this blog post?')) return;
        try {
            await api.delete(`/blogs/${id}`);
            fetchBlogs();
        } catch (err) {
            alert('Delete failed');
        }
    };

    return (
        <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Journal Management</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Editorial content & storytelling</p>
                </div>
                <button
                    onClick={() => { 
                        setEditingId(null); 
                        setFormData({ title: '', category: '', excerpt: '', content: '', image: '', author: 'Sada Bharat Team', status: 'Published' }); 
                        setIsModalOpen(true); 
                    }}
                    className="bg-admin-dark text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl"
                >
                    <FiPlus /> New Article
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse">
                    <div className="w-10 h-10 border-4 border-admin-accent border-t-admin-gold rounded-full mx-auto mb-4 animate-spin"></div>
                    <p className="text-sm font-sans font-medium text-gray-500 capitalize tracking-normal">Accessing Archives...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {blogs.map(blog => (
                        <div key={blog._id} className="bg-white group relative overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col h-[320px]">
                            <div className="aspect-[16/9] overflow-hidden relative flex-shrink-0">
                                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-2 left-2 bg-admin-gold text-white text-[7px] font-black px-2 py-0.5 uppercase tracking-tighter shadow-lg">{blog.category}</div>
                            </div>
                            <div className="p-4 flex flex-col flex-grow min-h-0">
                                <div className="flex items-center gap-3 text-[7px] text-gray-400 font-bold uppercase tracking-widest pt-0.5 mb-1.5">
                                    <span className="flex items-center gap-1"><FiCalendar className="text-admin-accent" size={10} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><FiClock className="text-admin-gold" size={10} /> {blog.readTime || '5 min'}</span>
                                </div>
                                <h3 className="text-sm font-['Cormorant',_serif] font-black text-admin-dark line-clamp-1 mb-1 italic tracking-tight">{blog.title}</h3>
                                <p className="text-[10px] text-gray-500 leading-tight line-clamp-3 font-medium">{blog.excerpt}</p>

                                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-sm ${blog.status === 'Published' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>{blog.status}</span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => { setEditingId(blog._id); setFormData(blog); setIsModalOpen(true); }} className="p-1.5 text-gray-300 hover:text-admin-accent transition-colors"><FiEdit2 size={12} /></button>
                                        <button onClick={() => handleDelete(blog._id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><FiTrash2 size={12} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && createPortal(
                <div data-lenis-prevent className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] overflow-y-auto flex justify-center py-10 px-4">
                    <div className="bg-white w-full max-w-4xl rounded-none shadow-2xl relative h-fit mb-10 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-[60] sticky top-0 shadow-sm">
                            <h2 className="text-3xl font-['Cormorant',_serif] font-bold text-admin-dark leading-none">
                                {editingId ? 'Refine Article' : 'Compose New Story'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-admin-dark p-2 leading-none text-xl transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="md:col-span-1 lg:col-span-1 space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Header Image</label>
                                    <div
                                        onClick={() => document.getElementById('blog-image-upload').click()}
                                        className="relative w-full aspect-video bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-admin-accent/[0.02] transition-all overflow-hidden group rounded-sm shadow-inner"
                                    >
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-1 animate-pulse">
                                                <FiUploadCloud className="text-admin-accent animate-bounce" size={20} />
                                            </div>
                                        ) : formData.image ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <FiUploadCloud size={20} className="text-gray-300" />
                                        )}
                                        <input id="blog-image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                </div>
                                <div className="md:col-span-1 lg:col-span-2 space-y-1">
                                    <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Image URL Override</label>
                                    <textarea 
                                        name="image" 
                                        value={formData.image} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full h-[calc(100%-16px)] bg-gray-50 border border-transparent p-2 text-[10px] font-bold font-mono text-gray-400 outline-none focus:bg-white focus:border-admin-accent-lite transition-all resize-none" 
                                        placeholder="https://res.cloudinary.com/..." 
                                    />
                                </div>

                                <div className="md:col-span-2 lg:col-span-1 space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Article Title</label>
                                    <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-gray-50 border border-transparent p-3 text-[11px] font-bold outline-none focus:bg-white focus:border-admin-accent-lite transition-all" placeholder="Headline..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                                    <input name="category" value={formData.category} onChange={handleChange} required className="w-full bg-gray-50 border border-transparent p-3 text-[11px] font-bold outline-none focus:bg-white focus:border-admin-accent-lite transition-all" placeholder="BRIDAL, SKIN..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Journal Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-50 border border-transparent p-3 text-[11px] font-bold outline-none focus:bg-white focus:border-admin-accent-lite transition-all">
                                        <option value="Published">Published</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Editorial Excerpt</label>
                                    <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} required className="w-full bg-gray-50 border border-transparent p-3 text-[11px] font-medium outline-none focus:bg-white focus:border-admin-accent-lite transition-all h-16 resize-none" placeholder="Brief summary..." />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Article Content</label>
                                    <textarea name="content" value={formData.content} onChange={handleChange} required className="w-full bg-gray-50 border border-transparent p-3 text-[11px] font-medium outline-none focus:bg-white focus:border-admin-accent-lite transition-all h-32" placeholder="Write your brand story here..." />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-5">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-bold uppercase text-gray-400 hover:text-admin-dark tracking-widest transition-colors px-4 py-2">Discard</button>
                                <button type="submit" className="bg-admin-dark text-white px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all">Save To Archive</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminBlogs;
