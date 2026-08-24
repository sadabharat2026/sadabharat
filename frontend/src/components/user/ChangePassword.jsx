import React, { useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import api from '../../utils/api';

const ChangePassword = () => {
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (passwordForm.next !== passwordForm.confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (passwordForm.next.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      await api.patch('/users/update-password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next
      });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setMessage('Password changed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-4 md:pt-6 pb-12 font-sans selection:bg-[#054425] selection:text-white">
      <div className="w-full px-4 lg:px-8 flex flex-col lg:flex-row gap-6">
        <ProfileSidebar activeTab="password" />

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#054425] mb-1">Change Password</h1>
              <p className="text-xs text-gray-500 font-medium">Update your account password</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#054425] focus:border-[#054425] block p-2.5 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#054425] focus:border-[#054425] block p-2.5 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#054425] focus:border-[#054425] block p-2.5 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
              {message && <p className="text-xs font-semibold text-green-700">{message}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#054425] text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-[#04331c] transition-colors shadow-md disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
