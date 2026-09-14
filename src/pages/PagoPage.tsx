import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { formatCOP } from '../utils/format';

const logoUrl = "https://hellominusfit.vercel.app/turismo%20colombia%20fit%20logo-02.png";

const PagoPage: React.FC = () => {
  const location = useLocation();
  const reservaId = location.state?.reservaId;
  const [reserva, setReserva] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reservaId) {
      setLoading(false);
      return;
    }
    fetch(`http://localhost:5000/reservas/${reservaId}`)
      .then(res => res.json())
      .then(data => {
        setReserva(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reservaId]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#888' }}>Cargando pre-factura...</h2>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#c00' }}>No se encontró la reserva.</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: '#f6f6fa',
        padding: 32,
        paddingTop: 100
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px #0001',
        padding: 40,
        minWidth: 420,
        maxWidth: 600,
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <img src={logoUrl} alt="Hellominus" style={{ height: 48 }} />
          <div style={{ textAlign: 'right', fontSize: 14, color: '#222' }}>
            <b>Hellominus</b><br />
            Calle 123 #45-67<br />
            Bogotá, Colombia<br />
            contacto@hellominus.com
          </div>
        </div>
        <hr style={{ margin: '16px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div><b>Cliente:</b> {reserva.nombre}</div>
            <div><b>Correo:</b> {reserva.correo}</div>
            <div><b>Teléfono:</b> {reserva.telefono || '-'}</div>
            <div><b>Dirección:</b> {reserva.direccion || '-'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><b>Factura N°:</b> {reserva.id}</div>
            <div><b>Fecha:</b> {new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <h2 style={{ textAlign: 'center', color: '#1d4ed8', margin: '24px 0 16px 0', letterSpacing: 2 }}>PRE-FACTURA</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#f0f4fa' }}>
              <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Descripción</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                Reserva propiedad: <b>{reserva.propiedad_nombre}</b><br />
                <span style={{ fontSize: 13, color: '#555' }}>
                  {reserva.location} <br />
                  Check-in: {reserva.check_in} <br />
                  Check-out: {reserva.check_out} <br />
                  Huéspedes: {reserva.guests}
                </span>
              </td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>
                {formatCOP(Number(reserva.subtotal) || 0)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', color: '#555' }}>Impuesto (5%)</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right', color: '#555' }}>
                {formatCOP(Number(reserva.impuesto) || 0)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', color: '#555' }}>Aseo (2%)</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right', color: '#555' }}>
                {formatCOP(Number(reserva.valor_aseo) || 0)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 'bold', color: '#1d4ed8' }}>
                {formatCOP(Number(reserva.precio_total) || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
        <div style={{ fontSize: 13, color: '#444', marginBottom: 12 }}>
          <b>Nota:</b> Esta pre-factura es informativa. El pago se realiza en la siguiente sección.
        </div>
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: 8,
          padding: 12,
          fontSize: 13,
          color: '#92400e'
        }}>
          Recuerda que tu reserva está sujeta a confirmación y disponibilidad.
        </div>
        
        <button
          onClick={async () => {
            if (!reserva) return;
            const resp = await fetch('http://localhost:5000/crear-preferencia', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                descripcion: reserva.propiedad_nombre || 'Reserva',
                precio: reserva.precio_total || 1,
                cantidad: 1
              })
            });
            const data = await resp.json();
            window.location.href = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${data.id}`;
          }}
          style={{
            marginTop: 24,
            width: '100%',
            background: '#009ee3',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            padding: '14px 0',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}
        >
          <img
            src="https://www.mercadopago.com/org-img/MP3/home/logomp3.gif"
            alt="Mercado Pago"
            style={{ height: 28, marginRight: 8, background: 'white', borderRadius: 4, padding: 2 }}
          />
          Pagar con Mercado Pago
        </button>
        <button
          disabled
          style={{
            marginTop: 16,
            width: '100%',
            background: '#ffc439',
            color: '#111',
            fontWeight: 'bold',
            fontSize: 18,
            padding: '14px 0',
            border: 'none',
            borderRadius: 8,
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: 0.85
          }}
        >
          <img
            src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
            alt="PayPal"
            style={{ height: 28, marginRight: 8, background: 'white', borderRadius: 4, padding: 2 }}
          />
          Pagar con PayPal (próximamente)
        </button>
        <button
          disabled
          style={{
            marginTop: 16,
            width: '100%',
            background: '#635bff',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            padding: '14px 0',
            border: 'none',
            borderRadius: 8,
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: 0.85
          }}
        >
          <svg
            width="80"
            height="28"
            viewBox="0 0 80 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: 28, marginRight: 8 }}
          >
            <g>
              <text x="0" y="22" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="28" fill="#fff">
                stripe
              </text>
            </g>
          </svg>
          Pagar con Stripe (próximamente)
        </button>
        <button
          disabled
          style={{
            marginTop: 16,
            width: '100%',
            background: '#00b86b',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            padding: '14px 0',
            border: 'none',
            borderRadius: 8,
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: 0.85
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: 28, marginRight: 8 }}
          >
            <rect width="28" height="28" rx="6" fill="#00b86b"/>
            <path d="M7 14.5L12 19.5L14 17.5L9 12.5L7 14.5Z" fill="white"/>
          </svg>
          Pagar con Wise (próximamente)
        </button>
        <button
          disabled
          style={{
            marginTop: 16,
            width: '100%',
            background: '#f3ba2f',
            color: '#181818',
            fontWeight: 'bold',
            fontSize: 18,
            padding: '14px 0',
            border: 'none',
            borderRadius: 8,
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: 0.85
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: 28, marginRight: 8 }}
          >
            <rect width="28" height="28" rx="6" fill="#f3ba2f"/>
            <g>
              <path d="M14 6.5L17.5 10L14 13.5L10.5 10L14 6.5Z" fill="#181818"/>
              <path d="M8.5 12L11 14.5L8.5 17L6 14.5L8.5 12Z" fill="#181818"/>
              <path d="M19.5 12L22 14.5L19.5 17L17 14.5L19.5 12Z" fill="#181818"/>
              <path d="M14 15.5L16.5 18L14 20.5L11.5 18L14 15.5Z" fill="#181818"/>
            </g>
          </svg>
          Pagar con Binance (próximamente)
        </button>
      </div>
    </div>
  );
};

export default PagoPage;