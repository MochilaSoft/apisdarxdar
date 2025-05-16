const express = require('express');
const cors = require('cors'); // ✅ Importar CORS

const bodyParser = require('body-parser');
const db = require('./db');
const multer = require('multer');
const path = require('path');



// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const pedidosRoutes= require('./routes/pedidos');
const categoriasRoutes= require('./routes/categorias');
const carritosRoutes= require('./routes/carritos');
const carProductosRoutes= require('./routes/carProductos');
const app = express()
const PORT = 3000;
app.use(cors());

// Middleware
app.use(bodyParser.json());
// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: './uploads/', // Carpeta donde se guardará la imagen
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static('uploads')); // Servir archivos estáticos
// Middleware
app.use(bodyParser.json());

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
  console.log(`Servidor corriendo en https://apisdarxdar-production.up.railway.app`);
});
