import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Bell, CheckCircle, 
  AlertCircle, Download, RefreshCw, Calendar, Filter 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const NotificationAnalyticsDashboard = () => {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, realtimeRes] = await Promise.all([
        api.get(`/admin/notifications/analytics/dashboard?days=${period}`),
        api.get('/admin/notifications/analytics/realtime'),
      ]);
      setData(dashRes.data);
      setRealtime(realtimeRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [period]);

  const exportData = async (format) => {
    try {
      const response = await api.get(`/admin/notifications/analytics/export?format=${format}&days=${period}`, {
        responseType: format === 'csv' ? 'blob' : 'json',
      });
      
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `notification-analytics-${period}d.csv`);
        document.body.appendChild(link);
        link.click();
      }
      
      toast.success('Export downloaded');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Analytics</h2>
          <p className="text-gray-500">Track delivery, engagement, and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchDashboard}
            className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Realtime Stats */}
      {realtime && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Last 24h Sent"
            value={realtime.last_24h.sent}
            icon={Bell}
            color="blue"
          />
          <StatCard
            title="Last 24h Delivered"
            value={realtime.last_24h.delivered}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Last 24h Opened"
            value={realtime.last_24h.opened}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Pending Delivery"
            value={realtime.pending_delivery}
            icon={AlertCircle}
            color="yellow"
            alert={realtime.pending_delivery > 100}
          />
        </div>
      )}

      {/* Overall Stats */}
      {data?.overall && (
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Delivery Rate"
            value={`${data.overall.delivery_rate}%`}
            trend={data.overall.delivery_rate > 95 ? 'up' : 'down'}
            subtitle={`${data.overall.total_delivered} / ${data.overall.total_sent}`}
          />
          <MetricCard
            title="Open Rate"
            value={`${data.overall.open_rate}%`}
            trend={data.overall.open_rate > 40 ? 'up' : 'down'}
            subtitle={`${data.overall.total_opened} opened`}
          />
          <MetricCard
            title="Click Rate"
            value={`${data.overall.click_rate}%`}
            trend={data.overall.click_rate > 10 ? 'up' : 'down'}
            subtitle={`${data.overall.total_clicked} clicked`}
          />
          <MetricCard
            title="Active Users"
            value={data.user_engagement.total_users_with_notifications}
            subtitle={`${data.user_engagement.avg_notifications_per_user} avg/user`}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Daily Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.daily_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
              <Line type="monotone" dataKey="delivered" stroke="#82ca9d" name="Delivered" />
              <Line type="monotone" dataKey="opened" stroke="#ffc658" name="Opened" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">By Channel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.by_channel}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ channel, total }) => `${channel}: ${total}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
                nameKey="channel"
              >
                {data?.by_channel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing */}
      {data?.top_performing?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Top Performing Notifications</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Opens</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clicks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.top_performing.map((n) => (
                <tr key={n.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-xs">
                    {n.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{n.type}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{n.open_count}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{n.click_count}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-cyan-600">
                    {((n.click_count / n.open_count) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, alert }) => (
  <div className={`bg-white p-4 rounded-xl shadow-sm border ${alert ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-${color}-100`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  </div>
);

const MetricCard = ({ title, value, trend, subtitle }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
      {trend && (
        <div className={`p-1 rounded ${trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </div>
      )}
    </div>
  </div>
);

export default NotificationAnalyticsDashboard;