import { clsx } from 'clsx';

// Classname utility
export const cn = (...classes) => clsx(classes);

// Format date to Indonesian format
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    baru: 'bg-blue-100 text-blue-800',
    diproses: 'bg-yellow-100 text-yellow-800',
    selesai: 'bg-green-100 text-green-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    baru: 'Baru',
    diproses: 'Diproses',
    selesai: 'Selesai'
  };
  return labels[status] || status;
};

// Get case type label
export const getCaseTypeLabel = (type) => {
  const labels = {
    fisik: 'Perundungan Fisik',
    verbal: 'Perundungan Verbal',
    siber: 'Perundungan Siber',
    sosial: 'Perundungan Sosial',
    lain: 'Lainnya'
  };
  return labels[type] || type;
};

// Get case type color
export const getCaseTypeColor = (type) => {
  const colors = {
    fisik: 'bg-red-500',
    verbal: 'bg-orange-500',
    siber: 'bg-purple-500',
    sosial: 'bg-pink-500',
    lain: 'bg-gray-500'
  };
  return colors[type] || 'bg-gray-500';
};

// Get faculty label
export const getFacultyLabel = (code) => {
  const labels = {
    fit: 'Fakultas Informatika dan Teknik Elektro',
    fti: 'Fakultas Teknologi Industri',
    fbio: 'Fakultas Bioteknologi',
    fv: 'Fakultas Vokasi'
  };
  return labels[code] || code;
};

// Format relative time
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  return formatDate(dateString);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
