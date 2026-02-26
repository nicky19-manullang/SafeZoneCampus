import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  BookOpen,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatDate, getStatusColor, getStatusLabel, getCaseTypeLabel } from '../../utils/helpers';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    baru: 0,
    proses: 0,
    selesai: 0
  });

  useEffect(() => {
    loadMyReports();
  }, []);

  const loadMyReports = async () => {
    try {
      setLoading(true);
      console.log('Loading my reports...');
      
      const response = await reportService.getMyReports();
      console.log('Dashboard - Reports response:', response);
      
      // Handle different response formats
      let reportsData = [];
      if (Array.isArray(response)) {
        reportsData = response;
      } else if (response && Array.isArray(response.data)) {
        reportsData = response.data;
      } else if (response && response.reports) {
        reportsData = response.reports;
      }
      
      console.log('Dashboard - Reports data:', reportsData);
      
      // Calculate stats - handle both camelCase and snake_case
      const baru = reportsData.filter(r => 
        (r.status || r.Status || '').toLowerCase() === 'baru'
      ).length;
      const proses = reportsData.filter(r => 
        (r.status || r.Status || '').toLowerCase() === 'diproses'
      ).length;
      const selesai = reportsData.filter(r => 
        (r.status || r.Status || '').toLowerCase() === 'selesai'
      ).length;
      
      setStats({
        total: reportsData.length,
        baru,
        proses,
        selesai
      });
      
      setReports(reportsData.slice(0, 5));
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get status
  const getReportStatus = (report) => {
    return (report.status || report.Status || '').toLowerCase();
  };

  // Helper to get case type
  const getReportCaseType = (report) => {
    return report.caseType || report.case_type || '';
  };

  // Helper to get created date
  const getReportDate = (report) => {
    return report.createdAt || report.created_at || report.createdAt;
  };

  const statCards = [
    {
      label: 'Total Laporan',
      value: stats.total,
      icon: FileText,
      color: 'bg-primary-100 text-primary-600',
      bg: 'bg-primary-50'
    },
    {
      label: 'Menunggu',
      value: stats.baru,
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Diproses',
      value: stats.proses,
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      label: 'Selesai',
      value: stats.selesai,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Selamat Datang, {user?.name}
            </h2>
            <p className="text-primary-100">
              Laporan Anda akan diproses secara rahasia oleh tim Satgas
            </p>
          </div>
          <Link to="/laporan/baru">
            <Button 
              variant="light" 
              size="lg"
              className="w-full md:w-auto"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Buat Laporan Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/laporan/baru">
          <Card hover className="h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <PlusCircle className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Buat Laporan</h3>
                <p className="text-sm text-slate-500 mb-3">
                  Laporkan kasus perundungan yang Anda alami atau saksikan
                </p>
                <span className="text-primary-600 text-sm font-medium flex items-center gap-1">
                  Buat sekarang <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/edukasi">
          <Card hover className="h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Modul Edukasi</h3>
                <p className="text-sm text-slate-500 mb-3">
                  Pelajari cara mencegah dan menghadapi perundungan
                </p>
                <span className="text-secondary-600 text-sm font-medium flex items-center gap-1">
                  Pelajari sekarang <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Riwayat Laporan Saya</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={loadMyReports}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link to="/laporan/saya">
              <Button variant="ghost" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Belum ada laporan</p>
              <Link to="/laporan/baru">
                <Button variant="outline" size="sm" className="mt-4">
                  Buat Laporan Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{getCaseTypeLabel(getReportCaseType(report))}</p>
                      <p className="text-sm text-slate-500">
                        {report.location}
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

      {/* Safety Tips */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Tips Keamanan Campus</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Jangan takut untuk melaporkan jika Anda menjadi korban perundungan</li>
              <li>• Semua laporan dijamin kerahasiaannya</li>
              <li>• Dukung teman yang mungkin mengalami perundungan</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;
