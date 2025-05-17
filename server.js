const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// 🔗 Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const carritosRoutes = require('./routes/carritos');
const solicitudesRoutes = require('./routes/carProductos');
const pedidosRoutes = require('./routes/pedidos');
app.use(cors());
app.use(express.json());

// 📌 Usar la ruta de usuarios
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/carritos', carritosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/pedidos', pedidosRoutes);

// 🚀 Ruta principal
app.get('/', (req, res) => {
    res.send('Bienvenido a la API apisDarxdar!');
});

// ✅ Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
