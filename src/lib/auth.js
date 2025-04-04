// src/lib/auth.js
import jwt from 'jsonwebtoken';

// El secreto para firmar tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_aqui';

// Generar token JWT
export function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      rol: user.rol 
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// Verificar token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware para proteger rutas
export async function protectRoute(request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'No autorizado'
    };
  }
  
  const token = authHeader.split(' ')[1];
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
}

// Verificar roles (para rutas protegidas por rol)
export function checkRole(user, allowedRoles) {
  if (!user || !allowedRoles.includes(user.rol)) {
    return false;
  }
  return true;
}