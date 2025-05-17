const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// 🔗 Importar rutas
const usuariosRoutes = require('./routes/usuarios');

app.use(cors());
app.use(express.json());

// 📌 Usar la ruta de usuarios
app.use('/api/usuarios', usuariosRoutes);

// 🚀 Ruta principal
app.get('/', (req, res) => {
    res.send('Bienvenido a la API apisDarxdar!');
});

// ✅ Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
