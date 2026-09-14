require('dotenv').config();
const express = require('express');
const cors = require('cors');
const propertiesRoutes = require('./routes/properties');

const app = express();
app.use(express.json());

// Configura CORS para todos tus frontends
app.use(cors({
  origin: [
    'http://localhost:5174',
    'http://localhost:5173'
    // agrega mas si tienes mas apps
  ]
}));

// Carpeta para archivos estaticos (imagenes)
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/properties', propertiesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
