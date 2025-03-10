// src/lib/db.js
import mysql from 'mysql2/promise';

// Función para crear conexión a la base de datos
export async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taqueriasql',
  });
  return connection;
}

// Función para ejecutar transacciones
export async function executeTransaction(callback) {
  const connection = await getConnection();
  try {
    // Usamos query en lugar de execute para los comandos de transacción
    await connection.query('START TRANSACTION');
    const result = await callback(connection);
    await connection.query('COMMIT');
    return { success: true, data: result };
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Error en la transacción:', error);
    return { success: false, error: error.message };
  } finally {
    await connection.end();
  }
}

// Función para cifrar datos usando bcrypt
export async function hashPassword(password) {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Función para verificar contraseñas
export async function verifyPassword(password, hashedPassword) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hashedPassword);
}