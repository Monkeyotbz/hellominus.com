import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaUserFriends, FaWifi, FaCar, FaSwimmingPool, FaCheckCircle, FaPlaneArrival, FaSnowflake, FaEye, FaDoorOpen, FaParking, FaHome } from 'react-icons/fa';
import { ChevronLeft } from 'lucide-react';
import PropertyDetail from '../components/PropertyDetail';
import { quickProperties } from '../data/showcases';
import { formatCOP } from '../utils/format';

const PHOTOS_PER_BLOCK = 5;

const amenityIcons: Record<string, JSX.Element> = {
  wifi: <FaWifi />,
  parking: <FaParking />,
  piscina: <FaSwimmingPool />,
  vistas: <FaEye />,
  traslado: <FaPlaneArrival />,
  aire: <FaSnowflake />,
  baño: <FaBath />,
  balcón: <FaDoorOpen />,
  apartamento: <FaHome />,
  'parking privado': <FaCar />,
  'baño privado': <FaBath />,
  'traslado aeropuerto': <FaPlaneArrival />,
  'aire acondicionado': <FaSnowflake />,
  'wifi gratis': <FaWifi />,
  'vistas al mar': <FaEye />,
  'vistas a la ciudad': <FaEye />,
  'baño gratis': <FaBath />,
  'habitaciones familiares': <FaUserFriends />,
};

