import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocaleProvider } from './lib/locale';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/AdminRoute';
import RequireAuth from './components/RequireAuth';
import AdminApp from './admin/AdminApp';

import SiteLayout from './site/SiteLayout';
import HomePage from './home/HomePage';
import HostsPage from './home/hosts/HostsPage';
import ToursPage from './site/pages/ToursPage';
import TourDetailPage from './site/pages/TourDetailPage';
import StaysPage from './site/pages/StaysPage';
import StayDetailPage from './site/pages/StayDetailPage';
import DestinosPage from './site/pages/DestinosPage';
import AboutPage from './site/pages/AboutPage';
import TenantPage from './site/pages/TenantPage';
import AccountLayout from './account/AccountLayout';
import AccountHome from './account/AccountHome';
import AccountTrips from './account/AccountTrips';
import TripDetail from './account/TripDetail';
import AccountProfile from './account/AccountProfile';
import PanelApp from './panel/PanelApp';

import LoginPageNew from './pages/LoginPageNew';
import SignupPageNew from './pages/SignupPageNew';
import ConfirmarCorreo from './pages/ConfirmarCorreo';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Portada nueva: lleva su propio encabezado y pie (src/home). */}
            <Route path="/" element={<HomePage />} />
            <Route path="/anfitriones" element={<HostsPage />} />

            <Route element={<SiteLayout />}>
              <Route path="/tours" element={<ToursPage />} />
              <Route path="/tours/:slug" element={<TourDetailPage />} />
              <Route path="/hospedajes" element={<StaysPage />} />
              <Route path="/hospedajes/:slug" element={<StayDetailPage />} />
              <Route path="/destinos" element={<DestinosPage />} />
              <Route path="/nosotros" element={<AboutPage />} />
              <Route path="/anfitrion/:slug" element={<TenantPage />} />
              {/* Cuenta del viajero: reservas y compras (las registra Zuhay) y sus datos. */}
              <Route element={<RequireAuth />}>
                <Route path="/cuenta" element={<AccountLayout />}>
                  <Route index element={<AccountHome />} />
                  <Route path="viajes" element={<AccountTrips />} />
                  <Route path="viajes/:id" element={<TripDetail />} />
                  <Route path="perfil" element={<AccountProfile />} />
                </Route>
              </Route>
            </Route>

            {/* Panel del propietario: su espacio, catálogo, blog y reservas. */}
            <Route element={<RequireAuth />}>
              <Route path="/panel/*" element={<PanelApp />} />
            </Route>

            <Route path="/login" element={<LoginPageNew />} />
            <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
            <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
            <Route path="/registro" element={<SignupPageNew />} />
            <Route path="/register" element={<SignupPageNew />} />
            <Route path="/perfil" element={<Navigate to="/cuenta" replace />} />
            <Route path="/confirmar-correo" element={<ConfirmarCorreo />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin/*" element={<AdminApp />} />
            </Route>

            <Route path="*" element={<HomePage />} />
          </Routes>
        </AuthProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
}

export default App;
