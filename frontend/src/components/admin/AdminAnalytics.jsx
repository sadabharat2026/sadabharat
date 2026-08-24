import React, { useState, useEffect, useCallback } from 'react';
import {
  FiUsers,
  FiRefreshCw,
  FiTrendingUp,
  FiUserPlus,
  FiRepeat,
  FiShoppingBag,
  FiPackage,
  FiClock
} from 'react-icons/fi';
import { HiCurrencyRupee } from 'react-icons/hi2';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import api from '../../utils/api';

const PIE_COLORS = ['#0A3A20', '#D4AF37', '#5C2E3E', '#4A90E2'];
const RANGE_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '1 Year', value: 365 }
];

const CHART_FONT = { fontFamily: "'Poppins', sans-serif", fontSize: 10, fill: '#888' };
const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: 12,
  fontFamily: "'Poppins', sans-serif"
};
const LEGEND_STYLE = { fontSize: 11, fontFamily: "'Poppins', sans-serif", paddingTop: 8 };

const formatCurrency = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN')}`;

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const AdminAnalytics = () => {
  const [rangeDays, setRangeDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admins/analytics?days=${rangeDays}`);
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data);
      } else {
        setError('Failed to load analytics');
      }
    } catch (err) {
      console.error('Analytics fetch failed:', err);
      setError(err.response?.data?.message || err.parsedMessage || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = data?.summary || {};
  const frequencyDistribution = data?.frequencyDistribution || [];
  const repeatTrend = data?.repeatTrend || [];
  const signupTrend = data?.signupTrend || [];
  const topRepeatCustomers = data?.topRepeatCustomers || [];
  const recentUsers = data?.recentUsers || [];

  const segmentData = [
    { name: 'One-time', value: summary.oneTimeCustomers || 0 },
    { name: 'Existing', value: summary.repeatCustomers || 0 },
    { name: 'No orders', value: summary.usersNeverOrdered || 0 }
  ].filter((d) => d.value > 0);

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto font-sans py-20 text-center animate-pulse">
        <div className="w-10 h-10 border-4 border-admin-gold border-t-admin-accent rounded-full mx-auto mb-4 animate-spin" />
        <p className="text-sm font-sans font-medium text-gray-500">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto font-sans space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-['Cormorant',_serif] font-bold text-admin-dark leading-none mb-2">
            Analytics
          </h1>
          <p className="text-gray-500 text-[13px] font-poppins">
            Live user growth and new vs existing customer insights from your store database.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRangeDays(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold font-poppins transition-colors ${
                  rangeDays === opt.value
                    ? 'bg-admin-dark text-white'
                    : 'text-gray-500 hover:text-admin-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold font-poppins text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={14} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-poppins rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Store overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Users',
            value: summary.totalUsers ?? 0,
            icon: <FiUsers />,
            color: 'bg-[#E1F0FF]',
            iconColor: 'text-[#4A90E2]'
          },
          {
            label: 'Total Orders',
            value: summary.totalOrders ?? 0,
            icon: <FiShoppingBag />,
            color: 'bg-[#FEF0D5]',
            iconColor: 'text-[#FFB347]'
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(summary.totalRevenue),
            icon: <HiCurrencyRupee />,
            color: 'bg-[#D1F2E1]',
            iconColor: 'text-[#50C878]'
          },
          {
            label: 'Total Products',
            value: summary.totalProducts ?? 0,
            icon: <FiPackage />,
            color: 'bg-[#FEE2EC]',
            iconColor: 'text-[#FF69B4]'
          }
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-lg ${card.color} ${card.iconColor} flex items-center justify-center text-lg shrink-0`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold font-poppins">{card.label}</p>
              <p className="text-xl font-['Cormorant',_serif] font-bold text-admin-dark leading-none mt-1 truncate">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Customer analytics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          {
            label: `New Signups (${rangeDays}d)`,
            value: summary.newSignupsInRange ?? 0,
            icon: <FiUserPlus />,
            color: 'bg-[#D1F2E1]',
            iconColor: 'text-[#50C878]'
          },
          {
            label: 'Existing Customers',
            value: summary.repeatCustomers ?? 0,
            icon: <FiRepeat />,
            color: 'bg-[#FEF0D5]',
            iconColor: 'text-admin-gold'
          },
          {
            label: 'One-time Buyers',
            value: summary.oneTimeCustomers ?? 0,
            icon: <FiShoppingBag />,
            color: 'bg-[#FEE2EC]',
            iconColor: 'text-[#FF69B4]'
          },
          {
            label: 'Pending Orders',
            value: summary.pendingOrders ?? 0,
            icon: <FiClock />,
            color: 'bg-[#FEE7DC]',
            iconColor: 'text-[#FF8C69]'
          },
          {
            label: 'Existing Rate',
            value: `${summary.repeatRate ?? 0}%`,
            icon: <FiTrendingUp />,
            color: 'bg-[#EDE7F6]',
            iconColor: 'text-[#7E57C2]'
          },
          {
            label: 'Avg Orders / Buyer',
            value: summary.avgOrdersPerCustomer ?? 0,
            icon: <FiUsers />,
            color: 'bg-[#E1F0FF]',
            iconColor: 'text-[#4A90E2]'
          }
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${card.color} ${card.iconColor} flex items-center justify-center text-lg`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold font-poppins">{card.label}</p>
              <p className="text-xl font-['Cormorant',_serif] font-bold text-admin-dark mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm h-[360px] flex flex-col">
          <div className="mb-3">
            <h3 className="text-lg font-['Cormorant',_serif] font-bold text-admin-dark flex items-center gap-2">
              <FiRepeat className="text-admin-gold" size={16} />
              New vs Existing
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-poppins">
              Daily orders from new customers vs existing customers
            </p>
          </div>
          <div className="flex-1 min-h-0">
            {repeatTrend.some((d) => d.totalOrders > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={repeatTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="newOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A3A20" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0A3A20" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="repeatOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={CHART_FONT} interval="preserveStartEnd" dy={8} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={CHART_FONT} />
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
                  <Area type="monotone" dataKey="newOrders" name="New customers" stroke="#0A3A20" fill="url(#newOrdersGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="repeatOrders" name="Existing customers" stroke="#D4AF37" fill="url(#repeatOrdersGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No order activity in this range yet." />
            )}
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm h-[360px] flex flex-col">
          <div className="mb-3">
            <h3 className="text-lg font-['Cormorant',_serif] font-bold text-admin-dark">Customer Segments</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-poppins">New vs existing vs never ordered</p>
          </div>
          <div className="flex-1 min-h-0">
            {segmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={segmentData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {segmentData.map((_, index) => (
                      <Cell key={`seg-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No customer segment data yet." />
            )}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm h-[320px] flex flex-col">
          <div className="mb-3">
            <h3 className="text-lg font-['Cormorant',_serif] font-bold text-admin-dark flex items-center gap-2">
              <FiUserPlus className="text-[#50C878]" size={16} />
              New User Signups
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-poppins">Daily registrations from database</p>
          </div>
          <div className="flex-1 min-h-0">
            {signupTrend.some((d) => d.signups > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={CHART_FONT} interval="preserveStartEnd" dy={8} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={CHART_FONT} />
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="signups" name="Signups" stroke="#125A35" strokeWidth={2.5} dot={{ r: 3, fill: '#125A35' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No new signups in this range." />
            )}
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm h-[320px] flex flex-col">
          <div className="mb-3">
            <h3 className="text-lg font-['Cormorant',_serif] font-bold text-admin-dark">Order Frequency</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-poppins">How often customers come back to buy</p>
          </div>
          <div className="flex-1 min-h-0">
            {frequencyDistribution.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyDistribution} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={CHART_FONT} dy={8} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={CHART_FONT} />
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Customers" fill="#0A3A20" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No purchase frequency data yet." />
            )}
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-gray-100">
            <h3 className="text-lg font-['Cormorant',_serif] font-bold text-admin-dark">Existing Customers</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-poppins">Existing customers with 2+ orders from live order data</p>
          </div>

          {topRepeatCustomers.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400 font-poppins">
              No existing customers yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-admin-light text-[10px] uppercase tracking-wider text-gray-500 font-bold font-poppins">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Spent</th>
                    <th className="px-4 py-3">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topRepeatCustomers.map((c, idx) => (
                    <tr key={c._id || idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-admin-dark text-white text-[11px] font-bold font-['Cormorant',_serif] flex items-center justify-center shrink-0">
                            {(c.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 font-poppins truncate">{c.name || 'Unknown'}</p>
                            <p className="text-[10px] text-gray-400 font-poppins truncate">{c.mobile || c.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF0D5] text-[#8B6914] text-[11px] font-bold font-poppins">
                          {c.orderCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-admin-dark font-poppins">
                        {formatCurrency(c.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-poppins">{formatDate(c.lastOrderAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-gray-100">
            <h3 className="text-lg font-['Cormorant',_serif] font-bold text-admin-dark">New Customers</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-poppins">Newest customer accounts from database</p>
          </div>

          {recentUsers.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400 font-poppins">
              No new customers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-admin-light text-[10px] uppercase tracking-wider text-gray-500 font-bold font-poppins">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-admin-dark text-white text-[11px] font-bold font-['Cormorant',_serif] flex items-center justify-center shrink-0">
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-800 font-poppins">{u.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-poppins">{u.mobile || u.email || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-poppins">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-poppins ${
                            u.isBlocked
                              ? 'bg-red-50 text-red-600'
                              : 'bg-green-50 text-green-600'
                          }`}
                        >
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyChart = ({ message }) => (
  <div className="w-full h-full bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center">
    <span className="text-[12px] text-gray-400 font-medium font-poppins">{message}</span>
  </div>
);

export default AdminAnalytics;
