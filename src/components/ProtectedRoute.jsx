'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir al login
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    // Si hay roles permitidos y el usuario no tiene ninguno de esos roles
    if (!loading && isAuthenticated && allowedRoles.length > 0) {
      const hasPermission = hasRole(allowedRoles);
      if (!hasPermission) {
        // Redirigir a una página de acceso denegado
        router.push('/acceso-denegado');
      }
    }
  }, [loading, isAuthenticated, router, allowedRoles, hasRole]);
  
  // Mostrar pantalla de carga mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Verificando autenticación...</div>
        </div>
      </div>
    );
  }
  
  // Si está autenticado y tiene los roles necesarios
  if (isAuthenticated && (allowedRoles.length === 0 || hasRole(allowedRoles))) {
    return children;
  }
  
  return null;
}