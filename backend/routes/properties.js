const express = require('express');

// Router dedicado a propiedades
const router = express.Router();

// Datos de ejemplo para empezar a probar la pagina
const properties = [
  {
    id: 1,
    name: 'Apartamento moderno en Medellin',
    location: 'Medellin, Antioquia',
    type: 'Apartamento',
    prices: [{ price: 250000 }],
    rating: 4.8,
    amenities: ['WiFi gratis', 'Piscina', 'Parking privado'],
    imageUrls: ['/uploads/1749343146640-1.jpg', '/uploads/1749343146647-2.jpg']
  },
  {
    id: 2,
    name: 'Cabana frente al mar',
    location: 'Santa Marta, Magdalena',
    type: 'Cabana',
    prices: [{ price: 180000 }],
    rating: 4.7,
    amenities: ['Vista al mar', 'Aire acondicionado', 'WiFi gratis'],
    imageUrls: ['/uploads/1749343365553-1.jpg', '/uploads/1749343365554-2.jpg']
  },
  {
    id: 3,
    name: 'Hotel boutique en Cartagena',
    location: 'Cartagena, Bolivar',
    type: 'Hotel',
    prices: [{ price: 320000 }],
    rating: 4.9,
    amenities: ['Piscina', 'WiFi gratis', 'Aire acondicionado'],
    imageUrls: ['/uploads/1749342211843-1.jpg', '/uploads/1749342232103-1.jpg']
  }
];

// Lista todas las propiedades
router.get('/', (req, res) => {
  res.json(properties);
});

// Detalle por id
router.get('/:id', (req, res) => {
  const property = properties.find(p => String(p.id) === req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Propiedad no encontrada' });
  }
  res.json(property);
});

module.exports = router;
