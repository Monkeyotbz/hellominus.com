import { useState, useEffect } from 'react';
import React from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../supabaseClient';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, profile, signOut, isStaff } = useAuth();
  const { itemCount } = useCart();

  // Efecto para scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const CartBadge: React.FC = () => (
    <>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </>
  );

  const navbarClasses = `fixed w-full z-40 transition-all duration-300 top-[28px] bg-white shadow-md ${
    isScrolled ? 'py-2' : 'py-3.5'
  }`;

  const isActive = (path: string) => location.pathname === path;

  const linkClasses = (path: string) =>
    `text-lg font-bold transition-colors px-4 ${
      isActive(path)
        ? 'text-[#ff0000]'
        : 'text-gray-800 hover:text-[#ff0000]'
    }`;

  const firstName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : user?.email
    ? user.email.split('@')[0]
    : '';
  
  const isAdmin = isStaff;

  return (
    <>
      {/* Announcement ribbon */}
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-xs z-50">
        <div className="container mx-auto text-center py-1 px-4">
          <div className="flex items-center justify-center gap-2">
            <span aria-hidden className="text-sm">🌴</span>
            <span className="font-medium">Vive Colombia: Tours, Hospedajes y Aventuras Inolvidables</span>
            <span aria-hidden className="text-sm">🌴</span>
          </div>
        </div>
      </div>

      <nav className={navbarClasses}>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-none mr-4 sm:mr-8">
          <img
            src="/brand/logo.svg"
            alt="Logo de Hellominus"
            className="h-14 sm:h-16 md:h-20 w-auto max-w-[150px] sm:max-w-[180px] md:max-w-[200px] object-contain"
          />
        </Link>

        {/* Menú central - solo escritorio */}
        <div className="hidden lg:flex flex-1 justify-center items-center space-x-4">
          <Link to="/" className={linkClasses('/')}>Home</Link>
          <Link to="/properties" className={linkClasses('/properties')}>Hospedajes</Link>
          <Link to="/tours" className={linkClasses('/tours')}>Tours</Link>
          <Link to="/nosotros" className={linkClasses('/nosotros')}>Nosotros</Link>
          <Link to="/destinations" className={linkClasses('/destinations')}>Destinos</Link>
          <Link to="/blog" className={linkClasses('/blog')}>Blog</Link>
        </div>

        {/* Botones de sesión o usuario - escritorio y tableta */}
        {!user ? (
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-none">
            <Link
              to="/login"
              className="text-xs lg:text-sm font-semibold border-2 border-blue-600 text-blue-700 bg-white rounded-full px-3 lg:px-5 py-1.5 lg:py-2 transition-all duration-200 hover:bg-blue-50 hover:border-blue-700 whitespace-nowrap"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/registro"
              className="text-xs lg:text-sm font-semibold bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white rounded-full px-3 lg:px-5 py-1.5 lg:py-2 transition-all duration-200 shadow-md whitespace-nowrap"
            >
              Registrarse
            </Link>
            <Link to="/cart" className="hidden lg:block relative p-2 text-gray-700 hover:text-red-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-none">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs lg:text-sm font-semibold border-2 border-purple-600 text-purple-700 bg-white rounded-full px-3 lg:px-4 py-1.5 lg:py-2 transition-all hover:bg-purple-600 hover:text-white whitespace-nowrap"
              >
                👑 Panel Admin
              </Link>
            )}
            <Link to="/cart" className="relative p-1.5 lg:p-2 text-gray-700 hover:text-red-600 transition-colors">
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center text-[10px] lg:text-xs">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              to="/perfil"
              className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs lg:text-sm font-bold">
                  {firstName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="hidden lg:inline">Hola, {firstName}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs lg:text-sm font-semibold border-2 border-[#ff0000] text-[#ff0000] bg-white rounded-full px-3 lg:px-4 py-1.5 lg:py-2 transition-all hover:bg-[#ff0000] hover:text-white whitespace-nowrap"
            >
              Cerrar sesión
            </button>
          </div>
        )}

        {/* Botón hamburguesa - solo móvil */}
        <div className="flex items-center gap-2 md:hidden ml-auto">
          <Link
            to="/cart"
            onClick={() => setIsOpen(false)}
            className="relative p-2 rounded-full text-gray-800 hover:text-red-600 hover:bg-gray-100 transition"
            aria-label="Ver carrito"
          >
            <ShoppingCart className="w-6 h-6" />
            <CartBadge />
          </Link>
          <button
            className="flex md:hidden text-gray-800 text-3xl"
            onClick={toggleMenu}
            aria-label="Abrir menú"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={toggleMenu}>
          <div
            className="absolute top-0 right-0 w-80 max-w-[90%] h-full bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del menú */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/brand/logo.svg"
                  alt="Logo"
                  className="h-10 w-auto"
                />
              </div>
              <button
                onClick={toggleMenu}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navegación */}
            <div className="flex-1 flex flex-col py-6 px-4 space-y-1 overflow-y-auto">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-medium"
                onClick={toggleMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              
              <Link
                to="/properties"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-medium"
                onClick={toggleMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Hospedajes
              </Link>

              <Link
                to="/tours"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-medium"
                onClick={toggleMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tours
              </Link>

              <Link
                to="/destinations"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-medium"
                onClick={toggleMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Destinos
              </Link>

              <Link
                to="/cart"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-medium"
                onClick={toggleMenu}
              >
                <ShoppingCart className="w-5 h-5" />
                Carrito
                {itemCount > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] px-2 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              <Link
                to="/blog"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-medium"
                onClick={toggleMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blog
              </Link>

              <Link
                to="/nosotros"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-medium"
                onClick={toggleMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Nosotros
              </Link>
            </div>

            {/* Footer del menú con contacto */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-gray-50 p-4 space-y-2">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full bg-white border-2 border-blue-600 text-blue-700 py-3 rounded-lg font-semibold transition-colors hover:bg-blue-50"
                    onClick={toggleMenu}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-yellow-500 to-red-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:from-yellow-600 hover:to-red-700"
                    onClick={toggleMenu}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold transition-colors hover:from-purple-700 hover:to-purple-800 mb-2"
                      onClick={toggleMenu}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      👑 Panel Admin
                    </Link>
                  )}
                  <Link
                    to="/perfil"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-red-600 text-white py-3 rounded-lg font-semibold transition-colors hover:from-blue-600 hover:to-red-700"
                    onClick={toggleMenu}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-white border-2 border-[#ff0000] text-[#ff0000] py-3 rounded-lg font-semibold transition-colors hover:bg-[#ff0000] hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </>
              )}
              <a
                href="https://wa.me/?text=Hola,%20me%20gustaría%20obtener%20más%20información"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-md mt-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      )}
      </nav>
    </>
  );
};

export default Navbar;