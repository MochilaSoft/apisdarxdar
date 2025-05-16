const mysql = require('mysql2');
require('dotenv').config();

// Crear el pool de conexión con promesas
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).promise(); // Permite usar async/await

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos');
    connection.release(); // Liberar la conexión
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1); // Detener la ejecución si hay un fallo crítico
  }
}

testConnection();

module.exports = pool;