function getAmenityIcon(name: string) {
  const key = name.toLowerCase();
  return amenityIcons[key] || <FaCheckCircle />;
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [fromShowcase, setFromShowcase] = useState(false);
  const [guests, setGuests] = useState<string>('1');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [photoBlock, setPhotoBlock] = useState(0);

  useEffect(() => {
    // Primero intenta buscar en el showcase (nuevas propiedades)
    const showcaseProperty = quickProperties.find((p) => p.id === id);
    if (showcaseProperty) {
      setProperty(showcaseProperty);
      setFromShowcase(true);
      return;
    }

    // Si no está en showcase, intenta buscar en el backend (propiedades antiguas)
    fetch(`http://localhost:5000/properties/${id}`)
      .then(res => res.json())
      .then(data => setProperty(data))
      .catch(() => {
        setProperty(null);
      });
  }, [id]);

  // Si viene del showcase (nuevas propiedades), usa el componente PropertyDetail
  if (fromShowcase) {
    // Generar array de imágenes basado en el ID de la propiedad
    let images = [property.image];
    
    // Si es Jardín Águilas, agregar las 7 imágenes (png y jpg)
    if (id === 'jardin-aguilas') {
      images = [
        '/JARDIN/Lasaguilas.png',
        '/JARDIN/Lasaguilas1.png',
        '/JARDIN/Lasaguilas2.png',
        '/JARDIN/Lasaguilas3.png',
        '/JARDIN/Lasaguilas4.jpg',
        '/JARDIN/Lasaguilas5.jpg',
        '/JARDIN/Lasaguilas6.jpg',
        '/JARDIN/Lasaguilas7.jpg'
      ];
    }

    // Si es Opera Jacuzzi, agregar las 5 imágenes
    if (id === 'medellin-opera-jacuzzi') {
      images = [
        '/OPERA JACUZZI/OPERAJACUZZI1.png',
        '/OPERA JACUZZI/OPERAJACUZZI2.png',
        '/OPERA JACUZZI/OPERAJACUZZI3.png',
        '/OPERA JACUZZI/OPERAJACUZZI4.png',
        '/OPERA JACUZZI/OPERAJACUZZI.png'
      ];
    }

    // Si es Opera Semi Suite, agregar las 4 imágenes
    if (id === 'medellin-opera-semi-suite') {
      images = [
        '/OPERA SEMI SUITE/OPERASEMISUITE1.png',
        '/OPERA SEMI SUITE/OPERASEMISUITE2.png',
        '/OPERA SEMI SUITE/OPERASEMISUITE3.png',
        '/OPERA SEMI SUITE/OPERASEMISUITE.png'
      ];
    }

    // Si es Opera Doble Clásica, agregar las 3 imágenes
    if (id === 'medellin-opera-doble-clasica') {
      images = [
        '/OPERA DOBLE CLASICA/OPERADOBLECLASICA1.png',
        '/OPERA DOBLE CLASICA/OPERADOBLECLASICA2.png',
        '/OPERA DOBLE CLASICA/OPERADOBLECLASICA.png'
      ];
    }

    // Si es Torres del Lago, agregar las 14 imágenes
    if (id === 'cartagena-torresdellago') {
      images = [
        '/TORRESDELLAGO/TORRESDELLAGO.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO1.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO2.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO3.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO4.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO5.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO6.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO7.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO8.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO9.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO10.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO11.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO12.jpg',
        '/TORRESDELLAGO/TORRESDELLAGO13.jpg'
      ];
    }

    // Si es Penthouse, agregar las 5 imágenes
    if (id === 'cartagena-penthouse') {
      images = [
        '/ELLAGUITO/ELLAGUITO.jpg',
        '/ELLAGUITO/ELLAGUITO1.jpg',
        '/ELLAGUITO/ELLAGUITO2.jpg',
        '/ELLAGUITO/ELLAGUITO3.jpg',
        '/ELLAGUITO/ELLAGUITO4.jpg'
      ];
    }

    // Si es Hotel Opera Medellín, agregar las 4 imágenes
    if (id === 'medellin-opera') {
      images = [
        '/OPERA/OPERA.jpg',
        '/OPERA/OPERA2.png',
        '/OPERA/OPERA3.jpg',
        '/OPERA/OPERA4.jpg'
      ];
    }

    // Si es Penthouse Medellín, agregar las 31 imágenes
    if (id === 'medellin-penthouse') {
      images = [
        '/penthousemed/1.jpg',
        '/penthousemed/2.jpg',
        '/penthousemed/3.jpg',
        '/penthousemed/4.jpg',
        '/penthousemed/5.jpg',
        '/penthousemed/6.jpg',
        '/penthousemed/7.jpg',
        '/penthousemed/8.jpg',
        '/penthousemed/9.jpg',
        '/penthousemed/10.jpg',
        '/penthousemed/11.jpg',
        '/penthousemed/12.jpg',
        '/penthousemed/13.jpg',
        '/penthousemed/14.jpg',
        '/penthousemed/15.jpg',
        '/penthousemed/16.jpg',
        '/penthousemed/17.jpg',
        '/penthousemed/18.jpg',
        '/penthousemed/19.jpg',
        '/penthousemed/20.jpg',
        '/penthousemed/21.jpg',
        '/penthousemed/22.jpg',
        '/penthousemed/23.jpg',
        '/penthousemed/24.jpg',
        '/penthousemed/25.jpg',
        '/penthousemed/26.jpg',
        '/penthousemed/27.jpg',
        '/penthousemed/28.jpg',
        '/penthousemed/29.jpg',
        '/penthousemed/30.jpg',
        '/penthousemed/31.jpg'
      ];
    }

    // Si es Jericó Rural, agregar las imágenes disponibles
    if (id === 'jerico-rural') {
      images = [
        '/JERICO/671963015.jpg',
        '/JERICO/Jerico3.1.jpg',
        '/JERICO/Jerico5.jpg',
        '/JERICO/Jerico6.jpg',
        '/JERICO/Jerico7.jpg',
        '/JERICO/Jerico8.jpg',
        '/JERICO/Jerico9.jpg',
        '/JERICO/Jerico10.jpg',
        '/JERICO/Jerico11.jpg',
        '/JERICO/Jerico12.jpg',
        '/JERICO/mesero.jpg'
      ];
    }

    // Si es Nuevo Conquistador, agregar las 11 imágenes
    if (id === 'cartagena-nuevo-conquistador') {
      images = [
        '/NUEVO CONQUISTADOR/CONQUISTADOR.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR1.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR2.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR3.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR4.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR5.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR6.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR7.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR8.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR9.jpg',
        '/NUEVO CONQUISTADOR/CONQUISTADOR10.jpg'
      ];
    }

    // Si es Tres Carabelas, agregar las 11 imágenes
    if (id === 'cartagena-tres-carabelas') {
      images = [
        '/CARABELAS/CARABELAS.jpg',
        '/CARABELAS/CARABELAS1.jpg',
        '/CARABELAS/CARABELAS2.jpg',
        '/CARABELAS/CARABELAS3.jpg',
        '/CARABELAS/CARABELAS4.jpg',
        '/CARABELAS/CARABELAS5.jpg',
        '/CARABELAS/CARABELAS6.jpg',
        '/CARABELAS/CARABELAS7.jpg',
        '/CARABELAS/CARABELAS8.jpg',
        '/CARABELAS/CARABELAS9.jpg',
        '/CARABELAS/CARABELAS10.jpg'
      ];
    }

    // Si es Palmettos, agregar las 11 imágenes
    if (id === 'cartagena-palmettos') {
      images = [
        '/PALMETTOS/PALMETTOS.jpg',
        '/PALMETTOS/PALMETTOS1.jpg',
        '/PALMETTOS/PALMETTOS2.jpg',
        '/PALMETTOS/PALMETTOS3.jpg',
        '/PALMETTOS/PALMETTOS4.jpg',
        '/PALMETTOS/PALMETTOS5.jpg',
        '/PALMETTOS/PALMETTOS6.jpg',
        '/PALMETTOS/PALMETTOS7.jpg',
        '/PALMETTOS/PALMETTOS8.jpg',
        '/PALMETTOS/PALMETTOS9.jpg',
        '/PALMETTOS/PALMETTOS10.jpg'
      ];
    }

    // Si es San Jerónimo Rural, agregar las 9 imágenes
    if (id === 'san-jeronimo-rural') {
      images = [
        '/SAN JERONIMO/SANJERONIMO1.png',
        '/SAN JERONIMO/SANJERONIMO2.png',
        '/SAN JERONIMO/SANJERONIMO3.png',
        '/SAN JERONIMO/SANJERONIMO4.png',
        '/SAN JERONIMO/SANJERONIMO5.png',
        '/SAN JERONIMO/SANJERONIMO6.png',
        '/SAN JERONIMO/SANJERONIMO7.png',
        '/SAN JERONIMO/SANJERONIMO8.png',
        '/SAN JERONIMO/SANJERONIMO9.png'
      ];
    }

    // Si es Pitalito Rancho California, agregar las 3 imágenes
    if (id === 'pitalito-rancho-california') {
      images = [
        '/PITALITO/PITALITO1.png',
        '/PITALITO/PITALITO2.png',
        '/PITALITO/PITALITO3.png'
      ];
    }

    return (
      <>
        <PropertyDetail item={property} images={images} ctaLabel="Quiero reservar esta propiedad" />
      </>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h1>
          <p className="text-gray-600 mb-6">La propiedad que buscas no existe.</p>
          <button
            onClick={() => navigate('/properties')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver a propiedades
          </button>
        </div>
      </div>
    );
  }

  // Lógica para propiedades del backend

  // Manejo de imágenes
  let imgs: string[] = [];
  if (Array.isArray(property.imageUrls)) {
    imgs = property.imageUrls;
  } else if (Array.isArray(property.image_urls)) {
    imgs = property.image_urls;
  } else if (typeof property.imageUrls === 'string') {
    try { imgs = JSON.parse(property.imageUrls); } catch { imgs = []; }
  } else if (typeof property.image_urls === 'string') {
    try { imgs = JSON.parse(property.image_urls); } catch { imgs = []; }
  }

  const totalBlocks = Math.ceil(imgs.length / PHOTOS_PER_BLOCK);
  const startIdx = photoBlock * PHOTOS_PER_BLOCK;
  const blockImgs = imgs.slice(startIdx, startIdx + PHOTOS_PER_BLOCK);

  function getImgUrl(img: string) {
    if (!img) return 'https://via.placeholder.com/600x400?text=Sin+Imagen';
    if (img.startsWith('http')) return img;
    const cleanImg = img.startsWith('/uploads') ? img : `/uploads/${img.replace(/^\/+/, '')}`;
    return `http://localhost:5000${cleanImg}`;
  }

  const mainImg = blockImgs[0] ? getImgUrl(blockImgs[0]) : 'https://via.placeholder.com/600x400?text=Sin+Imagen';
  const mosaicImgs = blockImgs.slice(1).map(getImgUrl);

  const handleReservar = () => {
    const user = localStorage.getItem('user');
    const isAuthenticated = !!user;
    const reserva = {
      propertyId: property._id,
      propertyName: property.name,
      checkIn,
      checkOut,
      guests,
      prices: property.prices, // <-- ENVÍA EL ARRAY DE PRECIOS
      image: imgs[0] ? getImgUrl(imgs[0]) : '',
      location: property.location,
    };
    if (isAuthenticated) {
      navigate('/reserva', { state: { reserva } });
    } else {
      navigate('/login');
    }
  };

  const guestsNumber = Number(guests) || 1;
  const priceForGuests =
    Array.isArray(property.prices) && property.prices.length > 0
      ? property.prices.find((p: any) => Number(p.people) === guestsNumber)?.price
        ?? property.prices[0].price
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-[140px]">
      <div className="max-w-7xl mx-auto pb-10 px-2 md:px-6">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">{property.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-gray-600 text-sm sm:text-base">
            <FaMapMarkerAlt className="text-blue-500" />
            <span>{property.location}</span>
            <span className="flex items-center gap-1 ml-2 sm:ml-4">
              <FaStar className="text-yellow-500" />
              <span className="font-semibold">{property.rating ?? 0}</span>
            </span>
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition text-sm sm:text-base w-full md:w-auto"
          onClick={() => document.getElementById('reserva-panel')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Reservar tu apartamento
        </button>
      </div>

      {/* Galería tipo Booking */}
      {!showAllPhotos ? (
        <div className="relative mb-8">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden min-h-[320px] max-h-[420px]">
            <div className="col-span-2 row-span-2">
              <img src={mainImg} alt="principal" className="w-full h-full object-cover rounded-l-xl" />
            </div>
            {mosaicImgs.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`foto ${startIdx + i + 2}`}
                className={`w-full h-full object-cover ${i === 2 ? 'rounded-tr-xl' : ''} ${i === 3 ? 'rounded-br-xl' : ''}`}
              />
            ))}
          </div>
          {/* Miniaturas debajo */}
          <div className="flex gap-2 mt-2">
            {imgs.slice(0, 6).map((img, i) => (
              <img
                key={i}
                src={getImgUrl(img)}
                alt={`miniatura ${i + 1}`}
                className="w-20 h-14 object-cover rounded cursor-pointer border-2 border-white hover:border-blue-400"
                onClick={() => { setPhotoBlock(Math.floor(i / PHOTOS_PER_BLOCK)); }}
              />
            ))}
            {imgs.length > 6 && (
              <button
                className="ml-2 px-3 py-1 bg-white border rounded shadow text-blue-600 font-semibold"
                onClick={() => setShowAllPhotos(true)}
              >
                {imgs.length - 6}+ fotos más
              </button>
            )}
          </div>
          {/* Navegación de bloques */}
          {totalBlocks > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 px-3 py-2 rounded-full shadow font-bold text-xl"
                onClick={() => setPhotoBlock(b => (b - 1 + totalBlocks) % totalBlocks)}
                style={{ zIndex: 10 }}
              >
                {"<"}
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 px-3 py-2 rounded-full shadow font-bold text-xl"
                onClick={() => setPhotoBlock(b => (b + 1) % totalBlocks)}
                style={{ zIndex: 10 }}
              >
                {">"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center overflow-auto">
          <button
            className="self-end m-6 bg-white px-4 py-2 rounded-lg font-semibold"
            onClick={() => setShowAllPhotos(false)}
          >
            Cerrar
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-8 w-full max-w-6xl">
            {imgs.map((img, i) => (
              <img
                key={i}
                src={getImgUrl(img)}
                alt={`foto ${i + 1}`}
                className="w-full h-72 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Info y panel lateral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Info principal */}
        <div className="md:col-span-2">
          {/* Características principales tipo Booking */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded">
              <FaHome className="text-blue-500" /> <span>{property.type}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded">
              <FaBed className="text-blue-500" /> <span>{property.bedrooms} Habitaciones</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded">
              <FaBath className="text-blue-500" /> <span>{property.bathrooms} Baños</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded">
              <FaRulerCombined className="text-blue-500" /> <span>{property.squareMeters} m²</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded">
              <FaUserFriends className="text-blue-500" /> <span>Hasta {property.maxGuests || 1} personas</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded">
              <FaCheckCircle className="text-blue-500" /> <span>{property.status}</span>
            </div>
          </div>
          {/* Descripción */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Descripción</h2>
            <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
          </div>
          {/* Comodidades/Amenities con íconos */}
          {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Comodidades</h2>
              <ul className="flex flex-wrap gap-3">
                {property.amenities.map((a: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {getAmenityIcon(a)} {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Reseñas */}
          {property.reviews && Array.isArray(property.reviews) && property.reviews.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Reseñas</h2>
              <div className="space-y-4">
                {property.reviews.map((review: any, i: number) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{review.user || 'Usuario'}</span>
                      <FaStar className="text-yellow-500" />
                      <span>{review.rating ?? ''}</span>
                    </div>
                    <div className="text-gray-700">{review.comment}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Panel lateral de reserva y mapa */}
        <div className="md:col-span-1">
          <div id="reserva-panel" className="bg-white rounded-3xl shadow-2xl p-8 sticky top-24 mb-6">
            <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
              Completa tu <span className="text-blue-600">reserva</span>
            </h2>
            <div className="text-3xl font-bold mb-4 flex items-center gap-2 justify-center">
              {formatCOP(priceForGuests)}
              <span className="text-lg font-normal text-gray-500">/ noche</span>
            </div>
            <form className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Check-in</label>
                <input
                  type="date"
                  className="w-full border rounded-xl px-4 py-3 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Check-out</label>
                <input
                  type="date"
                  className="w-full border rounded-xl px-4 py-3 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Personas</label>
                <input
                  type="number"
                  className="w-full border rounded-xl px-4 py-3 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min={1}
                  max={property.maxGuests || 20}
                  value={guests}
                  onChange={e => {
                    // Permite vacío, elimina ceros a la izquierda
                    let val = e.target.value.replace(/^0+/, '');
                    if (val === '') setGuests('');
                    else setGuests(String(Math.max(1, Number(val))));
                  }}
                  onBlur={() => {
                    // Si queda vacío al salir, pon 1
                    if (guests === '' || Number(guests) < 1) setGuests('1');
                  }}
                />
              </div>
              <button
                type="button"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:bg-blue-700 transition"
                onClick={handleReservar}
              >
                Reservar ahora
              </button>
            </form>
          </div>
          {/* Mapa tipo Booking */}
          <div className="bg-blue-50 rounded-xl shadow p-4 flex flex-col items-center">
            <div className="w-full h-56 rounded-lg overflow-hidden mb-2">
              <iframe
                title="mapa"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 transition">
              Ver en el mapa
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;