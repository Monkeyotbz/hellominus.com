import React, { useState } from 'react';
import { MapPin, Calendar, Users } from 'lucide-react';

interface SearchBarProps {
  onSearch: (searchParams: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = '' }) => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ destination, checkIn, checkOut, guests });
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="bg-yellow-400 border-4 border-yellow-500 rounded-md p-1">
        <div className="bg-white rounded-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-0">
            {/* Destino */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-300 p-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-gray-700 flex-shrink-0" />
                <div className="flex-1">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="¿A dónde vas?"
                    className="w-full text-sm font-semibold text-gray-900 placeholder-gray-600 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Fecha de entrada */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-300 p-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-700 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs text-gray-600 block">Fecha de entrada</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Fecha de salida */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-300 p-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-700 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs text-gray-600 block">Fecha de salida</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Huéspedes */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-300 p-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs text-gray-600 block">Huéspedes</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'adulto' : 'adultos'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Botón Buscar */}
            <div className="p-2">
              <button
                type="submit"
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded transition-colors duration-200 text-base shadow-lg"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Checkboxes */}
      <div className="mt-3 flex flex-wrap gap-4 text-white text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded" />
          <span>Busco una casa o un apartamento entero</span>
        </label>
      </div>
    </form>
  );
};

export default SearchBar;
