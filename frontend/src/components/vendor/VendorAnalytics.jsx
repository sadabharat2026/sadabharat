import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../../utils/api';

const COLORS = ['#054425', '#4ade80', '#22c55e', '#16a34a', '#15803d'];

const VendorAnalytics = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fetch earnings chart data
        const earningsRes = await api.get('/vendors/earnings');
        if (earningsRes.data?.success) {
          const rawData = earningsRes.data.data.chartData || [];
          const formattedTraffic = rawData.map(item => ({
            name: item.date.split('-').slice(1).join('/'), // e.g., '06/19'
            sales: item.value
          }));
          setTrafficData(formattedTraffic);
        }

        // Fetch dashboard stats for top products
        const statsRes = await api.get('/vendors/dashboard-stats');
        if (statsRes.data?.success) {
          const rawProducts = statsRes.data.data.topProducts || [];
          const formattedProducts = rawProducts.map(p => ({
            name: p.name,
            value: parseInt(p.sales.replace(/[^0-9]/g, ''), 10) || 0
          }));
          setProductData(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#054425]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto -mt-2 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-black text-gray-900 leading-tight">Analytics</h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-sans">Detailed insights into your store's performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 h-80 flex flex-col justify-between">
          <h3 className="font-bold text-gray-900 text-[13px] flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-gray-400"/> Daily Earnings
          </h3>
          <div className="flex-1 w-full h-full min-h-0">
            {trafficData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dx={-10} />
                  <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="sales" fill="#054425" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center border-dashed">
                <span className="text-[12px] text-gray-400 font-medium">No earnings data available yet.</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 h-80 flex flex-col justify-between">
          <h3 className="font-bold text-gray-900 text-[13px] flex items-center gap-2 mb-4">
            <PieChart size={16} className="text-gray-400"/> Sales by Product
          </h3>
          <div className="flex-1 w-full h-full min-h-0">
            {productData.length > 0 && productData.some(p => p.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center border-dashed">
                <span className="text-[12px] text-gray-400 font-medium">No product sales data available yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
