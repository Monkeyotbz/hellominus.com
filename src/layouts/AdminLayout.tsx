import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Building2, Map, Users, Settings, LogOut, LayoutDashboard, Menu, X, Calendar, MessageSquare } from 'lucide-react';

const AdminLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Propiedades', href: '/admin/properties', icon: Building2 },
    { name: 'Tours', href: '/admin/tours', icon: Map },
    { name: 'Reservaciones', href: '/admin/reservations', icon: Calendar },
    { name: 'Chat de Clientes', href: '/admin/chats', icon: MessageSquare },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2" onClick={closeSidebar}>
            <img src="/brand/logo.svg" alt="Logo" className="h-10 w-auto" />
            <span className="font-bold text-gray-800">Admin</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">Admin</p>
                <p className="text-gray-500 text-xs truncate max-w-[120px]">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-gray-800">Panel de Administración</h1>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Ver sitio</span>
          </Link>
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
