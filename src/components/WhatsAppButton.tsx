import { useState } from 'react';
import ChatBot from './ChatBot';

const WhatsAppButton: React.FC = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group ring-4 ring-blue-100"
        aria-label="Abrir chat de soporte"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8 text-white"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <circle cx="9" cy="10" r="1"></circle>
          <circle cx="12" cy="10" r="1"></circle>
          <circle cx="15" cy="10" r="1"></circle>
        </svg>
        
        {/* Tooltip */}
        <div className="absolute right-20 bg-gray-900 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          ¿Necesitas ayuda? Chatea con nosotros
        </div>
      </button>

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
    </>
  );
};

export default WhatsAppButton;

