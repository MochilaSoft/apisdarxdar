const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
  connectionLimit: 10, // Puedes ajustar este número según tu carga
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verificar si se conecta bien
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err); // <-- Cambiado
  } else {
    console.log('✅ Conectado al pool de base de datos');
    connection.release();
  }
});

module.exports = pool;
