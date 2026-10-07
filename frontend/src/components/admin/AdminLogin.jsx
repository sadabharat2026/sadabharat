import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { FiLock, FiMail, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { registerFCMToken } from '../../services/pushNotificationService';

import api from '../../utils/api';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, setUser, setIsAuthenticated } = useShop();

  // If already logged in as admin, redirect to dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.email) newErrors.email = 'Enter admin email';
    if (!form.password) newErrors.password = 'Enter password';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/users/login', {
        email: form.email,
        password: form.password
      });

      if (res.data.success && res.data.data.role === 'admin') {
        const token = res.data.data.token;
        const data = { name: res.data.data.name, email: res.data.data.email, role: 'admin' };
        
        localStorage.setItem('admin_token', token);
        registerFCMToken(true).catch(console.error);
        setUser(data);
        setIsAuthenticated(true);

        navigate('/admin');
      } else {
        throw new Error("Invalid admin credentials");
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || error.message || "Failed to authenticate" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#054425]/5 to-transparent blur-3xl"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-[#5C2E3E]/5 to-transparent blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 mb-6 p-2">
           <img src="/logo.png" alt="Sada Bharat Logo" className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
           <FiLock className="text-[#054425] text-2xl absolute opacity-20" />
        </div>
        <h2 className="text-center text-3xl font-['Cormorant',_serif] font-bold text-[#054425] tracking-wide">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-xs text-gray-500 font-poppins uppercase tracking-[0.2em] font-medium">
          Authorized Access Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-10 px-6 sm:px-10 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center">
                <p className="text-xs text-red-600 font-bold uppercase tracking-widest">{errors.submit}</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border ${errors.email ? 'border-red-300' : 'border-gray-200'} focus:border-[#054425] focus:bg-white rounded-xl pl-11 pr-4 py-3.5 text-sm text-gray-800 outline-none transition-all shadow-sm`}
                  placeholder="admin@sada-bharat.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border ${errors.password ? 'border-red-300' : 'border-gray-200'} focus:border-[#054425] focus:bg-white rounded-xl pl-11 pr-11 py-3.5 text-sm text-gray-800 outline-none transition-all shadow-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.password}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-xs font-bold uppercase tracking-[0.15em] text-white bg-[#054425] hover:bg-[#04331c] focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Secure Login'}
                {!loading && <FiArrowRight size={14} />}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
              Sada Bharat Ayurvedic v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
