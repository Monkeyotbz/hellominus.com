import React, { useState } from "react";

interface Props {
  userEmail: string;
  onReservaCreada: () => void;
}

const ReservaForm: React.FC<Props> = ({ userEmail, onReservaCreada }) => {
  const [nombre, setNombre] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha_inicio, setFechaInicio] = useState("");
  const [fecha_fin, setFechaFin] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("hotel");
  const [estado, setEstado] = useState("Confirmada");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_email: userEmail,
        nombre,
        destino,
        fecha_inicio,
        fecha_fin,
        estado,
        monto: parseInt(monto),
        tipo,
      }),
    });
    if (res.ok) {
      setMensaje("¡Reservación creada y correo enviado!");
      setNombre(""); setDestino(""); setFechaInicio(""); setFechaFin(""); setMonto("");
      onReservaCreada();
    } else {
      setMensaje("Error al crear la reservación.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
      <input className="border p-2 rounded flex-1" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
      <input className="border p-2 rounded flex-1" placeholder="Destino" value={destino} onChange={e => setDestino(e.target.value)} required />
      <input className="border p-2 rounded" type="date" value={fecha_inicio} onChange={e => setFechaInicio(e.target.value)} required />
      <input className="border p-2 rounded" type="date" value={fecha_fin} onChange={e => setFechaFin(e.target.value)} required />
      <input className="border p-2 rounded w-28" type="number" placeholder="Monto" value={monto} onChange={e => setMonto(e.target.value)} required />
      <select className="border p-2 rounded" value={tipo} onChange={e => setTipo(e.target.value)}>
        <option value="hotel">Hotel</option>
        <option value="vuelo">Vuelo</option>
        <option value="tour">Tour</option>
      </select>
      <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" type="submit">Reservar</button>
      {mensaje && <span className="ml-4 text-green-700">{mensaje}</span>}
    </form>
  );
};

export default ReservaForm;