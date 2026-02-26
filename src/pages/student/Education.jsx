import { useState } from 'react';
import { 
  BookOpen, 
  Shield, 
  Phone, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Play,
  Heart,
  Brain,
  MessageCircle,
  Scale,
  Eye,
  Mic,
  Smile,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const educationModules = [
  {
    id: 1,
    title: 'Mengenal Perundungan (Bullying)',
    description: 'Pelajari apa itu perundungan, bentuk-bentuknya, dan dampaknya terhadap korban.',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
    sections: [
      { title: 'Definisi Perundungan', content: 'Perundungan adalah perilaku agresif yang dilakukan secara berulang oleh seseorang dengan kekuasaan atau kekuatan yang lebih tinggi terhadap orang yang lebih lemah.' },
      { title: 'Jenis-jenis Perundungan', content: '1. Fisik: pukulan, tendangan, dorongan\n2. Verbal: ejekan, ancaman, penghinaan\n3. Siber: penyebaran rumor online, komentar jahat\n4. Sosial: mengucilkan, menyebarkan gossip' },
      { title: 'Tanda-tanda Korban', content: '• Sering情绪低落 atau sedih\n• Penurunan prestasi akademik\n• Sering sakit kepala atau perut\n• Tidak mau pergi ke sekolah\n• Mengisolasi diri dari teman' },
      { title: 'Dampak Perundungan', content: 'Dampak jangka pendek: kecemasan, depresi, penurunan percaya diri.\nDampak jangka panjang: trauma, gangguan mental, dampak pada hubungan sosial di masa depan.' }
    ]
  },
  {
    id: 2,
    title: 'Cara Mencegah Perundungan',
    description: 'Strategi dan langkah-langkah untuk mencegah terjadinya perundungan.',
    icon: Shield,
    color: 'bg-green-100 text-green-600',
    sections: [
      { title: 'Membangun Budaya Saling Menghargai', content: '• Tohuan teman seperti ingin diperlakukan\n• Menghormati perbedaan\n• Tidak membully orang lain dengan cara apapun\n• Menjadi朋友 yang baik' },
      { title: 'Mengenali Tanda-tanda Awal', content: '• Perhatikan teman yang tampak kesepian\n• Amati perubahan perilaku teman\n• Jangan diam jika melihat ada yang bullying\n• Laporkan ke pihak yang dapat dipercaya' },
      { title: 'Peran Bystander (Pengamat)', content: 'Sebagai pengamat, Anda punya kekuatan untuk:\n1. Tidak turut serta dalam bullying\n2. Mendukung korban dengan diam-diam\n3. Melaporkan kepada dewasa/pihak kampus\n4. Memisahkan pelaku dari korban jika aman' }
    ]
  },
  {
    id: 3,
    title: 'Apa yang Harus Dilakukan',
    description: 'Panduan langkah-langkah yang harus diambil jika Anda atau teman Anda mengalami perundungan.',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600',
    sections: [
      { title: 'Jika Anda Menjadi Korban', content: '1. Tetap tenang, jangan balas dendam\n2. Cari bantuan dari teman, keluarga, atau guru\n3. Dokumentasikan semua kejadian\n4. Laporkan ke pihak kampus (satgas anti-bullying)\n5. Jaga kesehatan mental dengan berbicara pada konselor' },
      { title: 'Jika Teman Anda Menjadi Korban', content: '1. Dengarkan dan berikan dukungan\n2. Jangan force teman untuk melawan pelaku\n3. Bantu teman untuk melaporkan\n4. Tetap jadi teman yang baik\n5. Jaga kerahasiaan identitas teman' },
      { title: 'Cara Melaporkan dengan Aman', content: '• Bisa匿名 (tanpa nama)\n• Datang langsung ke kantor satgas\n• Hubungi hotline darurat\n• Gunakan fitur laporan di aplikasi SafeZone Campus' },
      { title: 'Menjaga Kesehatan Mental', content: '• Berbicara dengan orang terpercaya\n• Melakukan aktivitas positif\n• Istirahat yang cukup\n• Jika perlu, konsultasi dengan konselor kampus' }
    ]
  },
  {
    id: 4,
    title: 'Dukungan Psikologis',
    description: 'Sumber daya dan layanan dukungan kesehatan mental yang tersedia di kampus.',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
    sections: [
      { title: 'Layanan Konseling Kampus', content: 'Institut Teknologi Del menyediakan layanan konseling gratis untuk mahasiswa. Jadwal: Senin-Jumat, 08.00-16.00 WIB. Lokasi: Gedung Administration.' },
      { title: 'Hotline Darurat', content: '• Satgas Anti-Perundungan IT Del: (0632) 123-456\n• Konseling: (0632) 765-4321\n• Police Sektor Laguboti: (0632) 111-2222' },
      { title: 'Teknik Relaksasi', content: '1. Pernapasan dalam: tarik napas 4 detik, tahan 4 detik, hembuskan 4 detik\n2. Meditasi 5-10 menit setiap hari\n3. Journaling: tulis perasaan Anda\n4. Olahraga teratur' },
      { title: 'Membangun Resiliensi', content: '• Fokus pada hal yang bisa Anda kontrol\n• Kembangkan jaringan dukungan sosial\n• Pertahankan aktivitas yang Anda sukai\n• Berikan waktu untuk recovery\n• Jangan ragu meminta bantuan profesional' }
    ]
  }
];

const tips = [
  {
    icon: Heart,
    title: 'Tetap Terhubung',
    description: 'Jaga komunikasi dengan teman dan keluarga. Jangan isolasi diri.',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: Brain,
    title: 'Kelola Stres',
    description: 'Latihan pernapasan dan meditasi membantu mengurangi kecemasan.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: MessageCircle,
    title: 'Berani Melapor',
    description: 'Jangan diam, laporkan jika ada bullying. Ada很多 orang siap membantu.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Scale,
    title: 'Ketahui Hak Anda',
    description: 'Setiap mahasiswa berhak belajar di lingkungan yang aman dan nyaman.',
    color: 'bg-purple-100 text-purple-600'
  }
];

const emergencyContacts = [
  { name: 'Satgas Anti-Perundungan IT Del', phone: '(0632) 123-4567', available: '24/7', type: 'primary' },
  { name: 'Konseling Kampus IT Del', phone: '(0632) 765-4321', available: 'Senin-Jumat', type: 'secondary' },
  { name: 'Polsek Laguboti', phone: '(0632) 111-2222', available: '24/7', type: 'police' },
  { name: 'Layanan Kesehatan Kampus', phone: '(0632) 333-4444', available: '24/7', type: 'medical' }
];

const Education = () => {
  const [activeModule, setActiveModule] = useState(null);
  const [activeSection, setActiveSection] = useState({});
  const navigate = useNavigate();

  const toggleModule = (moduleId) => {
    setActiveModule(activeModule === moduleId ? null : moduleId);
    setActiveSection({});
  };

  const toggleSection = (moduleId, sectionIdx) => {
    setActiveSection(prev => ({
      ...prev,
      [moduleId]: prev[moduleId] === sectionIdx ? null : sectionIdx
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-600 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Pusat Edukasi</h2>
            <p className="text-secondary-100">
              Pelajari cara mencegah dan menghadapi perundungan untuk menciptakan lingkungan kampus yang aman dan nyaman
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card 
          hover 
          className="bg-red-50 border-red-200 cursor-pointer"
          onClick={() => window.open('tel:06321234567')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Butuh Bantuan Segera?</h3>
              <p className="text-sm text-red-700">Hubungi hotline darurat kami</p>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </div>
        </Card>
        
        <Card 
          hover 
          className="bg-green-50 border-green-200 cursor-pointer"
          onClick={() => navigate('/laporan/baru')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Laporan Darurat</h3>
              <p className="text-sm text-green-700">Lapor segera jika ada bahaya</p>
            </div>
            <ChevronRight className="w-5 h-5 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Education Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Modul Pembelajaran</h3>
        {educationModules.map((module) => (
          <Card key={module.id} className="overflow-hidden">
            <div 
              className="flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleModule(module.id)}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${module.color}`}>
                <module.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">{module.title}</h3>
                <p className="text-sm text-slate-500">{module.description}</p>
              </div>
              {activeModule === module.id ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </div>
            
            {activeModule === module.id && (
              <div className="border-t border-slate-100">
                {module.sections.map((section, idx) => (
                  <div key={idx} className="border-b border-slate-50 last:border-b-0">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                      onClick={() => toggleSection(module.id, idx)}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium text-slate-700">{section.title}</span>
                      </div>
                      {activeSection[module.id] === idx ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {activeSection[module.id] === idx && (
                      <div className="px-4 pb-4 pt-0 animate-fadeIn">
                        <div className="ml-7 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600 whitespace-pre-line">{section.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="p-4 bg-blue-50">
                  <Button variant="primary" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Tonton Video Pembelajaran
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Kontak Darurat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contact.type === 'primary' ? 'bg-red-100' :
                    contact.type === 'police' ? 'bg-blue-100' :
                    contact.type === 'medical' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    <Phone className={`w-5 h-5 ${
                      contact.type === 'primary' ? 'text-red-600' :
                      contact.type === 'police' ? 'text-blue-600' :
                      contact.type === 'medical' ? 'text-green-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{contact.name}</p>
                    <p className="text-sm text-slate-500">{contact.phone}</p>
                  </div>
                </div>
                <Badge variant={contact.available === '24/7' ? 'success' : 'warning'}>
                  {contact.available}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
        <CardHeader>
          <CardTitle>Tips Penting untuk Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tips.map((tip, idx) => (
              <div key={idx} className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${tip.color}`}>
                  <tip.icon className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-slate-900 mb-1">{tip.title}</h4>
                <p className="text-xs text-slate-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sumber Daya Tambahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
              <Eye className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-medium text-slate-900">Video Edukasi</h4>
              <p className="text-sm text-slate-500 mt-1">Kumpulan video pembelajaran tentang anti-bullying</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
              <Mic className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-medium text-slate-900">Podcast</h4>
              <p className="text-sm text-slate-500 mt-1">Podcast diskusi tentang kesehatan mental</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
              <Smile className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-medium text-slate-900">Quiz Interaktif</h4>
              <p className="text-sm text-slate-500 mt-1">Uji pengetahuan Anda tentang anti-bullying</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">Anda Tidak Sendiri</h3>
        <p className="text-primary-100 mb-4 max-w-2xl mx-auto">
          Jika Anda mengalami atau menyaksikan perundungan, jangan ragu untuk mencari bantuan. 
          Tim kami siap membantu Anda 24/7.
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            variant="secondary"
            onClick={() => window.open('tel:06321234567')}
          >
            <Phone className="w-4 h-4 mr-2" />
            Hubungi Kami
          </Button>
          <Button 
            variant="outline"
            className="border-white text-white hover:bg-white/10"
            onClick={() => navigate('/laporan/baru')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Buat Laporan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Education;
