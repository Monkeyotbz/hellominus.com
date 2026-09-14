import { ShowcaseItem } from '../components/QuickCard';

const WHATSAPP_NUMBER = '';
const buildWhatsapp = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const quickProperties: ShowcaseItem[] = [
  {
    id: 'jardin-aguilas',
    name: 'Cabaña Las Águilas',
    location: 'Jardín, Antioquia',
    description:
      'Cabaña rodeada de naturaleza en destino rural. Diseñada para amantes de la naturaleza con jardín, balcón, WiFi gratis y cocina compartida. Incluye traslados al aeropuerto, alquiler de caballos, vistas a montañas, cascadas, ríos y cuevas. Una experiencia única e inolvidable.',
    image: '/JARDIN/Lasaguilas.png',
    priceLabel: 'Desde $180.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar la Cabaña Las Águilas en Jardín'),
    booking: 'https://www.booking.com/hotel/co/cabana-las-aguilas.es.html',
    tags: ['Naturaleza', 'Alquiler caballos', 'WiFi gratis', 'Traslado aeropuerto', 'Vistas panorámicas', 'Cocina compartida']
  },
  {
    id: 'medellin-opera',
    name: 'Hotel Opera Medellín Centro Only Adults',
    location: 'Centro, Medellín',
    description:
      'Hotel solo para adultos en la zona rosa del centro de Medellín. Habitaciones confortables, bar exclusivo hasta la 1:00 A.M, wifi y lavandería. Ubicado cerca del Edificio Coltejer, La Plazoleta de Botero y la estación Parque Berrío.',
    image: '/OPERA/OPERA.jpg',
    priceLabel: 'Desde $280.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Hotel Opera Medellín'),
    booking: 'https://www.airbnb.mx/rooms/1096626860509194431?viralityEntryPoint=1&s=76&source_impression_id=p3_1766451648_P3Abvha4rYjyu5Ds',
    tags: ['Solo adultos', 'Bar hasta 1:00 A.M', 'WiFi gratis', 'Lavandería', 'Traslado aeropuerto', 'Cerca Parque Berrío']
  },
  {
    id: 'medellin-opera-jacuzzi',
    name: 'Hotel Medellín Opera Habitación con Jacuzzi',
    location: 'Centro, Medellín',
    description:
      'Quédate en este espectacular hotel en el centro de la ciudad. Habitación con jacuzzi turco, uno de los pocos lugares en la zona con este servicio. Ideal para parejas que buscan relajarse en un ambiente íntimo y confortable. WiFi, TV, aire acondicionado y servicio de equipaje.',
    image: '/OPERA JACUZZI/OPERAJACUZZI1.png',
    priceLabel: 'Desde $320.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Hotel Opera con Jacuzzi'),
    booking: 'https://www.airbnb.mx/rooms/1096626860509194431?viralityEntryPoint=1&s=76&source_impression_id=p3_1766451648_P3Abvha4rYjyu5Ds',
    tags: ['Jacuzzi turco', 'WiFi gratis', 'TV', 'Aire acondicionado', 'Centro', 'Romántico', 'Solo adultos']
  },
  {
    id: 'medellin-opera-semi-suite',
    name: 'Hotel Opera Medellín Habitación Semi Suite',
    location: 'Centro, Medellín',
    description:
      'Quédate en este lugar único ubicado en pleno centro y no te pierdas los lugares históricos que puedes visitar con nosotros. En Pleno Corazón de Medellín, habitación con jacuzzi, bas discoteca, puede haber ruido, solo para adultos, zona rosa de el centro de Medellín. Relájate en el jacuzzi.',
    image: '/OPERA SEMI SUITE/OPERASEMISUITE1.png',
    priceLabel: 'Desde $300.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Hotel Opera Semi Suite'),
    booking: 'https://www.airbnb.mx/rooms/1096609489889215238?viralityEntryPoint=1&s=76&source_impression_id=p3_1766453625_P3ttjR2itMCH_qki',
    tags: ['Jacuzzi', 'WiFi gratis', 'TV', 'Centro', 'Solo adultos', 'Zona rosa', 'Cámaras seguridad']
  },
  {
    id: 'medellin-opera-doble-clasica',
    name: 'Hotel Medellín Opera Habitación Doble Clásica',
    location: 'Centro, Medellín',
    description:
      'Quédate en este lugar único ubicado en pleno centro y no te pierdas nada. Habitación cómoda y acogedora en el corazón de Medellín, perfecta para parejas o viajeros que buscan una estancia económica en la zona rosa del centro.',
    image: '/OPERA DOBLE CLASICA/OPERADOBLECLASICA1.png',
    priceLabel: 'Desde $250.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Hotel Opera Habitación Doble Clásica'),
    booking: 'https://www.airbnb.mx/rooms/1096637352815155525?viralityEntryPoint=1&s=76&source_impression_id=p3_1766454096_P3DR3Y9H7-67WCYc',
    tags: ['WiFi gratis', 'TV', 'Centro', 'Económico', 'Zona rosa', 'Solo adultos']
  },
  {
    id: 'medellin-penthouse',
    name: 'Penthouse Panorama Medellín',
    location: 'El Poblado, Medellín',
    description:
      'Penthouse panorámico en El Poblado con terraza y vistas 360° a la ciudad. Ideal para viajes de lujo o estancias largas; incluye zonas sociales amplias, cocina equipada y múltiples ambientes para trabajar o descansar.',
    image: '/penthousemed/1.jpg',
    priceLabel: 'Desde $520.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Penthouse Panorama Medellín'),
    booking: '',
    tags: ['Vistas 360°', 'Terraza', 'WiFi gratis', 'Cocina equipada', 'A/C', 'Espacios amplios']
  },
  {
    id: 'jerico-rural',
    name: 'Hospedaje Rural Jericó',
    location: 'Jericó, Antioquia',
    description:
      'Cabaña rural con wifi gratis y cocina compartida, perfecta para vivir Jericó: pueblo de balcones coloridos, cafés de origen y atardeceres frente al Cauca. Incluye traslados al aeropuerto, alquiler de bicicletas, vistas hermosas y desayuno americano diario. Habitaciones con cafetera, TV de pantalla plana y baño privado; a pocas cuadras de la iglesia principal y el mirador.',
    image: '/JERICO/671963015.jpg',
    priceLabel: 'Desde $190.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Hospedaje Rural en Jericó'),
    booking: '',
    tags: ['Wifi gratis', 'Cocina compartida', 'Desayuno americano', 'Traslado aeropuerto', 'Alquiler de bicicletas', 'Vistas hermosas']
  },
  {
    id: 'cartagena-torresdellago',
    name: 'Hospedaje Delux Cartagena',
    location: 'Cartagena de Indias, Colombia',
    description:
      'Ofrece vistas al lago y piscina al aire libre y está en el barrio de Laguito, en Cartagena de Indias, a 4 min a pie de Playa El Laguito y a 5.2 km de Palacio de la Inquisición. Hay wifi gratis en todo el alojamiento y parking privado. Todas las unidades tienen aire acondicionado y disponen de baño privado, TV de pantalla plana, cocina totalmente equipada y balcón.\n\nParque Bolívar está a 5,2 km del alojamiento, y Museo del Oro de Cartagena está a 5,3 km. El aeropuerto (Aeropuerto Internacional Rafael Núñez) está a 10 km y el alojamiento ofrece servicio de traslado pagando una tarifa extra.',
    image: '/TORRESDELLAGO/TORRESDELLAGO.jpg',
    priceLabel: 'Desde $150.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar en Hospedaje Delux Cartagena'),
    booking: 'https://www.booking.com/Share-bHLtPF',
    tags: ['Piscina al aire libre', 'WiFi gratis', 'Parking privado', 'Aire acondicionado', 'TV plasma', 'Cocina equipada', 'Balcón privado', 'Traslado aeropuerto']
  },
  {
    id: 'cartagena-penthouse',
    name: 'Hospedajes Penthouse Cartagena El Laguito',
    location: 'El Laguito, Cartagena de Indias, Colombia',
    description:
      'Está en el barrio de Laguito, en Cartagena de Indias, a 1 min a pie de Playa El Laguito y a 4.9 km de Palacio de la Inquisición, y ofrece alojamiento equipado con balcón y wifi gratis. Este apartamento está a 4.3 km de Museo del Oro de Cartagena.\n\nEste apartamento con aire acondicionado se compone de 1 dormitorio independiente, una cocina totalmente equipada y 1 baño. Castillo de San Felipe de Barajas está a 6,1 km del alojamiento, y Muralla de Cartagena está a 6,4 km. El aeropuerto (Aeropuerto Internacional Rafael Núñez) está a 10 km.',
    image: '/ELLAGUITO/ELLAGUITO.jpg',
    priceLabel: 'Desde $250.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Penthouse en El Laguito'),
    booking: 'https://www.booking.com/Share-0mQvbg',
    tags: ['180 m² tamaño', 'Piscina', 'Baño privado', 'Balcón', 'Vistas panorámicas', 'WiFi gratis', 'Aire acondicionado', 'Cocina equipada']
  },
  {
    id: 'cartagena-nuevo-conquistador',
    name: 'Hospedaje Cartagena Hellominus',
    location: 'Cartagena de Indias, Colombia',
    description:
      'Se encuentra en Cartagena de Indias y ofrece alojamiento con piscina al aire libre y wifi gratis a 1 min a pie de Playa El Laguito y a 4.9 km de Palacio de la Inquisición. Algunas unidades tienen aire acondicionado e incluyen balcón y/o zona de estar con TV de pantalla plana. El apartamento ofrece servicio de alquiler de coches.\n\nParque Bolívar está a 4.9 km del alojamiento, y Museo del Oro de Cartagena está a 5 km. El aeropuerto (Aeropuerto Internacional Rafael Núñez) está a 10 km, y el alojamiento ofrece servicio de traslado de pago para ir o volver del aeropuerto.',
    image: '/NUEVO CONQUISTADOR/CONQUISTADOR.jpg',
    priceLabel: 'Desde $120.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar en Hospedaje Cartagena Hellominus'),
    booking: 'https://www.booking.com/Share-xOJgWPV',
    tags: ['Piscina al aire libre', 'WiFi gratis', 'Aire acondicionado', 'Baño privado', 'Balcón', 'TV pantalla plana', 'Traslado aeropuerto', 'Alquiler coches']
  },
  {
    id: 'cartagena-tres-carabelas',
    name: 'Hospedajes Cartagena Tours El Laguito',
    location: 'El Laguito, Cartagena de Indias, Colombia',
    description:
      'Se encuentra en Cartagena de Indias y ofrece alojamiento con wifi gratis y TV, además de la posibilidad de alojarse en la azotea. Cada unidad está equipada con aire acondicionado, baño privado y cocina con nevera y fogones. El apartamento ofrece servicio de alquiler de coches.\n\nPlaya de Bocagrande está a 7 min a pie del alojamiento y Palacio de la Inquisición está a 4.3 km. El aeropuerto (Aeropuerto Internacional Rafael Núñez) está a 9 km, y el apartamento ofrece servicio de traslado de pago para ir o volver del aeropuerto.',
    image: '/CARABELAS/CARABELAS.jpg',
    priceLabel: 'Desde $140.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar en Hospedajes Cartagena Tours El Laguito'),
    booking: 'https://www.booking.com/Share-FjVuSg',
    tags: ['Apartamentos', 'Piscina al aire libre', 'Baño privado', 'Balcón', 'Vistas', 'WiFi gratis', 'Aire acondicionado', 'Habitaciones familiares']
  },
  {
    id: 'cartagena-palmettos',
    name: 'Hoteles Cartagena Bocagrande',
    location: 'Bocagrande, Cartagena de Indias, Colombia',
    description:
      'Está a pocos pasos de Playa de Bocagrande y ofrece alojamiento con piscina al aire libre, spa y recepción 24 horas. Hay wifi gratis en todo el alojamiento y parking privado en el establecimiento. E apartamento ofrece servicio de alquiler de coches.\n\nPalacio de la Inquisición está a 3.1 km del alojamiento, y Parque Bolívar está a 3.2 km. El aeropuerto (Aeropuerto Internacional Rafael Núñez) está a 8 km, y el alojamiento ofrece servicio de traslado de pago para ir o volver del aeropuerto.',
    image: '/PALMETTOS/PALMETTOS.jpg',
    priceLabel: 'Desde $165.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar en Hoteles Cartagena Bocagrande'),
    booking: 'https://www.booking.com/Share-a2zPYK',
    tags: ['Apartamentos', 'Piscina al aire libre', 'Parking privado', 'Baño privado', 'Balcón', 'WiFi gratis', 'Aire acondicionado', 'Recepción 24h']
  },
  {
    id: 'san-jeronimo-rural',
    name: 'Alojamiento Rural San Jerónimo',
    location: 'San Jerónimo, Antioquia',
    description:
      'Villa completa en San Jerónimo, Colombia. Lugar único ubicado en pleno centro y no te pierdas nada. Más de 16 huéspedes, 8 habitaciones, 12 camas, 8 baños. Sumérgete en una de las pocas albercas de la zona. Disfruta las vistas a la montaña y al jardín. Una habitación con wifi apta para trabajar.',
    image: '/SAN JERONIMO/SANJERONIMO1.png',
    priceLabel: 'Desde $350.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Alojamiento Rural San Jerónimo'),
    booking: 'https://www.airbnb.mx/rooms/925716640889262336?viralityEntryPoint=1&s=76&source_impression_id=p3_1766449818_P3Z5ZuQJs8aBPeSE',
    tags: ['Montaña', 'Piscina', 'Familiar', 'Grupos Grandes', 'WiFi gratis', 'Rural', 'Vistas panorámicas', '8 habitaciones']
  },
  {
    id: 'pitalito-rancho-california',
    name: 'Turismo Rural, Rancho California',
    location: 'Timaná, Huila',
    description:
      'Cabaña entera en Timaná, Colombia. Crea recuerdos inolvidables en este alojamiento único y familiar. 12 huéspedes, 4 habitaciones, 4 camas, 2 baños. Sumérgete en una de las pocas albercas de la zona con diseño único. Ideal para familias y grupos que buscan desconectar en un ambiente rural tranquilo.',
    image: '/PITALITO/PITALITO1.png',
    priceLabel: 'Desde $280.000 / noche',
    whatsapp: buildWhatsapp('Hola, quiero reservar Turismo Rural, Rancho California'),
    booking: 'https://www.airbnb.com',
    tags: ['Rural', 'Piscina', 'Familiar', 'Grupos Grandes', 'Naturaleza', 'Tranquilidad', '4 habitaciones']
  }
];

