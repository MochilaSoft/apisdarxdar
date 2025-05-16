const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const categoriasRoutes = require('./routes/categorias');
const carritosRoutes = require('./routes/carritos');
const carProductosRoutes = require('./routes/carProductos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // En lugar de bodyParser.json()

// Configuración de almacenamiento para subir archivos
const storage = multer.diskStorage({
  destination: './uploads/', // Carpeta donde se guardará la imagen
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión de rutas
app.use('/usuarios', usuariosRoutes);
app.use('/productos', productosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/carrito', carritosRoutes);
app.use('/carprod', carProductosRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.send('Bienvenido a la API apisDarXDar');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
  
});
