import React, { useState, useEffect } from "react";
import { FaHotel, FaPlane, FaMapMarkedAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";


type Reserva = {
  id: string;
  tipo: string;
  nombre: string;
  destino: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
};

const DashboardPage: React.FC = () => {
  const { user } = useUser();
  // const [section, setSection] = useState("resumen");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.email) {
      navigate("/login");
      return;
    }
    fetch(`http://localhost:5000/api/reservas?email=${user.email}`)
      .then(res => res.json())
      .then(data => setReservas(data));
  }, [navigate]);

  if (!user) return null;

  // KPIs
  const totalReservas = reservas.length;
  const vuelos = reservas.filter(r => r.tipo === "vuelo").length;
  const tours = reservas.filter(r => r.tipo === "tour").length;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 mt-4">Panel de Usuario</h1>
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6 flex items-center gap-4 shadow-sm">
            <FaHotel className="text-3xl text-red-400" />
            <div>
              <div className="text-2xl font-bold">{totalReservas}</div>
              <div className="text-gray-500 text-sm">Reservas totales</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6 flex items-center gap-4 shadow-sm">
            <FaPlane className="text-3xl text-blue-400" />
            <div>
              <div className="text-2xl font-bold">{vuelos}</div>
              <div className="text-gray-500 text-sm">Vuelos</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6 flex items-center gap-4 shadow-sm">
            <FaMapMarkedAlt className="text-3xl text-green-400" />
            <div>
              <div className="text-2xl font-bold">{tours}</div>
              <div className="text-gray-500 text-sm">Tours</div>
            </div>
          </div>
        </div>
        {/* Tabla de Reservas */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Reservas recientes</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="py-2">Nombre</th>
                <th className="py-2">Destino</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Fechas</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-6">No tienes reservas recientes.</td>
                </tr>
              ) : (
                reservas.slice(0, 5).map(reserva => (
                  <tr key={reserva.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{reserva.nombre}</td>
                    <td className="py-2">{reserva.destino}</td>
                    <td className="py-2 capitalize">{reserva.tipo}</td>
                    <td className="py-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${reserva.estado === "Confirmada" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {reserva.estado}
                      </span>
                    </td>
                    <td className="py-2">{reserva.fecha_inicio} - {reserva.fecha_fin}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;