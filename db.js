const mysql = require('mysql');


const pool = mysql.createPool({
  host: process.env.MYSQLHOST,  // <-- Aquí usa MYSQLHOST de Railway
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306
}).promise();

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
