import { useState, useEffect } from 'react';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building,
  BookOpen,
  Car
} from 'lucide-react';
import { adminService } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const SafetyIndex = () => {
  const [safetyData, setSafetyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSafetyIndex();
      setSafetyData(response.data);
    } catch (error) {
      console.error('Failed to load safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIndicators = () => {
    const ind = safetyData?.indicators || {};
    const resolvedRate = ind.resolutionRate || safetyData?.resolvedRate || 0;
    const pendingRate = 100 - resolvedRate;
    
    return [
      {
        name: 'Resolution Rate',
        score: resolvedRate,
        icon: CheckCircle,
        color: resolvedRate >= 70 ? 'bg-green-100 text-green-600' : resolvedRate >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600',
        description: 'Tingkat penyelesaian kasus dari total laporan'
      },
      {
        name: 'Pending Cases',
        score: pendingRate,
        icon: Clock,
        color: pendingRate <= 30 ? 'bg-green-100 text-green-600' : pendingRate <= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600',
        description: 'Laporan yang belum selesai diproses - semakin rendah semakin baik'
      }
    ];
  };

  const getScoreColor = (score, isPending = false) => {
    // For pending cases, lower is better (inverted logic)
    if (isPending) {
      if (score <= 30) return 'text-green-600';
      if (score <= 50) return 'text-yellow-600';
      return 'text-red-600';
    }
    // For resolution rate, higher is better
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score, isPending = false) => {
    // For pending cases, lower is better
    if (isPending) {
      if (score <= 30) return { label: 'Terbaik', color: 'success' };
      if (score <= 50) return { label: 'Waspada', color: 'warning' };
      return { label: 'Mendesak', color: 'danger' };
    }
    // For resolution rate, higher is better
    if (score >= 80) return { label: 'Sangat Baik', color: 'success' };
    if (score >= 60) return { label: 'Cukup', color: 'warning' };
    return { label: 'Perlu Perbaikan', color: 'danger' };
  };

  const getProgressColor = (score, isPending = false) => {
    // For pending cases, lower is better (inverted)
    if (isPending) {
      if (score <= 30) return 'bg-green-500';
      if (score <= 50) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    // For resolution rate, higher is better
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Main Score Card */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-primary-100 mb-2">Campus Safety Index</p>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-bold">
                {safetyData?.score || 0}
              </span>
              <span className="text-2xl text-primary-100">/ 100</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {safetyData?.trend === 'up' ? (
                <>
                  <TrendingUp className="w-5 h-5 text-green-300" />
                  <span className="text-green-300">{safetyData?.change} dari bulan lalu</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5 text-red-300" />
                  <span className="text-red-300">{safetyData?.change} dari bulan lalu</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(safetyData?.score || 0) * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700">Status Keseluruhan</p>
              <p className="text-xl font-bold text-green-800">Aman</p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Total Laporan</p>
              <p className="text-xl font-bold text-blue-800">{safetyData?.totalReports || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-700">Tingkat Penyelesaian</p>
              <p className="text-xl font-bold text-yellow-800">{safetyData?.resolvedRate || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Indikator Keamanan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {getIndicators().map((indicator, index) => {
                const isPending = index === 1;
                return (
                <div key={index} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${indicator.color}`}>
                        <indicator.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{indicator.name}</p>
                        <p className="text-xs text-slate-500">{indicator.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(indicator.score, isPending)}`}>
                        {indicator.score}
                      </p>
                      <Badge variant={getScoreLabel(indicator.score, isPending).color} size="sm">
                        {getScoreLabel(indicator.score, isPending).label}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(indicator.score, isPending)}`}
                      style={{ width: `${indicator.score}%` }}
                    />
                  </div>
                </div>
              )})}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Rekomendasi Peningkatan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safetyData?.resolvedRate < 50 ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Percepat Penanganan Laporan</p>
                  <p className="text-sm text-red-700 mt-1">
                    Tingkat penyelesaian laporan saat ini {safetyData?.resolvedRate}%. Target adalah minimal 70%.
                  </p>
                </div>
              </div>
            ) : safetyData?.resolvedRate < 70 ? (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Tingkatkan Penyelesaian Laporan</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Tingkat penyelesaian {safetyData?.resolvedRate}%. Target 70%. Terus berusaha!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Kerja Bagus!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Tingkat penyelesaian laporan telah mencapai {safetyData?.resolvedRate}%. Terima kasih atas kerja keras Tim Satgas!
                  </p>
                </div>
              </div>
            )}
            
            {safetyData?.totalReports > 0 && safetyData?.pendingRate > 30 && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">{safetyData?.pendingRate}% Laporan Belum Selesai</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Ada {safetyData?.totalReports - Math.round(safetyData?.totalReports * safetyData?.resolvedRate / 100)} 
                    laporan yang masih dalam proses. Segera tangani untuk melayani mahasiswa更好。
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyIndex;
