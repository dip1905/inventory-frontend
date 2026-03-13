import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getDashboard, getLowStock, getProducts, getCategories } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [lowStock, setLowStock] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, lowRes, productsRes, catsRes] = await Promise.all([
          getDashboard(),
          getLowStock(),
          getProducts(),
          getCategories()
        ]);
        setStats(statsRes.data);
        setLowStock(lowRes.data);

        const data = catsRes.data.map(cat => ({
          name: cat.name,
          count: productsRes.data.filter(
            p => p.category?.id === cat.id
          ).length
        }));
        setChartData(data);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#2563EB', '#16A34A', '#DC2626', '#9333EA', '#F59E0B'];

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12
                        border-4 border-blue-600 border-t-transparent">
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalProducts || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-sm">Categories</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.totalCategories || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-sm">Low Stock</p>
            <p className="text-3xl font-bold text-red-600">
              {stats.lowStockCount || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-sm">Inventory Value</p>
            <p className="text-2xl font-bold text-purple-600">
              ₹{stats.totalInventoryValue?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Chart */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              📊 Products by Category
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Products" radius={[4,4,0,0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-16">
                No data yet — add products!
              </p>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold text-red-600 mb-3">
              ⚠️ Low Stock Alerts
            </h2>
            {lowStock.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Qty</th>
                    <th className="text-left p-2">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 text-red-600 font-bold">
                        {p.quantity}
                      </td>
                      <td className="p-2">{p.lowStockThreshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-green-600 text-center py-16">
                ✅ All products well stocked!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}