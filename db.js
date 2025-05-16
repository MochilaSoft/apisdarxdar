const mysql = require('mysql2');

const pool = mysql.createPool({
    uri: process.env.MYSQL_PUBLIC_URL,
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
}).promise();

// Probar la conexión
pool.getConnection()
    .then((connection) => {
        console.log("✅ Conexión exitosa a MySQL");
        connection.release(); // Liberar la conexión
    })
    .catch((error) => {
        console.error("❌ Error al conectar a MySQL:", error.message);
    });

module.exports = pool;
