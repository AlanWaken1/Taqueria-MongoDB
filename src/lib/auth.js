// src/lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_aqui';

// Generar token JWT (ya está correcto)
export function generateToken(user) {
  // Asegurarnos de que estamos usando el mismo secreto para firmar
  const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_aqui';
  
  try {
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        rol: user.rol 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Log para depuración (truncar el token por seguridad)
    console.log('Token generado:', token.substring(0, 15) + '...');
    
    return token;
  } catch (error) {
    console.error('Error al generar token:', error);
    throw error;
  }
}

// Verificar token (mejorado)
export function verifyToken(token) {
  try {
    // Añadir logs para debug
    console.log('Intentando verificar token');
    
    // Verificar que el token tiene la estructura básica de un JWT (xxx.yyy.zzz)
    if (!token || !token.includes('.') || token.split('.').length !== 3) {
      console.error('Token con formato incorrecto:', token);
      return null;
    }
    
    // Asegurarnos de que estamos usando el mismo secreto para verificar
    const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_aqui';
    
    const decoded = jwt.verify(token, JWT_SECRET);
    // Log del token decodificado (sin mostrar datos sensibles)
    console.log('Token verificado correctamente, usuario:', decoded.id);
    
    return decoded;
  } catch (error) {
    console.error('Error al verificar token JWT:', error.message);
    return null;
  }
}

// Middleware para proteger rutas (actualizado)
export async function protectRoute(request) {
  const authHeader = request.headers.get('Authorization');
  
  // Debug: Ver el header real que se está recibiendo
  console.log('Authorization header recibido:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'No autorizado - Token no proporcionado o formato incorrecto'
    };
  }
  
  // Extraer el token (todo lo que viene después de "Bearer ")
  const token = authHeader.split(' ')[1];
  
  // Verificar que el token realmente existe
  if (!token) {
    console.error('Token extraído está vacío');
    return {
      success: false,
      error: 'Token vacío'
    };
  }
  
  try {
    // Intentar decodificar el token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        success: false,
        error: 'Token inválido o expirado'
      };
    }
    
    return {
      success: true,
      user: decoded
    };
  } catch (error) {
    // Capturar cualquier error en la verificación del token
    console.error('Error al verificar token:', error);
    return {
      success: false,
      error: `Error en verificación de token: ${error.message}`
    };
  }
}

// Verificar roles (versión mejorada)
export function checkRole(user, allowedRoles) {
  if (!user?.rol || !Array.isArray(allowedRoles)) return false;
  return allowedRoles.includes(user.rol);
}