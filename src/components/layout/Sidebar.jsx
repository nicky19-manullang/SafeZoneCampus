import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  BookOpen, 
  Users, 
  BarChart3, 
  MapPin, 
  Shield,
  ChevronLeft,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { UserRoles } from '../../types';
import logo from "../../assets/logo.png"; 

const Sidebar = ({ isOpen, onClose, isAdmin }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/laporan/baru', icon: PlusCircle, label: 'Buat Laporan' },
    { to: '/laporan/saya', icon: FileText, label: 'Laporan Saya' },
    { to: '/edukasi', icon: BookOpen, label: 'Edukasi' },
    { to: '/profil', icon: User, label: 'Edit Profil' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/laporan', icon: FileText, label: 'Semua Laporan' },
    { to: '/admin/mahasiswa', icon: Users, label: 'Kelola Mahasiswa' },
    { to: '/admin/statistik', icon: BarChart3, label: 'Statistik' },
    { to: '/admin/peta', icon: MapPin, label: 'Peta Lokasi' },
    { to: '/admin/safety-index', icon: Shield, label: 'Safety Index' },
    { to: '/admin/profil', icon: User, label: 'Edit Profil' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain drop-shadow-md"/>
            </div>
            <div>
              <h1 className="font-bold text-slate-900">SafeZone</h1>
              <p className="text-xs text-slate-500">Campus</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">
                {isAdmin ? 'Admin Satgas' : `NIM: ${user?.nim}`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                'hover:bg-slate-50',
                isActive 
                  ? 'bg-primary-50 text-primary-600 font-medium' 
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-danger hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
