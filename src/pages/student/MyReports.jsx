import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, RefreshCw } from 'lucide-react';
import { reportService } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatDate, getStatusColor, getStatusLabel, getCaseTypeLabel } from '../../utils/helpers';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading reports...');
      
      const response = await reportService.getMyReports();
      console.log('Reports response:', response);
      
      // Handle different response formats
      let reportsData = [];
      if (Array.isArray(response)) {
        reportsData = response;
      } else if (response && Array.isArray(response.data)) {
        reportsData = response.data;
      } else if (response && response.reports) {
        reportsData = response.reports;
      }
      
      console.log('Reports data:', reportsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setError(error.message || 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to handle both camelCase and snake_case
  const getReportStatus = (report) => {
    return (report.status || report.Status || '').toLowerCase();
  };

  const getReportCaseType = (report) => {
    return report.caseType || report.case_type || report.caseType || '';
  };

  const getReportDate = (report) => {
    return report.createdAt || report.created_at || report.createdAt;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Laporan Saya</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadReports}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link to="/laporan/baru">
            <Button variant="primary">
              <PlusCircle className="w-5 h-5 mr-2" />
              Buat Laporan
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-20 bg-slate-100 rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Belum ada laporan</h3>
            <p className="text-slate-500 mb-6">Buat laporan pertama Anda untuk melaporkan kasus perundungan</p>
            <Link to="/laporan/baru">
              <Button variant="primary">Buat Laporan</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} hover>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{getCaseTypeLabel(getReportCaseType(report))}</p>
                      <p className="text-sm text-slate-500">
                        {report.location}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(getReportDate(report))}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(getReportStatus(report))}>
                    {getStatusLabel(getReportStatus(report))}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;
