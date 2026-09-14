import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 pt-12 pb-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src="/brand/logo.svg" alt="Hellominus" className="h-15 w-13" />
            </Link>
            <p className="mb-4 text-gray-400">
              Encuentra tu estadía perfecta con Hellominus. Ofrecemos una amplia variedad de alojamientos alrededor Colombia a los mejores precios.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Destinos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/properties?destination=Bali" className="text-gray-400 hover:text-white transition-colors">
                  
                </Link>
              </li>
              <li>
                <Link to="/properties?destination=Paris" className="text-gray-400 hover:text-white transition-colors">
                  
                </Link>
              </li>
              <li>
                <Link to="/properties?destination=Santorini" className="text-gray-400 hover:text-white transition-colors">
                  
                </Link>
              </li>
              <li>
                <Link to="/properties?destination=New York" className="text-gray-400 hover:text-white transition-colors">
                  
                </Link>
              </li>
              <li>
                <Link to="/properties?destination=Tokyo" className="text-gray-400 hover:text-white transition-colors">
                  
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="text-gray-400 hover:text-white transition-colors">
                  Ver todos los destinos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Compañía</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Empleos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-400 hover:text-white transition-colors">
                  Prensa
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-gray-400 hover:text-white transition-colors">
                  Socios
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contáctanos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Soporte</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link to="/cancellation" className="text-gray-400 hover:text-white transition-colors">
                  Opciones de cancelación
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-400 hover:text-white transition-colors">
                  Centro de recursos de seguridad
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Términos del servicio
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-700 mb-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Hellominus. Todos los derechos reservados.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <div className="flex items-center mr-4">
              <Globe className="h-4 w-4 mr-1 text-gray-400" />
              <select className="bg-transparent text-gray-400 text-sm border-none focus:ring-0">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div className="flex items-center">
              <select className="bg-transparent text-gray-400 text-sm border-none focus:ring-0">
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
                <option value="jpy">JPY</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;