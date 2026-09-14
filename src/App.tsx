import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocaleProvider } from './lib/locale';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/AdminRoute';
import AdminApp from './admin/AdminApp';

import SiteLayout from './site/SiteLayout';
import HomePage from './site/pages/HomePage';
import ToursPage from './site/pages/ToursPage';
import TourDetailPage from './site/pages/TourDetailPage';
import StaysPage from './site/pages/StaysPage';
import StayDetailPage from './site/pages/StayDetailPage';
import DestinosPage from './site/pages/DestinosPage';
import AboutPage from './site/pages/AboutPage';

import LoginPageNew from './pages/LoginPageNew';
import SignupPageNew from './pages/SignupPageNew';
import ProfilePageNew from './pages/ProfilePageNew';
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
            <Route element={<SiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tours" element={<ToursPage />} />
              <Route path="/tours/:slug" element={<TourDetailPage />} />
              <Route path="/hospedajes" element={<StaysPage />} />
              <Route path="/hospedajes/:slug" element={<StayDetailPage />} />
              <Route path="/destinos" element={<DestinosPage />} />
              <Route path="/nosotros" element={<AboutPage />} />
            </Route>

            <Route path="/login" element={<LoginPageNew />} />
            <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
            <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
            <Route path="/registro" element={<SignupPageNew />} />
            <Route path="/register" element={<SignupPageNew />} />
            <Route path="/perfil" element={<ProfilePageNew />} />
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
