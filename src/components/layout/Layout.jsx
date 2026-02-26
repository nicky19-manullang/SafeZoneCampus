import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ isAdmin: layoutAdmin }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin: authAdmin } = useAuth();
  // Use prop if provided, otherwise use auth context
  const isAdmin = layoutAdmin !== undefined ? layoutAdmin : authAdmin;
  const location = useLocation();

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Mahasiswa';
    if (path === '/laporan/baru') return 'Buat Laporan';
    if (path === '/laporan/saya') return 'Laporan Saya';
    if (path === '/edukasi') return 'Modul Edukasi';
    if (path === '/profil') return 'Edit Profil';
    if (path.includes('/admin/dashboard')) return 'Dashboard Admin';
    if (path.includes('/admin/laporan')) return 'Kelola Laporan';
    if (path.includes('/admin/statistik')) return 'Statistik';
    if (path.includes('/admin/peta')) return 'Peta Lokasi';
    if (path.includes('/admin/safety-index')) return 'Campus Safety Index';
    if (path.includes('/admin/mahasiswa')) return 'Kelola Mahasiswa';
    if (path === '/admin/profil') return 'Edit Profil Admin';
    return 'SafeZone Campus';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isAdmin={isAdmin}
      />
      
      <div className="lg:pl-64">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle()}
        />
        
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
