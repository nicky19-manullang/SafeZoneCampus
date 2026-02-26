# TODO - SafeZone Campus

## Tasks Completed

### 1. Perbaikan Error "Cannot read properties of undefined (reading 'id')"
- **File**: `src/pages/student/CreateReport.jsx`
- **Change**: Mengubah `response.data.id` menjadi `response.id`
- **Reason**: API service sudah mengembalikan data JSON langsung, bukan wrapper `.data`

### 2. Hapus Tampilan ID Laporan di Sisi Mahasiswa
- **File**: `src/pages/student/CreateReport.jsx`
- **Change**: 
  - Menghapus tampilan ID laporan di halaman success setelah submit
  - Menghapus variabel `reportId` dan `setReportId`
  - Membersihkan import yang tidak digunakan (MapPin, Upload, AlertTriangle)
  - Menampilkan pesan informatif bahwa laporan sedang diproses

- **File**: `src/pages/student/MyReports.jsx`
- **Change**: 
  - Menghapus tampilan ID laporan di daftar laporan
  - Sekarang hanya menampilkan: Jenis perundungan, Lokasi, Tanggal, Status
  - ID laporan hanya ditampilkan di admin

## Remaining Tasks
- [ ] Testing by user
