// Guarda este archivo en la raíz del proyecto (no dentro de src)
// Ejecuta con: node test-connection.js

const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Intentando conectar a MySQL...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'AlanWaken1)', // Tu contraseña
      database: 'taqueriasql'
    });
    
    console.log('¡Conexión exitosa!');
    
    // Probar una consulta simple
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tablas en la base de datos:');
    console.log(rows);
    
    await connection.end();
  } catch (error) {
    console.error('Error al conectar a MySQL:');
    console.error(error);
  }
}

testConnection();