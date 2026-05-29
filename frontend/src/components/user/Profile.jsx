import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMail, FiMapPin, FiShoppingBag, FiHeart, FiLogOut, FiEdit2, FiMessageSquare } from 'react-icons/fi';
import api from '../../utils/api';

const Profile = () => {
  const { user, isAuthenticated, logout, wishlistCount } = useShop();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bankDetails: {
      accountName: user?.bankDetails?.accountName || '',
      bankName: user?.bankDetails?.bankName || '',
      accountNumber: user?.bankDetails?.accountNumber || '',
      ifscCode: user?.bankDetails?.ifscCode || ''
    }
  });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bankDetails: {
          accountName: user.bankDetails?.accountName || '',
          bankName: user.bankDetails?.bankName || '',
          accountNumber: user.bankDetails?.accountNumber || '',
          ifscCode: user.bankDetails?.ifscCode || ''
        }
      });
      // Fetch dynamic order count
      api.get('/orders/my-orders').then(res => {
        if (res.data.status === 'success') {
          setTotalOrders(res.data.data.orders.length);
        }
      }).catch(err => console.error(err));
    }
  }, [isAuthenticated, navigate, user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = async (section) => {
    if (section === 'profile') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!editForm.email || !emailRegex.test(editForm.email)) {
        alert("Please enter a valid email address.");
        return;
      }
    }
    
    try {
      const res = await api.patch('/users/update-me', editForm);
      setUser(res.data.data.user);
      if (section === 'profile') setIsEditingProfile(false);
      if (section === 'address') setIsEditingAddress(false);
      if (section === 'bank') setIsEditingBank(false);
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-6 md:pt-8 pb-12">
      <div className="w-full px-4 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-black text-[#054425] uppercase tracking-tighter mb-6 border-b border-gray-100 pb-2">
          Your <span className="text-[#D4AF37] italic">Sanctuary</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main User Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-[1.5rem] p-6 text-center border border-gray-100 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-24 bg-[#054425]/5 -z-10 group-hover:bg-[#054425]/10 transition-colors"></div>

              <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-md mx-auto mb-3 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[#054425] rounded-full flex items-center justify-center">
                  <span className="text-2xl font-serif text-[#D4AF37] italic">
                    {editForm.name ? editForm.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="absolute bottom-0 right-0 p-1 bg-[#D4AF37] text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
                  >
                    <FiEdit2 size={10} />
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-3 mb-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-center font-serif font-bold text-[#054425] border-b border-[#054425]/30 focus:border-[#054425] outline-none bg-transparent py-1 text-sm"
                    placeholder="Full Name"
                  />
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Editing Profile</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-serif font-bold text-[#054425] mb-0.5">{user?.name}</h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">{user?.role === 'customer' ? 'VIP Member' : 'Admin'}</p>
                </>
              )}

              <div className="space-y-3 text-left border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F4F8F5] flex items-center justify-center text-[#054425]">
                    <FiPhone size={12} />
                  </div>
                  <div className="flex-1">
                    <span className="block text-[7px] font-black uppercase tracking-widest text-[#054425]/50">Mobile</span>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        maxLength={10}
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="text-[11px] font-bold text-gray-800 border-b border-[#054425]/20 focus:border-[#054425] outline-none bg-transparent w-full"
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-gray-800">+91 {user?.phone}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F4F8F5] flex items-center justify-center text-[#054425]">
                    <FiMail size={12} />
                  </div>
                  <div className="flex-1">
                    <span className="block text-[7px] font-black uppercase tracking-widest text-[#054425]/50">Email</span>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="text-[11px] font-bold text-gray-800 border-b border-[#054425]/20 focus:border-[#054425] outline-none bg-transparent w-full"
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-gray-800 truncate block max-w-[140px]">{user?.email || 'Not Provided'}</span>
                    )}
                  </div>
                </div>
              </div>

              {isEditingProfile ? (
                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="py-2.5 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('profile')}
                    className="py-2.5 bg-[#054425] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-opacity-90 shadow-lg shadow-[#054425]/20 transition-all"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full mt-6 py-2.5 bg-red-50 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <FiLogOut /> Logout
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats & Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link to="/profile?tab=orders" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#054425]/30 hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-[#054425]/10 rounded-full flex items-center justify-center text-[#054425] group-hover:bg-[#054425] group-hover:text-white transition-colors">
                  <FiShoppingBag size={20} />
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Total Orders</span>
                  <span className="text-2xl font-serif text-[#054425] font-bold">{totalOrders}</span>
                </div>
              </Link>
              <Link to="/wishlist" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#D4AF37]/30 hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                  <FiHeart size={20} />
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Wishlist</span>
                  <span className="text-2xl font-serif text-[#054425] font-bold">{wishlistCount || 0}</span>
                </div>
              </Link>
              <Link to="/support" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group col-span-2 md:col-span-1">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                  <FiMessageSquare size={20} />
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Assistance</span>
                  <span className="text-[13px] font-black uppercase tracking-[0.05em] text-[#054425]">Raise Ticket</span>
                </div>
              </Link>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#054425] flex items-center gap-2">
                  <FiMapPin /> Saved Addresses
                </h3>
                {!isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-[9px] font-black uppercase tracking-widest text-[#054425] border-b border-[#054425] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                  >
                    Edit Address
                  </button>
                )}
              </div>

              <div className={`border rounded-xl p-5 relative transition-all ${isEditingAddress ? 'border-[#054425] bg-white shadow-inner' : 'border-[#054425]/20 bg-[#F4F8F5]'}`}>
                {isEditingAddress ? (
                  <div className="space-y-3">
                    <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest text-[#054425]">
                      Editing
                    </div>
                    <h4 className="font-bold text-[#054425] text-xs uppercase tracking-widest">Primary Address</h4>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-[12px] font-medium text-gray-800 focus:border-[#054425] outline-none min-h-[80px]"
                      placeholder="Enter your full address..."
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setIsEditingAddress(false)}
                        className="px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave('address')}
                        className="px-4 py-2 bg-[#054425] text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-opacity-90 shadow-lg shadow-[#054425]/20 transition-all"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest text-white bg-[#054425] px-2.5 py-1 rounded-full shadow-sm">
                      Primary
                    </div>
                    <h4 className="font-bold text-[#054425] mb-2 text-sm">{user?.name}</h4>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed max-w-[320px]">
                      {user?.address || 'No address saved.'}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-t border-[#054425]/10 pt-3 mt-4 block w-full">+91 {user?.phone}</p>
                  </>
                )}
              </div>
            </div>

            {/* Refund Account Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#054425]/5 rounded-full -mr-16 -mt-16 -z-10"></div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#054425] flex items-center gap-2">
                  <FiShoppingBag /> Refund Account Details
                </h3>
                {!isEditingBank ? (
                  <button onClick={() => setIsEditingBank(true)} className="text-[9px] font-black uppercase tracking-widest text-[#054425] border-b border-[#054425] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors">
                    Edit Details
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingBank(false)} className="text-[9px] font-black uppercase tracking-widest text-gray-400">Cancel</button>
                    <button onClick={() => handleSave('bank')} className="text-[9px] font-black uppercase tracking-widest text-[#054425]">Save</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Account Holder Name</label>
                  {isEditingBank ? (
                    <input
                      type="text"
                      value={editForm.bankDetails.accountName}
                      onChange={(e) => setEditForm({ ...editForm, bankDetails: { ...editForm.bankDetails, accountName: e.target.value } })}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-4 py-2.5 text-[12px] font-bold text-gray-800 outline-none focus:border-[#054425]/50"
                      placeholder="Name per records"
                    />
                  ) : (
                    <p className="text-[12px] font-black text-gray-800">{user?.bankDetails?.accountName || '---'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Account Number</label>
                  {isEditingBank ? (
                    <input
                      type="text"
                      value={editForm.bankDetails.accountNumber}
                      onChange={(e) => setEditForm({ ...editForm, bankDetails: { ...editForm.bankDetails, accountNumber: e.target.value } })}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-4 py-2.5 text-[12px] font-bold text-gray-800 outline-none focus:border-[#054425]/50"
                      placeholder="000000000000"
                    />
                  ) : (
                    <p className="text-[12px] font-black text-gray-800">{user?.bankDetails?.accountNumber ? `•••• •••• ${user.bankDetails.accountNumber.slice(-4)}` : '---'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Bank Name</label>
                  {isEditingBank ? (
                    <input
                      type="text"
                      value={editForm.bankDetails.bankName}
                      onChange={(e) => setEditForm({ ...editForm, bankDetails: { ...editForm.bankDetails, bankName: e.target.value } })}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-4 py-2.5 text-[12px] font-bold text-gray-800 outline-none focus:border-[#054425]/50"
                      placeholder="Bank Name"
                    />
                  ) : (
                    <p className="text-[12px] font-black text-gray-800">{user?.bankDetails?.bankName || '---'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">IFSC Code</label>
                  {isEditingBank ? (
                    <input
                      type="text"
                      value={editForm.bankDetails.ifscCode}
                      onChange={(e) => setEditForm({ ...editForm, bankDetails: { ...editForm.bankDetails, ifscCode: e.target.value.toUpperCase() } })}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-4 py-2.5 text-[12px] font-bold text-gray-800 outline-none focus:border-[#054425]/50"
                      placeholder="IFSC0000000"
                    />
                  ) : (
                    <p className="text-[12px] font-black text-gray-800">{user?.bankDetails?.ifscCode || '---'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
