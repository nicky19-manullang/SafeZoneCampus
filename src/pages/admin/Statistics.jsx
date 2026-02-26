import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { adminService } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { getCaseTypeLabel } from '../../utils/helpers';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [typeData, setTypeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsRes, monthlyRes, typeRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getMonthlyReports(),
        adminService.getReportsByType()
      ]);
      
      console.log('Stats Response:', statsRes);
      console.log('Monthly Response:', monthlyRes);
      console.log('Type Response:', typeRes);
      
      setStats(statsRes.data);
      setMonthlyData(monthlyRes.data);
      // typeRes.data is already an object, not {data: object}
      setTypeData(typeRes.data || typeRes);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bar chart config
  const barChartData = monthlyData ? {
    labels: monthlyData.labels,
    datasets: [{
      label: 'Jumlah Laporan',
      data: monthlyData.values,
      backgroundColor: '#2563eb',
      borderRadius: 6
    }]
  } : null;

  // Pie chart config
  const pieChartData = typeData ? {
    labels: Object.keys(typeData).map(key => getCaseTypeLabel(key)),
    datasets: [{
      data: Object.values(typeData),
      backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'],
      borderWidth: 0
    }]
  } : null;

  // Trend chart (simulated)
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Laporan',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Diselesaikan',
        data: [8, 12, 10, 18, 16, 22],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Laporan</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.totalReports || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Diproses</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.proses || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Selesai</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.selesai || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tingkat Penyelesaian</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.resolvedRate || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan per Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {barChartData ? <Bar data={barChartData} options={chartOptions} /> : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Tidak ada data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Case Types */}
        <Card>
          <CardHeader>
            <CardTitle>Jenis Perundungan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {pieChartData ? <Pie data={pieChartData} options={{...chartOptions, scales: undefined}} /> : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Tidak ada data
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tren Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <Line data={trendData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistik per Jenis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeData && Object.entries(typeData).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      key === 'fisik' ? 'bg-red-500' :
                      key === 'verbal' ? 'bg-orange-500' :
                      key === 'siber' ? 'bg-purple-500' :
                      key === 'sosial' ? 'bg-pink-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-slate-700">{getCaseTypeLabel(key)}</span>
                  </div>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
              {(!typeData || Object.keys(typeData).length === 0) && (
                <p className="text-slate-500 text-center py-4">Tidak ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Rata-rata laporan per bulan</span>
                <span className="font-semibold">~{Math.round((stats?.totalReports || 0) / 6)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Tingkat penyelesaian</span>
                <span className="font-semibold text-green-600">{stats?.resolvedRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Laporan belum diproses</span>
                <span className="font-semibold text-yellow-600">{stats?.baru || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