export const quickTours: ShowcaseItem[] = [
  // Tours de Cartagena
  {
    id: 'isla-cholon',
    name: 'ISLA CHOLON',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Full piscina oceanica\nTransporte en lancha (ida y regreso)\nAlmuerzo típico\nEntradas',
    image: '/TOURS/ISLA%20CHOLON.png',
    priceLabel: 'Salida: 8.00am | Regreso: 4:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Isla Cholón'),
    booking: '',
    tags: ['Lancha', 'Almuerzo', 'Piscina oceánica']
  },
  {
    id: 'playa-blanca',
    name: 'PLAYA BLANCA',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Combustible embarcación\nAlmuerzo típico\nHidratación\nTaxituristico',
    image: '/TOURS/PLAYA%20BLANCA.png',
    priceLabel: 'Salida: 7:30am | Regreso: 3:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Playa Blanca'),
    booking: '',
    tags: ['Playa', 'Almuerzo', 'Hidratación']
  },
  {
    id: 'baru-rosario',
    name: 'BARU + ISLAS DEL ROSARIO',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte en lancha (Ida y regreso)\nSan Martin de pajarales\nCholon o visita al acuario (opción)\nObservar un San Martin de pajarales\nAlmuerzo típico\nAragua\nServicio de comida: (850 adultos y 30.000 niños)\nJacuzzi de mar (uso del muelle 15$)',
    image: '/TOURS/BARU + ISLAS DEL ROSARIO.png',
    priceLabel: 'Salida: 8:00am | Regreso: 4:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Barú + Islas del Rosario'),
    booking: '',
    tags: ['Lancha', 'Almuerzo', 'Snorkel', 'Acuario']
  },
  {
    id: 'tierra-bomba-frente',
    name: 'ISLA TIERRA BOMBA (Frente a la ciudad)',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Almuerzo en la Isla en caseta\nGrillas y camas',
    image: '/TOURS/ISLA%20TIERRA%20BOMBA%20(FRENTE%20A%20LA%20CIUDAD).png',
    priceLabel: 'Salida: 8:00am | Regreso: 4:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Isla Tierra Bomba'),
    booking: '',
    tags: ['Isla', 'Almuerzo', 'Grillas', 'Camas']
  },
  {
    id: 'palmarito-beach',
    name: 'PALMARITO BEACH (Isla Tierra Bomba)',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Comida de bienvenida\nNuevo club de playa, pistas, actividad hamacas, columpio, pistas, ganas de billar y mesa picina\nY piscina\nAlmuerzo típico (variedad de opciones)',
    image: '/TOURS/PALMARITO%20BEACH%20(ISLA%20TIERRA%20BOMBA).png',
    priceLabel: 'Salida: 8:45am 10:30am 11:30am | Regreso: 4:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Palmarito Beach'),
    booking: '',
    tags: ['Beach club', 'Piscina', 'Almuerzo', 'Actividades']
  },
  {
    id: 'playa-blanca-plancton',
    name: 'PLAYA BLANCA + PLANCTON',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte en lancha (Ida)\nTour de playa blanca a San Isla del Rosario barcode del poplancio\nCena típica lancha playa, transporte lancha/salida bus-mar\nAlmuerzo típico; 100,000 entrada a isla mar; 50.000 entrada (20.000 adultos/estudiantes: 10 adultos y 15 menores)\nProfesional (biomanecen: Castillo Grande)\nEl barrio',
    image: '/TOURS/PLAYA BLANCA + PLANCTON.png',
    priceLabel: 'Salida: 7:00am | Regreso: 7:30pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Playa Blanca + Plancton'),
    booking: '',
    tags: ['Playa', 'Plancton', 'Almuerzo', 'Lancha']
  },
  {
    id: 'playa-tranquila',
    name: 'PLAYA TRANQUILA',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte en marítimo Ida y regreso\nCombustible embarcación\nAlmuerzo típico (lancha Barco pesca, pescado frito, patacones,\nensalada, Arroz coco)\nGuia de avancement',
    image: '/TOURS/PLAYA%20TRANQUILA.png',
    priceLabel: 'Salida: 7:30am | Regreso: 3:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Playa Tranquila'),
    booking: '',
    tags: ['Playa', 'Almuerzo', 'Tranquilidad', 'Lancha']
  },
  {
    id: 'playa-blanca-aviario',
    name: 'PLAYA BLANCA + AVIARIO',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Trasborto en lancha\nVisita al aviario y un acuario al centro de playa\nCena de salida de centro y comida del centro\nAlmuerzo típico; y playa tranquila\nSalida de ciudad de las 100 Alrededor centro de patio playa Blanca 500\nPortes de acreditación VIASA y prenda de veneraracion',
    image: '/TOURS/PLAYA%20BLANCA%20AVIARIO.png',
    priceLabel: 'Salida: 7:30am | Regreso: 3:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Playa Blanca + Aviario'),
    booking: '',
    tags: ['Playa', 'Aviario', 'Almuerzo', 'Lancha']
  },
  {
    id: 'tour-4-islas',
    name: 'TOUR 4 ISLAS',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Pasaporte en lancha rápida:\nVisita Playa Blanca\nLa tour del área 4-playa primero el dorado, desde aqu en la mochila turista\nIsla playa, a choio\nAlmuerzo típico/ 8% cita las 3000 de hotel lux el los\nMochila hielo escuela\nGuiado (Grua, mangle, mochizado)',
    image: '/TOURS/TOUR%204%20ISLAS.png',
    priceLabel: 'Salida: 8:00am | Regreso: 4:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Tour 4 Islas'),
    booking: '',
    tags: ['4 islas', 'Lancha rápida', 'Almuerzo', 'Playa']
  },
  {
    id: 'isla-bela',
    name: 'ISLA BELA',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte marítimo ida (lancha)\nDurante bienvenida cocoa\nComida Bandera/día, picina\nGrilla desconcertante carril, cerca y parada fraca\nWifi\nActividades acertí ócico',
    image: '/TOURS/ISLA%20BELA.png',
    priceLabel: 'Salida: 7:30am | Regreso: 3:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Isla Bela'),
    booking: '',
    tags: ['Isla', 'Almuerzo', 'Piscina', 'WiFi']
  },
  {
    id: 'isla-sol-1',
    name: 'ISLA DEL SOL',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte marítimo ida y regreso\nCóctel de bienvenida\nAlmuerzo típico\nSillas acostadoras camas, sones y paddle board\nActividades con guía opcional del tour, entrada al parque de $25.000/uso a persona',
    image: '/TOURS/ISLA%20DEL%20SOL.png',
    priceLabel: 'Salida: 7:30am | Regreso: 3:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Isla del Sol'),
    booking: '',
    tags: ['Isla', 'Almuerzo', 'Paddle board', 'Actividades']
  },
  {
    id: 'isla-encanto',
    name: 'ISLA DEL ENCANTO',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte marítimo ida y regreso\nPuedes llevar casa de las vacaciones sociales, piscina y playa\nAlmuerzo tipo buffet\nActividades con guía opcional del tour, entrada al acuario o 125.000 adultos - 825.000 niños, servicio de comida 875.000 o persona\nAlmuerzo en pequeño parque de $22.000/uso a persona',
    image: '/TOURS/ISLA%20DEL%20ENCANTO.png',
    priceLabel: 'Salida: 7:30am | Regreso: 3:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Isla del Encanto'),
    booking: '',
    tags: ['Isla', 'Piscina', 'Playa', 'Buffet']
  },
  {
    id: 'isla-sol-2',
    name: 'ISLA DEL SOL',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte marítimo ida y regreso\nCóctel de bienvenida\nSillas acostadoras, piscina infantil, piscina y playa\nAlmuerzo tipo buffet\nActividades con guía opcional del tour, entrada al acuario o 125.000 adultos - 825.000 niños',
    image: '/TOURS/ISLA%20DEL%20SOL%202.png',
    priceLabel: 'Salida: 7:30am | Regreso: 3:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour Isla del Sol'),
    booking: '',
    tags: ['Isla', 'Piscina', 'Playa', 'Buffet']
  },
  {
    id: 'city-tours-chiva',
    name: 'CITY TOURS CHIVA',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte\nGuía profesional\nBebidas alcohólicas y San Felipe\nRecorrido por Getsemaní, las tiendas, las Bóvedas, torres del reloj\nFuerte (plataformas Marbella), Monumento a los\nZapatos viejos, candelaria por el centro histórico',
    image: '/TOURS/CITY%20TOURS%20CHIVA.png',
    priceLabel: 'Recorrido 05:30pm a 9:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar el City Tours Chiva'),
    booking: '',
    tags: ['City tour', 'Chiva', 'Centro histórico', 'Bebidas']
  },
  {
    id: 'tour-5-islas-vip',
    name: 'TOUR 5 ISLAS - VIP DEPORTIVO',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Navegación en bote deportivo de lujo, capacidad máxima 12 pax, capacidad máxima 07 pax\nCholon o isla grande o playa blanca, playa\nenglándame hamacas\nRecorrido panorámico por las islas de Rosario\nRefrigerio almuerzo completo solo champagne\ngelatinas\n\nCombustible para mayor información',
    image: '/TOURS/TOUR%205%20ISLAS%20-%20VIP%20DEPORTIVO.png',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Tour 5 Islas VIP Deportivo'),
    booking: '',
    tags: ['VIP', 'Bote deportivo', '5 islas', 'Lujo']
  },
  {
    id: 'bora-bora-bech-club',
    name: 'BORA BORA BECH CLUB',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte marítimo ida y regreso\nCóctel de bienvenida\nAlmuerzo típico\nSillas acostadoras, piscina, bar, carpas acondicionadas, piscina y secciones acuáticas de la isla\nAlmuerzo en pequeño parque de $73.000/uso a persona',
    image: '/TOURS/BORA%20BORA%20BECH%20CLUB.png',
    priceLabel: 'Salida: 7:30am',
    whatsapp: buildWhatsapp('Hola, quiero reservar Bora Bora Bech Club'),
    booking: '',
    tags: ['Beach club', 'Piscina', 'Almuerzo', 'Bar']
  },
  {
    id: 'bora-bora-vip',
    name: 'BORA BORA V.I.P',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte marítimo ida y regreso\nCóctel de bienvenida\nAlmuerzo con opciones de paella valenciana,\ncordial típico, sancocho, almuerzo de pollo o\npescado y cerdo asado\nPodía frutas con de los carnés acondicionadas, piscina y\nsecciones acuáticas de la isla',
    image: '/TOURS/BORA%20BORA%20V.I.P.png',
    priceLabel: 'Salida: 7:30am',
    whatsapp: buildWhatsapp('Hola, quiero reservar Bora Bora VIP'),
    booking: '',
    tags: ['VIP', 'Paella', 'Piscina', 'Almuerzo']
  },
  {
    id: 'pao-pao-beach-club',
    name: 'PAO PAO BEACH CLUB',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte marítimo ida y regreso\nCóctel de bienvenida\nAlmuerzo con opciones de paella (fee)Trio, pasta o la\nboloñesa, típico sancocho o pollo, espaguetis\nSillas acostadoras, piscina, hamacas, billar, mesas de\nping, slas piscina y personalizada\nAlmuerzo en pequeño parque de $23.000/uso\na persona',
    image: '/TOURS/PAO%20PAO%20BEACH%20CLUB.png',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar Pao Pao Beach Club'),
    booking: '',
    tags: ['Beach club', 'Paella', 'Piscina', 'Billar']
  },
  {
    id: 'luxury-open-bar',
    name: 'LUXURY OPEN BAR',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte marítimo ida y regreso\nCóctel de bienvenida\nBarra abierta en bebidas sin bahiston\nAlmuerzo tipo buffet\nSillas acostadoras, piscina, bar, camastros, carpas\nacondicionadas, piscina y áreas, hamacas, karsil,\ncarrito de cotiza, fútbol y mas\nAlmuerzo en pequeño parque de $22.000/uso\na persona',
    image: '/TOURS/LUXURY%20OPEN%20BAR.png',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar Luxury Open Bar'),
    booking: '',
    tags: ['Luxury', 'Open bar', 'Buffet', 'Piscina']
  },
  {
    id: 'luxury-classic',
    name: 'LUXURY CLASSIC',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte marítimo ida y regreso\nCóctel de bienvenida\nAlmuerzo tipo buffet\nAlmuerzo tipo buffet\nSillas acostadoras, piscina, bar, camastros, carpas\nacondicionadas piscinas todas piscina, hamacas, karsil,\ncarrito de cotiza, fútbol y mas\nAlmuerzo en pequeño parque de $22.000/uso\na persona',
    image: '/TOURS/LUXURY%20CLASSIC.png',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar Luxury Classic'),
    booking: '',
    tags: ['Luxury', 'Buffet', 'Piscina', 'Bar']
  },
  {
    id: 'sibarita-master-cena',
    name: 'SIBARITA MASTER CENA',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Cena o & Espíritu 5 platos de servido, 3 platos fuertes, 3\napetitivo y maridacción de vino por persona\nEspectáculo de música en vivo, marisco y producto del\nmar, con sazón exclusivos, decoración, magia y gourmet',
    image: '/TOURS/SIBARITA%20MASTER%20CENA.png',
    priceLabel: 'Privado: 6:30pm-tarde - 7:00pm - Regreso: 9:00pm',
    whatsapp: buildWhatsapp('Hola, quiero reservar Sibarita Master Cena'),
    booking: '',
    tags: ['Cena gourmet', '5 tiempos', 'Vino', 'Música en vivo']
  },
  {
    id: 'bahia-rumbera-bote',
    name: 'BAHÍA RUMBERA (en bote deportivo)',
    location: 'Cartagena, Bolívar',
    category: 'Cartagena',
    description:
      'Transporte en bote deportivo\nbarra libre de ron con gaseosas\nPasabocas, dj marineros y agua\nGaleón pirata\nRecorrido por la bahía de la isla de Manga, isla, la Castillo Grande y bahía de los tiajires\nde la ciudad\nCapacidad para 14 personas para los deportiva acuaticas\nCumbias, Salsa y Pachanga',
    image: '/TOURS/BAHIA%20RUMBERA%20(EN%20BOTE%20DEPORTIVO).png',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar Bahía Rumbera en bote deportivo'),
    booking: '',
    tags: ['Bote deportivo', 'Fiesta', 'Ron', 'DJ', 'Bahía']
  },
  
  // Tours de Medellín
  {
    id: 'graffiti-medellin',
    name: 'Graffiti tour + Comuna 13',
    location: 'Medellin, Antioquia',
    category: 'Medellín',
    description:
      'Recorrido guiado por la Comuna 13 con escaleras electricas, arte urbano y historias locales.',
    image: '/Medellin1.jpg',
    priceLabel: 'Desde $80.000 / persona',
    whatsapp: buildWhatsapp('Hola, quiero agendar el graffiti tour en Medellin'),
    booking: '',
    tags: ['Guia local', 'Transporte', 'Fotografia']
  },
  {
    id: 'tour-ciudad-medellin',
    name: 'Tour por la Ciudad de Medellín',
    location: 'Medellín, Antioquia',
    category: 'Medellín',
    description:
      'Conoce la Ciudad de la Eterna Primavera  con nuestro tour completo! Incluye transporte, entradas, guía experto, póliza de asistencia e hidratación. Visitarás el el Pueblito Paisa, Milla de Oro, Graffiti Tour en la Comuna Trece, La 70 y el Parque Botero.\n\nDuración 3-4 horas',
    image: '/TOURS/TOUR%20MEDELLIN.png',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Tour por la Ciudad de Medellín'),
    booking: '',
    tags: ['City tour', 'Pueblito Paisa', 'Comuna 13', 'Parque Botero']
  },
  {
    id: 'tour-centro-historico-plaza-botero',
    name: 'Tour por el Centro Histórico y Plaza Botero',
    location: 'Medellín, Antioquia',
    category: 'Medellín',
    description:
      'Este tour te llevará a explorar el centro histórico de Medellín, donde podrás admirar la arquitectura colonial, visitar la famosa Plaza Botero y maravillarte con las esculturas del reconocido artista Fernando Botero.',
    image: '/TOURS/TOUR%20MEDELLIN.png',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Tour por el Centro Histórico y Plaza Botero'),
    booking: '',
    tags: ['Centro histórico', 'Plaza Botero', 'Arte', 'Cultura']
  },
  {
    id: 'excursion-parque-arvi',
    name: 'Excursión al Parque Arví',
    location: 'Medellín, Antioquia',
    category: 'Medellín',
    description:
      'Escápate del bullicio de la ciudad y sumérgete en la naturaleza en el Parque Arví. Este tour te llevará en un viaje en teleférico hasta este hermoso parque natural, donde podrás disfrutar de senderos para caminatas, actividades al aire libre y vistas panorámicas de Medellín y sus alrededores.',
    image: 'https://images.unsplash.com/photo-1590935217281-8f102120d683?w=800',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar la Excursión al Parque Arví'),
    booking: '',
    tags: ['Naturaleza', 'Teleférico', 'Senderismo', 'Parque']
  },
  {
    id: 'tour-gastronomico-medellin',
    name: 'Tour Gastronómico por Medellín',
    location: 'Medellín, Antioquia',
    category: 'Medellín',
    description:
      'Embárcate en un viaje culinario por los sabores de Medellín en este tour gastronómico. Prueba platos tradicionales como la bandeja paisa, la arepa de chócolo y la lechona, así como delicias modernas en restaurantes y mercados locales.',
    image: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=800',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Tour Gastronómico por Medellín'),
    booking: '',
    tags: ['Gastronomía', 'Bandeja paisa', 'Comida local', 'Mercados']
  },
  {
    id: 'tour-historico-pablo-escobar',
    name: 'Tour Histórico de Pablo Escobar',
    location: 'Medellín, Antioquia',
    category: 'Medellín',
    description:
      'Este tour ofrece una mirada objetiva y educativa sobre el pasado de Medellín relacionado con Pablo Escobar y el narcotráfico. Guiado por expertos locales que conocen profundamente la historia de la ciudad, este tour ofrece contenido proporcional una comprensión más compleja de los eventos que sucedieron durante esa época y cómo han impulsado en la actualidad actual.',
    image: 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Tour Histórico de Pablo Escobar'),
    booking: '',
    tags: ['Historia', 'Pablo Escobar', 'Educativo', 'Cultural']
  },
  {
    id: 'parque-explora',
    name: 'Parque Explora',
    location: 'Medellín, Antioquia',
    category: 'Medellín',
    description:
      'El Parque Explora es un centro interactivo de ciencia y tecnología que ofrece una experiencia educativa y divertida para visitantes de todas las edades. El Jardín Botánico de Medellín es un oasis urbano de paz y naturaleza, dedicado a la conservación de la flora nativa de Colombia y la protección de especies en peligro de extinción. Aquí podrás explorar jardines temáticos, aprender sobre la diversidad de plantas tropicales, jardines temáticos, viveros y senderos para caminatas.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar la visita al Parque Explora'),
    booking: '',
    tags: ['Ciencia', 'Tecnología', 'Jardín Botánico', 'Educativo']
  },
  {
    id: 'hacienda-napoles',
    name: 'Tour por la Hacienda Nápoles',
    location: 'Doradal, Antioquia',
    category: 'Medellín',
    description:
      'Vive un día en familia lleno de diversión en el Parque Temático Hacienda Nápoles desde Medellín en Doradal, municipio de Puerto Triunfo, Antioquia. Disfrutarás de imponentes atracciones acuáticas, fauna salvaje y mucha diversión. Nuestro tour incluye trasporte, Safari y guía.\n\nDuración 8-9 horas',
    image: '/TOURS/TOUR%20HACIENDA%20NAPOLES.png',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Tour por la Hacienda Nápoles'),
    booking: '',
    tags: ['Parque temático', 'Safari', 'Familia', 'Acuático', 'Aventura']
  },
  {
    id: 'tour-guatape',
    name: 'Tour por Guatape, Antioquia',
    location: 'Guatapé, Antioquia',
    category: 'Medellín',
    description:
      'Conoce la maravillosa piedra el Peñol, alto del chocho con granja y con su variedad de platos de nuestra gastronomía, el pueblo de Guatapé y su hermosa arquitectura patrimonial de mucho color y cultura. Nuestro tour incluye guía turístico, transporte, recorrido en lancha y tarjeta de asistencia.\n\nDuración 7-9 horas',
    image: '/TOURS/GUATAPE.png',
    priceLabel: '',
    whatsapp: buildWhatsapp('Hola, quiero reservar el Tour por Guatapé'),
    booking: '',
    tags: ['Peñol', 'Pueblo', 'Lancha', 'Cultura', 'Gastronomía']
  },
  
  // Tours de Jardín
  {
    id: 'jardin-filo-oro-caminata',
    name: 'Travesía Filo de Oro | Caminata',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Visita a la garucha, tunel con salida a cascada escondida, entrada al tunel,charco corazon, cascada del amor, camino de herradura la herrera, casa de los dulces, hidratacion, almuerzo tipo fiambre, tarjeta de asistencia medica y guia.',
    image: '/TOURS/TRAVESIA%20FILO%20DE%20ORO%20-%20CAMINATA.png',
    priceLabel: 'Duración 4 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Filo de Oro Caminata'),
    booking: '',
    tags: ['Caminata', 'Cascada', 'Tunel', 'Naturaleza']
  },
  {
    id: 'jardin-filo-oro-transporte',
    name: 'Travesía Filo de Oro | Transporte',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Visita a la garucha, tunel con salida a cascada escondida, entrada al tunel,charco corazon, cascada del amor, camino de herradura la herrera, casa de los dulces, hidratacion, almuerzo tipo fiambre, tarjeta de asistencia medica, transporte ida y regreso y guia.',
    image: '/TOURS/TRAVESIA%20FILO%20DE%20ORO%20-%20TRANSPORTE.png',
    priceLabel: 'Duración 3 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Filo de Oro Transporte'),
    booking: '',
    tags: ['Transporte', 'Cascada', 'Tunel', 'Almuerzo']
  },
  {
    id: 'jardin-filo-oro-cabalgata',
    name: 'Travesía Filo de Oro | Cabalgata',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Visita a la garucha, tunel con salida a cascada escondida, entrada al tunel,charco corazon, cascada del amor, camino de herradura la herrera, casa de los dulces, hidratacion, almuerzo tipo fiambre, tarjeta de asistencia medica,caballo y guia.',
    image: '/TOURS/TRAVESIA%20FILO%20DE%20ORO%20-%20CABALGATA.png',
    priceLabel: 'Duración 3 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Filo de Oro Cabalgata'),
    booking: '',
    tags: ['Cabalgata', 'Cascada', 'Tunel', 'Caballos']
  },
  {
    id: 'jardin-finca-cafetera-transporte',
    name: 'Travesía Finca Cafetera | Transporte',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Charla sobre el café, recorrido finca cafetera, recoleccion, despulpado, secado del café, Toston, hidratacion, degustacion del café, almuerzo tipo fiambre, tarjeta de asistencia medica, transporte ida y regreso y guia.',
    image: '/TOURS/TRAVESIA%20FINCA%20CAFETERA%20-%20TRANSPORTE.png',
    priceLabel: 'Duración 3 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Finca Cafetera Transporte'),
    booking: '',
    tags: ['Café', 'Finca', 'Degustación', 'Transporte']
  },
  {
    id: 'jardin-finca-cafetera-cabalgata',
    name: 'Travesía Finca Cafetera | Cabalgata',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Charla sobre el café, recorrido finca cafetera, recoleccion, despulpado, secado del café, Toston, hidratacion, degustacion del café, almuerzo tipo fiambre, tarjeta de asistencia medica,caballo y guia.',
    image: '/TOURS/TRAVESIA%20FINCA%20CAFETERA%20-%20CABALGATA.png',
    priceLabel: 'Duración 3 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Finca Cafetera Cabalgata'),
    booking: '',
    tags: ['Café', 'Finca', 'Cabalgata', 'Degustación']
  },
  {
    id: 'jardin-salto-angel',
    name: 'Travesía Salto del Ángel',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Transporte ida y regreso, almuerzo tipo fiambre, visita cascada Salto del Ángel, camino del diablo, santuario de los guacharos, hidratacion, tarjeta de asistencia medica y guia.',
    image: '/TOURS/TRAVESIA%20SALTO%20DEL%20ANGEL.png',
    priceLabel: 'Duración 6-7 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Salto del Ángel'),
    booking: '',
    tags: ['Cascada', 'Aventura', 'Santuario', 'Transporte']
  },
  {
    id: 'jardin-cristo-rey-caminata',
    name: 'Travesía Cristo Rey | Caminata',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Visita cascada la escalera, mirador cristo rey, truchera, trapiche, almuerzo tipo fiambre, hidratacion, tarjeta de asistencia medica y guia.',
    image: '/TOURS/TRAVESIA%20CRISTO%20REY%20-%20CAMINATA.png',
    priceLabel: 'Duración 4 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Cristo Rey Caminata'),
    booking: '',
    tags: ['Caminata', 'Mirador', 'Cascada', 'Truchera']
  },
  {
    id: 'jardin-cristo-rey-transporte',
    name: 'Travesía Cristo Rey | Transporte',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Transporte ida y regreso, visita cascada la escalera, mirador cristo rey, truchera, trapiche, almuerzo tipo fiambre, hidratacion, tarjeta de asistencia medica y guia.',
    image: '/TOURS/TRAVESIA%20CRISTO%20REY%20-%20TRANSPORTE.png',
    priceLabel: 'Duración 3 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Cristo Rey Transporte'),
    booking: '',
    tags: ['Transporte', 'Mirador', 'Cascada', 'Cristo Rey']
  },
  {
    id: 'jardin-cristo-rey-cabalgata',
    name: 'Travesía Cristo Rey | Cabalgata',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Visita cascada la escalera, mirador cristo rey, truchera, trapiche, almuerzo tipo fiambre, hidratacion, tarjeta de asistencia medica, caballo y guia.',
    image: '/TOURS/TRAVESIA%20CRISTO%20REY%20-%20CABALGATA.png',
    priceLabel: 'Duración 4 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Cristo Rey Cabalgata'),
    booking: '',
    tags: ['Cabalgata', 'Mirador', 'Cascada', 'Caballos']
  },
  {
    id: 'jardin-travesia-amor',
    name: 'Travesía del Amor',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Decoración aniversario o cumpleaños, bombas, velas, chocolates y cena. Puedes optar por: vino, ron 8 años o whisky.',
    image: '/TOURS/TRAVESIA%20DEL%20AMOR.png',
    priceLabel: 'Opera por: vino, ron 8 años o whisky',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía del Amor'),
    booking: '',
    tags: ['Romántico', 'Aniversario', 'Cena', 'Decoración']
  },
  {
    id: 'jardin-resguardo-indigena',
    name: 'Travesía Resguardo Indígena',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Transporte ida y regreso, guía logistico y operador, entrada, visita a la ramada (trapiche) tiendas de artesanias, visita resguardo karmata rua,almuerzo tipo fiambre, tarjeta de asistencia medica.',
    image: '/TOURS/TRAVESIA%20RESGUARDO%20INDIGENA.png',
    priceLabel: 'Duración 3-4 horas',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Resguardo Indígena'),
    booking: '',
    tags: ['Cultural', 'Indígena', 'Artesanías', 'Transporte']
  },
  {
    id: 'jardin-gallito-roca',
    name: 'Travesía Gallito de Roca',
    location: 'Jardín, Antioquia',
    category: 'Jardín',
    description:
      'Guía, entradas, tarjeta de asistencia medica, hidratacion. Hora de avistamiento 5:30 a.m y 4:30 p.m',
    image: '/TOURS/TRAVESIA%20GALLITO%20DE%20ROCA.png',
    priceLabel: 'Duración 1 hora',
    whatsapp: buildWhatsapp('Hola, quiero reservar Travesía Gallito de Roca'),
    booking: '',
    tags: ['Avistamiento', 'Aves', 'Naturaleza', 'Madrugada']
  },
  {
    id: 'cafe-jardin',
    name: 'Tour de cafe en Jardin',
    location: 'Jardin, Antioquia',
    category: 'Jardín',
    description:
      'Visita finca cafetera, proceso completo del grano a la taza y cata guiada.',
    image: '/Jardin3.png',
    priceLabel: 'Desde $95.000 / persona',
    whatsapp: buildWhatsapp('Hola, quiero reservar el tour de cafe en Jardin'),
    booking: '',
    tags: ['Cata', 'Paisaje', 'Guia']
  }
];

export const suggestedDestinations = [
  'Cartagena',
  'Medellin',
  'Bogota',
  'Islas del Rosario',
  'Jardin',
  'Eje Cafetero'
];
