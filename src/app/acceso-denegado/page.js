// app/acceso-denegado/page.js
'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AccesoDenegadoPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="card w-full max-w-lg text-center animate-glow">
        <div className="card-header border-b border-[#333333]">
          <h1 className="text-2xl font-bold text-[#f87171]">Acceso Denegado</h1>
        </div>
        
        <div className="card-body">
          <div className="text-6xl mb-6">🚫</div>
          <p className="text-white mb-6">
            Lo sentimos, {user?.nombre}. No tienes permisos para acceder a esta página.
          </p>
          <p className="text-[#a0a0a0] mb-8">
            Tu rol actual es: <span className="text-white font-semibold">{user?.rol}</span>
          </p>
          <Link href="/" className="btn-primary inline-block px-6 py-3 rounded-lg">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}