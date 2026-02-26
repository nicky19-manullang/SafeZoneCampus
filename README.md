# SafeZone Campus

Sistem pelaporan perundungan (bullying) internal kampus untuk mahasiswa dan tim Satgas Institut Teknologi Del.

## Daftar Isi

- [Deskripsi](#deskripsi)
- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi](#instalasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Akun Default](#akun-default)
- [API Endpoints](#api-endpoints)
- [Lisensi](#lisensi)

## Deskripsi

SafeZone Campus adalah aplikasi web yang memungkinkan mahasiswa untuk melaporkan kasus perundungan secara anonim. Aplikasi ini membantu tim Satgas kampus dalam memantau dan menindaklanjuti laporan dengan lebih efektif.

## Fitur

### Fitur Mahasiswa
- **Login** - Masuk dengan NIM dan password
- **Dashboard** - Ringkasan laporan dan status
- **Buat Laporan** - Form pelaporan anonim
  - Jenis perundungan (fisik, verbal, siber, sosial, lain)
  - Pilih fakultas
  - Lokasi kejadian
  - Deskripsi detail
  - Opsi laporan anonim
- **Riwayat Laporan** - Lacak status laporan
- **Modul Edukasi** - Informasi pencegahan perundungan

### Fitur Admin (Satgas)
- **Dashboard** - Statistik keseluruhan
- **Kelola Laporan** - Lihat, filter, dan update status
- **Filter**: Tanggal, jenis kasus, fakultas
- **Update Status**: Baru → Diproses → Selesai
- **Analytics**:
  - Grafik laporan bulanan
  - Pie chart jenis kasus
  - Peta lokasiheatmap
  - Indeks keamanan kampus

## Teknologi

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Yup
- **Authentication**: JWT (JSON Web Token)
- **Charts**: Chart.js + react-chartjs-2
- **Maps**: Leaflet + react-leaflet
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express
- **Database**: MySQL
- **Auth**: JWT + bcrypt

## Struktur Proyek

```
SafeZoneCampus/
├── src/                      # Frontend React
│   ├── components/           # Komponen UI
│   │   ├── common/         # Button, Input, Modal, dll
│   │   ├── layout/         # Layout (Sidebar, Header)
│   │   └── Protected/      # Route guards
│   ├── contexts/           # React Context
│   ├── pages/              # Halaman
│   │   ├── auth/          # Login, Register
│   │   ├── student/       # Halaman mahasiswa
│   │   └── admin/         # Halaman admin
│   ├── services/           # API services
│   ├── utils/              # Helpers
│   └── types/              # Type definitions
│
├── backend/                  # Backend Express
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   └── db.js              # Database connection
│
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Instalasi

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)
- npm atau yarn

### Langkah Instalasi

1. **Clone repository**
```
bash
cd SafeZoneCampus
```

2. **Install dependencies frontend**
```
bash
npm install
```

3. **Install dependencies backend**
```
bash
cd backend
npm install
```

4. **Setup database**
```
bash
# Buat database MySQL
mysql -u root -p
CREATE DATABASE safezone_campus;

# Import schema (jika ada)
# mysql -u root -p safezone_campus < database.sql
```

5. **Setup environment variables**

Buat file `.env` di folder `backend`:
```
env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=safezone_campus
JWT_SECRET=safezone_secret_key_2024
JWT_EXPIRES_IN=24h
PORT=3001
```

## Menjalankan Aplikasi

### Mode Development

1. **Jalankan backend** (terminal 1)
```
bash
cd backend
npm run dev
# atau
node server.js
```

2. **Jalankan frontend** (terminal 2)
```
bash
npm run dev
```

3. Buka browser
```
http://localhost:5173
```

### Mode Production

1. **Build frontend**
```
bash
npm run build
```

2. **Jalankan di backend**
```
bash
cd backend
npm start
```

## Akun Default

### Admin
- **NIM**: admin001
- **Password**: admin123

### Akun Mahasiswa
Belum ada akun mahasiswa default. Mahasiswa perlu melakukan registrasi terlebih dahulu, kemudian admin harus menyetujui akun tersebut.

## API Endpoints

### Authentication
```
POST /api/auth/login          # Login
POST /api/auth/register       # Registrasi mahasiswa
GET  /api/auth/me            # Get current user
PUT  /api/auth/profile       # Update profile
POST /api/auth/change-password
```

### Reports
```
GET  /api/reports             # Get all reports (admin)
GET  /api/reports/my-reports  # Get student's own reports
POST /api/reports             # Create new report
GET  /api/reports/:id         # Get report by ID
PUT  /api/reports/:id/status  # Update report status (admin)
```

### Notifications
```
GET  /api/notifications              # Get all notifications
GET  /api/notifications/unread-count # Get unread count
PUT  /api/notifications/:id/read      # Mark as read
PUT  /api/notifications/read-all      # Mark all as read
```

### Admin
```
GET /api/admin/stats           # Dashboard statistics
GET /api/admin/stats/monthly    # Monthly reports
GET /api/admin/stats/by-type   # Reports by case type
GET /api/admin/stats/safety-index # Campus safety index
GET /api/admin/students        # Get all students
GET /api/admin/pending-students # Get pending students
POST /api/admin/approve-student/:id  # Approve student
POST /api/admin/reject-student/:id   # Reject student
```

## Struktur Data

### Laporan (Reports)
- id: string (RPT-0001)
- student_id: int
- case_type: enum (fisik, verbal, siber, sosial, lain)
- incident_date: date
- location: string
- description: text
- evidence: string
- status: enum (baru, diproses, selesai)
- faculty: string
- anonymous: boolean
- student_name: string (nullable)

### Pengguna (Users)
- id: int (auto-increment)
- nim: string (unique)
- password: string (hashed)
- name: string
- role: enum (student, admin)
- faculty: string
- status: enum (pending, approved, rejected)

## Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/FiturBaru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/FiturBaru`)
5. Buat Pull Request

## Lisensi

