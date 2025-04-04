// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Por favor, define la variable de entorno MONGODB_URI en .env.local'
  );
}

/**
 * Global es usado aquí para mantener una conexión en cachée
 * durante hot reloads en desarrollo.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    transactionsSupported: null 
  };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });

    
  }

  
  
  cached.conn = await cached.promise;
  
  // Verificar si las transacciones están disponibles (si aún no lo hemos hecho)
  if (cached.transactionsSupported === null) {
    try {
      const session = await mongoose.startSession();
      await session.endSession();
      cached.transactionsSupported = true;
      console.log("MongoDB: Transacciones soportadas");
    } catch (error) {
      cached.transactionsSupported = false;
      console.log("MongoDB: Transacciones NO soportadas - usando MongoDB standalone");
    }
  }
  
  return cached.conn;
}

/**
 * Verifica si las transacciones están disponibles en esta instancia de MongoDB
 */
export async function areTransactionsSupported() {
  await connectToDatabase();
  return cached.transactionsSupported;
}

/**
 * Ejecuta una función con soporte de transacciones si está disponible
 */
export async function executeTransaction(callback) {
  try {
    await connectToDatabase();
    
    // Verificar soporte de transacciones si aún no lo hemos hecho
    if (cached.transactionsSupported === null) {
      try {
        const session = await mongoose.startSession();
        await session.endSession();
        cached.transactionsSupported = true;
      } catch (error) {
        cached.transactionsSupported = false;
      }
    }
    
    let result;
    
    // Si las transacciones son soportadas, usarlas
    if (cached.transactionsSupported) {
      try {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
          // Ejecutar callback con la sesión
          result = await callback(session);
          
          // Confirmar la transacción
          await session.commitTransaction();
          session.endSession();
        } catch (error) {
          // Revertir en caso de error
          await session.abortTransaction();
          session.endSession();
          throw error;
        }
      } catch (transactionError) {
        console.log("Error al usar transacción, ejecutando sin ella:", transactionError.message);
        // Si hay error al usar transacciones, ejecutar sin ellas
        result = await callback();
      }
    } else {
      // Ejecutar directamente sin transacciones
      result = await callback();
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error en la operación de base de datos:', error);
    return { success: false, error: error.message };
  }
}