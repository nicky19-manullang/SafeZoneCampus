import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FileText, 
  CheckCircle, 
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/api';
import { CaseTypes, faculties } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// Predefined locations with coordinates - Institut Teknologi Del
const campusLocations = [
  { name: 'Asrama Rusun 1', lat: 2.3845, lng: 99.1485 },
  { name: 'Asrama Rusun 2', lat: 2.3843, lng: 99.1488 },
  { name: 'Asrama Rusun 3', lat: 2.3841, lng: 99.1491 },
  { name: 'Asrama Rusun 4', lat: 2.3839, lng: 99.1494 },
  { name: 'Perpustakaan', lat: 2.3840, lng: 99.1500 },
  { name: 'Enthsquare', lat: 2.3835, lng: 99.1492 },
  { name: 'Gedung 1', lat: 2.3838, lng: 99.1490 },
  { name: 'Gedung 5', lat: 2.3832, lng: 99.1485 },
  { name: 'Gedung 6', lat: 2.3830, lng: 99.1482 },
  { name: 'Gedung 7', lat: 2.3828, lng: 99.1480 },
  { name: 'Gedung 8', lat: 2.3826, lng: 99.1478 },
  { name: 'Gedung 9', lat: 2.3824, lng: 99.1476 },
  { name: 'Lab Komputer', lat: 2.3833, lng: 99.1488 },
  { name: 'AI Center', lat: 2.3836, lng: 99.1495 },
  { name: 'Open Theater', lat: 2.3842, lng: 99.1478 },
  { name: 'Plaza', lat: 2.3837, lng: 99.1493 },
  { name: 'Kantin Baru', lat: 2.3841, lng: 99.1482 },
  { name: 'Kantin Lama', lat: 2.3834, lng: 99.1490 }
];

const locationOptions = [
  { value: '', label: 'Pilih lokasi' },
  { value: 'Asrama Rusun 1', label: 'Asrama Rusun 1' },
  { value: 'Asrama Rusun 2', label: 'Asrama Rusun 2' },
  { value: 'Asrama Rusun 3', label: 'Asrama Rusun 3' },
  { value: 'Asrama Rusun 4', label: 'Asrama Rusun 4' },
  { value: 'Perpustakaan', label: 'Perpustakaan' },
  { value: 'Enthsquare', label: 'Enthsquare' },
  { value: 'Gedung 1', label: 'Gedung 1' },
  { value: 'Gedung 5', label: 'Gedung 5' },
  { value: 'Gedung 6', label: 'Gedung 6' },
  { value: 'Gedung 7', label: 'Gedung 7' },
  { value: 'Gedung 8', label: 'Gedung 8' },
  { value: 'Gedung 9', label: 'Gedung 9' },
  { value: 'Lab Komputer', label: 'Lab Komputer' },
  { value: 'AI Center', label: 'AI Center' },
  { value: 'Open Theater', label: 'Open Theater' },
  { value: 'Plaza', label: 'Plaza' },
  { value: 'Kantin Baru', label: 'Kantin Baru' },
  { value: 'Kantin Lama', label: 'Kantin Lama' }
];

const schema = yup.object({
  caseType: yup.string().required('Jenis kasus wajib dipilih'),
  faculty: yup.string().required('Fakultas wajib dipilih'),
  location: yup.string().required('Lokasi wajib diisi'),
  description: yup.string()
    .required('Deskripsi wajib diisi')
    .min(20, 'Deskripsi minimal 20 karakter'),
  anonymous: yup.boolean()
});

const CreateReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      caseType: '',
      faculty: user?.faculty || '',
      location: '',
      description: '',
      anonymous: true
    }
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError('');

      // Get coordinates for selected location
      const locationData = campusLocations.find(loc => loc.name === data.location);
      
      const reportData = {
        ...data,
        lat: locationData ? locationData.lat : null,
        lng: locationData ? locationData.lng : null,
        studentName: data.anonymous ? null : user?.name,
        anonymous: data.anonymous
      };

      await reportService.createReport(reportData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Gagal membuat laporan');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Laporan Berhasil Dibuat!
          </h2>
          <p className="text-slate-500 mb-6">
            Thank you for your report. Your report has been submitted successfully.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Laporan Anda Sedang Diproses</p>
                <p className="text-sm text-blue-700 mt-1">
                  Tim Satgas akan menindaklanjuti laporan Anda dalam 1x24 jam. Anda dapat melihat status laporan di menu "Laporan Saya".
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                navigate('/laporan/saya');
              }}
            >
              Lihat Laporan Saya
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSuccess(false);
                window.location.reload();
              }}
            >
              Buat Laporan Lain
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Laporan Anonim</p>
            <p className="text-sm text-blue-700 mt-1">
              Anda dapat memilih untuk melaporkan secara anonim. Identitas Anda akan dijaga kerahasiaannya.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Form Pelaporan Perundungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-danger">
                {error}
              </div>
            )}

            {/* Case Type */}
            <Select
              label="Jenis Perundungan"
              {...register('caseType')}
              options={CaseTypes}
              placeholder="Pilih jenis perundungan"
              error={errors.caseType?.message}
            />

            {/* Faculty */}
            <Select
              label="Fakultas"
              {...register('faculty')}
              options={faculties}
              placeholder="Pilih fakultas"
              error={errors.faculty?.message}
            />

            {/* Date */}
            <Input
              type="date"
              label="Tanggal Kejadian"
              {...register('incidentDate')}
              error={errors.incidentDate?.message}
            />

            {/* Location */}
            <Select
              label="Lokasi Kejadian"
              {...register('location')}
              options={locationOptions}
              error={errors.location?.message}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Deskripsi Kejadian
              </label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="Jelaskan secara detail kejadian yang Anda alami atau saksikan..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              />
              {errors.description && (
                <p className="mt-1.5 text-sm text-danger">{errors.description.message}</p>
              )}
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <input
                type="checkbox"
                {...register('anonymous')}
                id="anonymous"
                className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="anonymous" className="flex-1">
                <span className="font-medium text-slate-900">Laporan Anonim</span>
                <p className="text-sm text-slate-500">
                  Centang jika Anda ingin identitas Anda dirahasiakan
                </p>
              </label>
            </div>

            {/* Submit */}
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
                loading={submitting}
                className="flex-1"
              >
                <FileText className="w-5 h-5 mr-2" />
                Submit Laporan
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Guidelines */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Panduan Pelaporan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Berikan informasi yang akurat dan sejujur mungkin</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Sebutkan lokasi dan waktu kejadian dengan jelas</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Jika ada bukti (screenshot, foto), simpan sebagai referensi</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Tim Satgas akan menindaklanjuti dalam 1x24 jam</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateReport;
