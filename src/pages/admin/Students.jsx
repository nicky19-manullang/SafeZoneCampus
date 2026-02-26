import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Check, X, Users, Clock, AlertCircle } from 'lucide-react';

const Students = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [activeTab]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const response = await adminService.getPendingStudents();
        setPendingStudents(response.data || []);
      } else {
        const response = await adminService.getAllStudents(activeTab === 'all' ? undefined : activeTab);
        setAllStudents(response.data || []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (studentId) => {
    setActionLoading(studentId);
    try {
      await adminService.approveStudent(studentId);
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      alert('Mahasiswa berhasil disetujui');
    } catch (error) {
      alert('Gagal menyetujui mahasiswa');
    }
    setActionLoading(null);
  };

  const handleReject = async (studentId) => {
    setActionLoading(studentId);
    try {
      await adminService.rejectStudent(studentId);
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      alert('Mahasiswa berhasil ditolak');
    } catch (error) {
      alert('Gagal menolak mahasiswa');
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Menunggu' },
      approved: { color: 'success', label: 'Disetujui' },
      rejected: { color: 'danger', label: 'Ditolak' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.color}>{config.label}</Badge>;
  };

  const getFacultyLabel = (facultyCode) => {
    const faculties = {
      'fit': 'Fakultas Informatika dan Teknik Elektro',
      'fti': 'Fakultas Teknologi Industri',
      'fbio': 'Fakultas Bioteknologi',
      'fv': 'Fakultas Vokasi'
    };
    return faculties[facultyCode] || facultyCode;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Mahasiswa</h1>
          <p className="text-slate-500">Kelola akun mahasiswa dan verifikasi</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Menunggu Persetujuan
            {pendingStudents.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingStudents.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'approved'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Disetujui
          </div>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Semua Mahasiswa
          </div>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto"></div>
          <p className="text-slate-500 mt-2">Memuat...</p>
        </div>
      ) : activeTab === 'pending' ? (
        <div className="space-y-4">
          {pendingStudents.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Tidak ada mahasiswa yang menunggu
              </h3>
              <p className="text-slate-500">
                Semua mahasiswa telah diverifikasi
              </p>
            </Card>
          ) : (
            pendingStudents.map((student) => (
              <Card key={student.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {student.name}
                      </h3>
                      {getStatusBadge(student.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="text-slate-500">NIM:</span>{' '}
                        <span className="font-medium">{student.nim}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Fakultas:</span>{' '}
                        <span className="font-medium">{getFacultyLabel(student.faculty)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Daftar:</span>{' '}
                        <span className="font-medium">
                          {new Date(student.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(student.id)}
                      loading={actionLoading === student.id}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Setuju
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(student.id)}
                      loading={actionLoading === student.id}
                      className="flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Tolak
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {allStudents.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Tidak ada mahasiswa
              </h3>
            </Card>
          ) : (
            allStudents.map((student) => (
              <Card key={student.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {student.name}
                      </h3>
                      {getStatusBadge(student.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="text-slate-500">NIM:</span>{' '}
                        <span className="font-medium">{student.nim}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Fakultas:</span>{' '}
                        <span className="font-medium">{getFacultyLabel(student.faculty)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Daftar:</span>{' '}
                        <span className="font-medium">
                          {new Date(student.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Students;
