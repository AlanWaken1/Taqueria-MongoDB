'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Crear contexto
const AuthContext = createContext();

// Proveedor de autenticación
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Verificar si hay un usuario al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Verificar token con el endpoint /api/auth/me
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Sesión expirada');
        }
        
        const data = await response.json();
        setUser(data.usuario);
      } catch (error) {
        // Si hay error, limpiar el localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Función para iniciar sesión - ASEGÚRATE DE QUE ESTA FUNCIÓN EXISTA
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      
      // Comprobar que el token existe en la respuesta
      if (!data.token) {
        console.error('La respuesta del servidor no incluye un token');
        throw new Error('Token no proporcionado por el servidor');
      }
      
      // Clear localStorage first to avoid any corrupted state
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Then set new values
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      
      console.log('Token almacenado correctamente:', data.token.substring(0, 15) + '...');
      
      // Actualizar estado
      setUser(data.usuario);
      
      return { success: true };
    } catch (error) {
      console.error('Error completo en login:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };
  
  // Función para verificar si un usuario tiene cierto rol
  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.rol);
  };
  
  // Función para realizar solicitudes autenticadas
  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    
    // Add debugging
    console.log('Token usado en fetchWithAuth:', token ? token.substring(0, 15) + '...' : 'no token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      // Ensure 'Bearer ' prefix with a space after
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header:', headers['Authorization'].substring(0, 20) + '...');
    }
    
    const config = {
      ...options,
      headers
    };
    
    const response = await fetch(url, config);
    
    // If getting a 401, log the response for debugging
    if (response.status === 401) {
      console.error('401 Unauthorized - Response:', await response.text());
    }
    
    return response;
  };
  
  // Valor del contexto
  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user,
    fetchWithAuth
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};