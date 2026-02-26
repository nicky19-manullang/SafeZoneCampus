import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Users,
  Shield
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { reportService, adminService } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatDate, getStatusColor, getStatusLabel, getCaseTypeLabel, getCaseTypeColor } from '../../utils/helpers';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Helper functions to handle both camelCase and snake_case
const getReportStatus = (report) => {
  return (report.status || report.Status || '').toLowerCase();
};

const getReportCaseType = (report) => {
  return report.caseType || report.case_type || '';
};

const getReportDate = (report) => {
  return report.createdAt || report.created_at || report.createdAt;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [typeData, setTypeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, monthlyRes, typeRes] = await Promise.all([
        adminService.getDashboardStats(),
        reportService.getAllReports(),
        adminService.getMonthlyReports(),
        adminService.getReportsByType()
      ]);
      
      setStats(statsRes.data);
      // Handle both camelCase and snake_case responses
      const reportsList = reportsRes.data || [];
      setRecentReports(reportsList.slice(0, 5));
      setMonthlyData(monthlyRes.data);
      setTypeData(typeRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      label: 'Total Laporan',
      value: stats.total || stats.totalReports || 0,
      icon: FileText,
      color: 'bg-primary-100 text-primary-600',
      trend: '+12%'
    },
    {
      label: 'Baru',
      value: stats.baru || 0,
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
      trend: '+5%'
    },
    {
      label: 'Diproses',
      value: stats.proses || 0,
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-600',
      trend: '-3%'
    },
    {
      label: 'Selesai',
      value: stats.selesai || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      trend: '+8%'
    }
  ] : [];

  const pieChartData = typeData ? {
    labels: ['Fisik', 'Verbal', 'Siber', 'Sosial', 'Lain'],
    datasets: [{
      data: [typeData.fisik || 0, typeData.verbal || 0, typeData.siber || 0, typeData.sosial || 0, typeData.lain || 0],
      backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'],
      borderWidth: 0
    }]
  } : null;

  const barChartData = monthlyData ? {
    labels: monthlyData.labels,
    datasets: [{
      label: 'Laporan per Bulan',
      data: monthlyData.values,
      backgroundColor: '#2563eb',
      borderRadius: 6
    }]
  } : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Dashboard Admin, {user?.name}
            </h2>
            <p className="text-primary-100">
              Pantau dan tangani laporan perundungan di campus
            </p>
          </div>
          <Link to="/admin/laporan">
            <Button variant="light" size="lg">
              Kelola Laporan
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan per Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            {barChartData && (
              <Bar 
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Jenis Perundungan</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData && (
              <div className="h-64">
                <Pie 
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Laporan Terbaru</CardTitle>
          <Link to="/admin/laporan">
            <Button variant="ghost" size="sm">
              Lihat Semua
            </Button>
          </Link>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Belum ada laporan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCaseTypeColor(getReportCaseType(report))}`}>
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {getCaseTypeLabel(getReportCaseType(report))} • {report.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(getReportStatus(report))}>
                      {getStatusLabel(getReportStatus(report))}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(getReportDate(report))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
