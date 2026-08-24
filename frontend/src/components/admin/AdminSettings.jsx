import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiLogOut, FiPhone } from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AdminSettings = () => {
  const { user, setUser, logout } = useShop();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || user?.mobile || ''
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || user.mobile || ''
    });
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/users/profile', {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        mobile: profileForm.phone
      });
      const updated = res.data?.data?.user || {};
      setUser((prev) => ({ ...prev, ...updated, name: updated.name, email: updated.email, phone: updated.mobile || profileForm.phone }));
      alert('Profile updated successfully.');
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert('New passwords do not match.');
      return;
    }
    if (passwordForm.new.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.patch('/users/update-password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new
      });
      setPasswordForm({ current: '', new: '', confirm: '' });
      alert('Password changed successfully.');
    } catch (err) {
      alert('Failed to change password: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    if (!window.confirm('End this admin session?')) return;
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8 font-sans">
      <div>
        <h1 className="text-3xl font-['Cormorant',_serif] font-bold text-admin-dark leading-none mb-2">Settings</h1>
        <p className="text-gray-500 text-sm">Profile and password only</p>
      </div>

      <form onSubmit={handleProfileUpdate} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-admin-dark flex items-center gap-2">
          <FiUser /> Admin profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-400">Name</span>
            <input
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-admin-dark"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FiMail size={11} /> Email</span>
            <input
              type="email"
              required
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-admin-dark"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><FiPhone size={11} /> Phone</span>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-admin-dark"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={savingProfile} className="inline-flex items-center gap-2 bg-admin-dark text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50">
            <FiSave size={14} /> {savingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordUpdate} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-admin-dark flex items-center gap-2">
          <FiLock /> Change password
        </h2>
        <label className="space-y-1 block">
          <span className="text-[10px] font-bold uppercase text-gray-400">Current password</span>
          <input
            type="password"
            required
            value={passwordForm.current}
            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-admin-dark"
          />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-400">New password</span>
            <input
              type="password"
              required
              minLength={6}
              value={passwordForm.new}
              onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-admin-dark"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-400">Confirm new password</span>
            <input
              type="password"
              required
              minLength={6}
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-admin-dark"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={savingPassword} className="inline-flex items-center gap-2 bg-[#054425] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50">
            <FiLock size={14} /> {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 py-3 rounded-2xl text-sm font-bold transition-colors"
      >
        <FiLogOut /> Logout
      </button>
    </div>
  );
};

export default AdminSettings;
