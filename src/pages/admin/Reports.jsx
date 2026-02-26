import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { reportService } from '../../services/api';
import { ReportStatus, CaseTypes, faculties } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import { formatDate, formatDateTime, getStatusColor, getStatusLabel, getCaseTypeLabel, getFacultyLabel } from '../../utils/helpers';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    caseType: '',
    faculty: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports(filters);
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      setUpdating(true);
      await reportService.updateReportStatus(reportId, newStatus);
      loadReports();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Map snake_case from MySQL to camelCase for consistent rendering
  const normalizedReports = reports.map(report => ({
    ...report,
    caseType: report.case_type,
    studentId: report.student_id,
    studentName: report.student_name,
    studentNim: report.student_nim,
    createdAt: report.created_at,
    updatedAt: report.updated_at
  }));

  const filteredReports = normalizedReports.filter(report => {
    return !searchTerm || 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCaseTypeLabel(report.caseType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case ReportStatus.BARU:
        return <Clock className="w-4 h-4" />;
      case ReportStatus.PROSES:
        return <AlertCircle className="w-4 h-4" />;
      case ReportStatus.SELESAI:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="baru">Baru</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
            </select>
            
            <select
              value={filters.caseType}
              onChange={(e) => setFilters({...filters, caseType: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Jenis</option>
              {CaseTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={filters.faculty}
              onChange={(e) => setFilters({...filters, faculty: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Fakultas</option>
              {faculties.map(fac => (
                <option key={fac.value} value={fac.value}>{fac.label}</option>
              ))}
            </select>
            
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Dari tanggal"
            />
            
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Sampai tanggal"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari laporan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button variant="outline">
          <Download className="w-5 h-5 mr-2" />
          Export
        </Button>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Semua Laporan ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse h-20 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Tidak ada laporan ditemukan
              </h3>
              <p className="text-slate-500">
                Coba ubah filter pencarian Anda
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Jenis</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Lokasi</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Fakultas</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Tanggal</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          {report.anonymous && (
                            <Badge variant="secondary" size="sm" className="ml-2">Anonim</Badge>
                          )}
                        </div>
                        {report.studentName && (
                          <p className="text-xs text-slate-500">{report.studentName}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{getCaseTypeLabel(report.caseType)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{report.location}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{getFacultyLabel(report.faculty)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{getStatusLabel(report.status)}</span>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-slate-500">{formatDate(report.createdAt)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detail Laporan"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Report Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <Badge className={getStatusColor(selectedReport.status)}>
                  {getStatusLabel(selectedReport.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500">Jenis Perundungan</p>
                <p className="font-medium">{getCaseTypeLabel(selectedReport.caseType)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Fakultas</p>
                <p className="font-medium">{getFacultyLabel(selectedReport.faculty)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Lokasi</p>
                <p className="font-medium">{selectedReport.location}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tanggal</p>
                <p className="font-medium">{formatDateTime(selectedReport.createdAt)}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-slate-500 mb-2">Deskripsi</p>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm">{selectedReport.description}</p>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <p className="text-sm text-slate-500 mb-3">Update Status</p>
              <div className="flex gap-2">
                <Button
                  variant={selectedReport.status === ReportStatus.BARU ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedReport.id, ReportStatus.BARU)}
                  disabled={updating}
                >
                  Baru
                </Button>
                <Button
                  variant={selectedReport.status === ReportStatus.PROSES ? 'warning' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedReport.id, ReportStatus.PROSES)}
                  disabled={updating}
                >
                  Diproses
                </Button>
                <Button
                  variant={selectedReport.status === ReportStatus.SELESAI ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedReport.id, ReportStatus.SELESAI)}
                  disabled={updating}
                >
                  Selesai
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
