import React, { useState, useEffect } from 'react';
import { FiUsers, FiCheckCircle, FiXCircle, FiEye, FiShoppingBag, FiStar, FiRefreshCw, FiShieldOff } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

import api from '../../utils/api';

const AdminVendors = () => {
    const location = useLocation();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVendor, setSelectedVendor] = useState(null); // For details modal

    const currentTab = location.pathname.includes('/pending') 
        ? 'pending' 
        : location.pathname.includes('/blocked') 
            ? 'blocked' 
            : 'approved';

    const fetchVendors = async () => {
        try {
            setLoading(true);
            let endpoint = '/vendors/approved';
            if (currentTab === 'pending') endpoint = '/vendors/pending';
            if (currentTab === 'blocked') endpoint = '/vendors/blocked';
            
            const res = await api.get(endpoint);
            setVendors(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch vendors', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, [currentTab]);

    const handleStatusChange = async (vendorId, action) => {
        try {
            if (action === 'approved') {
                await api.put(`/vendors/${vendorId}/approve`);
            } else if (action === 'blocked') {
                await api.put(`/vendors/${vendorId}/block`);
            } else if (action === 'unblock') {
                await api.put(`/vendors/${vendorId}/unblock`);
            }
            
            // Remove the vendor from the current view after status change
            setVendors(prev => prev.filter(v => v._id !== vendorId));
            setSelectedVendor(null);
        } catch (err) {
            alert(`Failed to ${action} vendor`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 p-4 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-['Cormorant',_serif] font-bold text-admin-dark leading-none mb-2">
                        {currentTab === 'pending' ? 'New Joining Requests' : currentTab === 'blocked' ? 'Blocked Vendors' : 'Existing Vendors'}
                    </h1>
                    <p className="text-gray-500 text-[13px] font-poppins">
                        Manage seller accounts, verify credentials, and oversee store performance.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all">
                        Export List
                    </button>
                    <button className="bg-admin-dark text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-lg hover:bg-black transition-all">
                        + Onboard Vendor
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse">
                    <div className="w-10 h-10 border-4 border-admin-gold border-t-admin-accent rounded-full mx-auto mb-4 animate-spin"></div>
                    <p className="text-sm font-sans font-medium text-gray-500">Loading Vendors...</p>
                </div>
            ) : vendors.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                    <FiUsers className="mx-auto text-gray-200 mb-4" size={48} />
                    <h3 className="text-xl font-['Cormorant',_serif] font-bold text-admin-dark mb-2">No Active Vendors</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Currently, there are no third-party sellers registered on the platform.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-500">VENDOR DETAILS</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-500">STORE NAME</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-500">JOINED DATE</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-500">METRICS</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-500">STATUS</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-500 text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {vendors.map(vendor => (
                                    <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-admin-dark text-white flex flex-col items-center justify-center font-['Cormorant',_serif] font-bold text-lg leading-none">
                                                    {(vendor.fullName || vendor.name || 'V').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{vendor.fullName || vendor.name}</p>
                                                    <p className="text-xs text-gray-500">{vendor.email}</p>
                                                    <p className="text-[10px] text-gray-400">{vendor.mobile || vendor.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-800">{vendor.storeName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">{new Date(vendor.createdAt || vendor.joinedAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <FiShoppingBag size={12} className="text-gray-400" /> {vendor.productsCount || 0} Products
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <FiStar size={12} className="text-admin-gold" fill="currentColor" /> {vendor.rating > 0 ? vendor.rating : 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                                                vendor.isBlocked ? 'bg-red-50 text-red-600' :
                                                vendor.isApproved ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                                {vendor.isBlocked ? 'Blocked' : vendor.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                <button onClick={() => setSelectedVendor(vendor)} className="p-2 bg-gray-100 hover:bg-admin-dark hover:text-white rounded-lg transition-all" title="View Details">
                                                    <FiEye size={14} />
                                                </button>
                                                {currentTab === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleStatusChange(vendor._id, 'approved')} className="p-2 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="Approve">
                                                            <FiCheckCircle size={14} />
                                                        </button>
                                                        <button onClick={() => handleStatusChange(vendor._id, 'blocked')} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Reject/Block">
                                                            <FiXCircle size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                {currentTab === 'approved' && (
                                                    <button onClick={() => handleStatusChange(vendor._id, 'blocked')} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Block Vendor">
                                                        <FiShieldOff size={14} />
                                                    </button>
                                                )}
                                                {currentTab === 'blocked' && (
                                                    <button onClick={() => handleStatusChange(vendor._id, 'unblock')} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-all" title="Unblock Vendor">
                                                        <FiRefreshCw size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vendor Details Modal */}
            {selectedVendor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-['Cormorant',_serif] font-bold text-admin-dark">Vendor Profile</h2>
                            <button onClick={() => setSelectedVendor(null)} className="text-gray-400 hover:text-admin-dark">
                                <FiXCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-admin-dark text-white flex flex-col items-center justify-center font-['Cormorant',_serif] font-bold text-3xl leading-none">
                                    {(selectedVendor.fullName || selectedVendor.name || 'V').charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{selectedVendor.storeName}</h3>
                                    <p className="text-sm text-gray-500">Operated by: {selectedVendor.fullName || selectedVendor.name}</p>
                                    <span className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                                        selectedVendor.isApproved ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                    }`}>
                                        {selectedVendor.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Info</p>
                                    <p className="text-sm text-gray-800 font-medium">{selectedVendor.email}</p>
                                    <p className="text-sm text-gray-800 font-medium">{selectedVendor.mobile || selectedVendor.phone}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Business Details</p>
                                    <p className="text-sm text-gray-800 font-medium">Type: {selectedVendor.businessType}</p>
                                    <p className="text-sm text-gray-800 font-medium">GST: {selectedVendor.gstNumber}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Location Info</p>
                                    <p className="text-sm text-gray-800 font-medium">{selectedVendor.businessAddress}</p>
                                    <p className="text-sm text-gray-800 font-medium">{selectedVendor.city}, {selectedVendor.state}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Details</p>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <p className="text-sm text-gray-800 font-medium">Bank: {selectedVendor.bankName}</p>
                                        <p className="text-sm text-gray-800 font-medium">Holder: {selectedVendor.accountHolderName}</p>
                                        <p className="text-sm text-gray-800 font-medium">A/C No: {selectedVendor.accountNumber}</p>
                                        <p className="text-sm text-gray-800 font-medium">IFSC: {selectedVendor.ifscCode}</p>
                                        {selectedVendor.upiId && <p className="text-sm text-gray-800 font-medium">UPI: {selectedVendor.upiId}</p>}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Store Description</p>
                                    <p className="text-sm text-gray-800 font-medium">{selectedVendor.storeDescription}</p>
                                    {selectedVendor.categories?.length > 0 && (
                                        <p className="text-sm text-gray-800 font-medium mt-2">Categories: {selectedVendor.categories.join(', ')}</p>
                                    )}
                                </div>

                                {selectedVendor.documents && selectedVendor.documents.length > 0 && (
                                    <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Uploaded Documents</p>
                                        <div className="flex flex-wrap gap-4">
                                            {selectedVendor.documents.map((doc, idx) => {
                                                const url = doc.startsWith('http') ? doc : `http://localhost:5200${doc}`;
                                                const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                                                return (
                                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                                                        {isImage ? (
                                                            <img src={url} alt={`Document ${idx + 1}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase">View Doc</span>
                                                            </div>
                                                        )}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            {currentTab === 'pending' && (
                                <>
                                    <button onClick={() => handleStatusChange(selectedVendor._id, 'blocked')} className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-all">
                                        Reject/Block Vendor
                                    </button>
                                    <button onClick={() => handleStatusChange(selectedVendor._id, 'approved')} className="px-6 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-all">
                                        Approve Vendor
                                    </button>
                                </>
                            )}
                            {currentTab === 'approved' && (
                                <button onClick={() => handleStatusChange(selectedVendor._id, 'blocked')} className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-all">
                                    Block Vendor
                                </button>
                            )}
                            {currentTab === 'blocked' && (
                                <button onClick={() => handleStatusChange(selectedVendor._id, 'unblock')} className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all">
                                    Unblock Vendor
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;
