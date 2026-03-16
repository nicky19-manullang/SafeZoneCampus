import axios from 'axios';

// API URL (gunakan env dari Vercel; default ke relative /api agar bekerja di Vercel dan saat dev dengan proxy)
const API_URL = import.meta.env.VITE_API_URL || "/api";

console.log("SAFEZONE API URL:", API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("safezone_token");
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
      localStorage.removeItem("safezone_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ================= AUTH API =================

export const authService = {
  login: async (nim, password) => {
    const response = await api.post("/auth/login", { nim, password });

    if (response.data.accessToken) {
      localStorage.setItem("safezone_token", response.data.accessToken);
    }

    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  }
};

// ================= REPORT API =================

export const reportService = {
  getAllReports: async (filters = {}) => {
    const response = await api.get("/reports", { params: filters });
    return response.data;
  },

  getMyReports: async () => {
    const response = await api.get("/reports/my-reports");

    if (Array.isArray(response.data)) {
      return { data: response.data };
    }

    return response.data;
  },

  createReport: async (reportData) => {
    const response = await api.post("/reports", reportData);
    return response.data;
  },

  updateReportStatus: async (reportId, status) => {
    const response = await api.put(`/reports/${reportId}/status`, { status });
    return response.data;
  },

  getReportById: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  }
};

// ================= NOTIFICATION API =================

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all");
    return response.data;
  }
};

// ================= ADMIN API =================

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  getMonthlyReports: async () => {
    const response = await api.get("/admin/stats/monthly");
    return response.data;
  },

  getReportsByType: async () => {
    const response = await api.get("/admin/stats/by-type");
    return response.data;
  },

  getSafetyIndex: async () => {
    const response = await api.get("/admin/stats/safety-index");
    return response.data;
  },

  getLocationData: async () => {
    const response = await api.get("/admin/locations");
    return response.data;
  },

  getPendingStudents: async () => {
    const response = await api.get("/admin/pending-students");
    return response.data;
  },

  getAllStudents: async (status) => {
    const response = await api.get("/admin/students", { params: { status } });
    return response.data;
  },

  approveStudent: async (studentId) => {
    const response = await api.post(`/admin/approve-student/${studentId}`);
    return response.data;
  },

  rejectStudent: async (studentId) => {
    const response = await api.post(`/admin/reject-student/${studentId}`);
    return response.data;
  }
};

export default api;