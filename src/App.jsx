import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import CreateReport from './pages/student/CreateReport';
import MyReports from './pages/student/MyReports';
import Education from './pages/student/Education';
import EditProfile from './pages/student/EditProfile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Reports from './pages/admin/Reports';
import Statistics from './pages/admin/Statistics';
import MapView from './pages/admin/MapView';
import SafetyIndex from './pages/admin/SafetyIndex';
import Students from './pages/admin/Students';
import AdminEditProfile from './pages/admin/EditProfile';

// Simple loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-slate-600">Memuat...</p>
    </div>
  </div>
);

// Protected wrapper with role check
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes - with nested Layout */}
          <Route element={
            <ProtectedRoute requiredRole="student">
              <Layout isAdmin={false} />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/laporan/baru" element={<CreateReport />} />
            <Route path="/laporan/saya" element={<MyReports />} />
            <Route path="/edukasi" element={<Education />} />
            <Route path="/profil" element={<EditProfile />} />
          </Route>
          
          {/* Admin Routes - with nested Layout */}
          <Route element={
            <ProtectedRoute requiredRole="admin">
              <Layout isAdmin={true} />
            </ProtectedRoute>
          }>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/laporan" element={<Reports />} />
            <Route path="/admin/statistik" element={<Statistics />} />
            <Route path="/admin/peta" element={<MapView />} />
            <Route path="/admin/safety-index" element={<SafetyIndex />} />
            <Route path="/admin/mahasiswa" element={<Students />} />
            <Route path="/admin/profil" element={<AdminEditProfile />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
