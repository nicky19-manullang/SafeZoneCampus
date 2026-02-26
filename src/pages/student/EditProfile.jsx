import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';

const schema = yup.object({
  name: yup.string().required('Nama wajib diisi'),
  faculty: yup.string()
});

const facultyOptions = [
  { value: '', label: 'Pilih Fakultas' },
  { value: 'fit', label: 'Fakultas Informatika dan Teknik Elektro' },
  { value: 'fti', label: 'Fakultas Teknologi Industri' },
  { value: 'fbio', label: 'Fakultas Bioteknologi' },
  { value: 'fv', label: 'Fakultas Vokasi' }
];

const EditProfile = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        faculty: user.faculty || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await authService.updateProfile(data);
      
      setSuccess(response.message);
      setUser(response.user);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Edit Profil</h1>
        <p className="text-slate-500">Perbarui informasi profil Anda</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Profile Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* NIM (Read Only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              NIM
            </label>
            <input
              type="text"
              value={user?.nim || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-500">NIM tidak dapat diubah</p>
          </div>

          {/* Name */}
          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Faculty */}
          <Select
            label="Fakultas"
            options={facultyOptions}
            error={errors.faculty?.message}
            {...register('faculty')}
          />

          {/* Role (Read Only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Peran
            </label>
            <input
              type="text"
              value={user?.role === 'student' ? 'Mahasiswa' : 'Admin'}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile;
