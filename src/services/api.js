import axios from 'axios';

// Create axios instance - connect to backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safezone_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('safezone_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authService = {
  login: async (nim, password) => {
    const response = await api.post('/auth/login', { nim, password });
    if (response.data.accessToken) {
      localStorage.setItem('safezone_token', response.data.accessToken);
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};

// Report API functions
export const reportService = {
  // Get all reports (admin)
  getAllReports: async (filters = {}) => {
    const response = await api.get('/reports', { params: filters });
    return response.data;
  },

  // Get student's own reports
  getMyReports: async () => {
    const response = await api.get('/reports/my-reports');
    // Handle both array response and {data: [...]} response
    if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    return response.data;
  },

  // Create new report
  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  // Update report status (admin)
  updateReportStatus: async (reportId, status) => {
    const response = await api.put(`/reports/${reportId}/status`, { status });
    return response.data;
  },

  // Get report by ID
  getReportById: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  }
};

// Notification API functions
export const notificationService = {
  // Get all notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

// Admin API functions
export const adminService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get monthly reports
  getMonthlyReports: async () => {
    const response = await api.get('/admin/stats/monthly');
    return response.data;
  },

  // Get reports by case type
  getReportsByType: async () => {
    const response = await api.get('/admin/stats/by-type');
    return response.data;
  },

  // Get campus safety index
  getSafetyIndex: async () => {
    const response = await api.get('/admin/stats/safety-index');
    return response.data;
  },

  // Get location heatmap data from reports
  getLocationData: async () => {
    const response = await api.get('/admin/locations');
    return response.data;
  },

  // Get pending students
  getPendingStudents: async () => {
    const response = await api.get('/admin/pending-students');
    return response.data;
  },

  // Get all students
  getAllStudents: async (status) => {
    const response = await api.get('/admin/students', { params: { status } });
    return response.data;
  },

  // Approve student
  approveStudent: async (studentId) => {
    const response = await api.post(`/admin/approve-student/${studentId}`);
    return response.data;
  },

  // Reject student
  rejectStudent: async (studentId) => {
    const response = await api.post(`/admin/reject-student/${studentId}`);
    return response.data;
  }
};

export default api;
