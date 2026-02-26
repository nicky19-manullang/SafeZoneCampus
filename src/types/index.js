// User types
export const UserRoles = {
  STUDENT: 'student',
  ADMIN: 'admin'
};

export const ReportStatus = {
  BARU: 'baru',
  PROSES: 'diproses',
  SELESAI: 'selesai'
};

export const CaseTypes = [
  { value: 'fisik', label: 'Perundungan Fisik' },
  { value: 'verbal', label: 'Perundungan Verbal' },
  { value: 'siber', label: 'Perundungan Siber' },
  { value: 'sosial', label: 'Perundungan Sosial' },
  { value: 'lain', label: 'Lainnya' }
];

export const faculties = [
  { value: 'fit', label: 'Fakultas Informatika dan Teknik Elektro' },
  { value: 'fti', label: 'Fakultas Teknologi Industri' },
  { value: 'fbio', label: 'Fakultas Bioteknologi' },
  { value: 'fv', label: 'Fakultas Vokasi' }
];

// API Response types
export const AuthResponse = {
  accessToken: '',
  user: {
    id: '',
    nim: '',
    name: '',
    role: UserRoles.STUDENT,
    faculty: ''
  }
};

export const Report = {
  id: '',
  studentId: null, // anonymous reports have null
  caseType: '',
  location: '',
  description: '',
  evidence: null,
  status: ReportStatus.BARU,
  createdAt: '',
  updatedAt: '',
  faculty: '',
  anonymous: true
};
