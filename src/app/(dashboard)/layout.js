'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Cierra el dropdown si haces clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar con estilo minimalista */}
        <aside className="sidebar w-64 h-screen shadow-lg bg-[#0f0f0f] text-white">
          <div className="flex items-center px-4 py-6">
            <div className="text-3xl">🌮</div>
            <div className="ml-3">
              <h1 className="text-xl font-bold">Taquería</h1>
              <p className="text-xs opacity-75">Sistema de Gestión</p>
            </div>
          </div>

          <nav className="mt-8 px-3 space-y-2">
            <Link href="/" className="sidebar-item active">
              <div className="sidebar-icon">📊</div>
              <span>Dashboard</span>
            </Link>
            <Link href="/ventas" className="sidebar-item">
              <div className="sidebar-icon">💰</div>
              <span>Ventas</span>
            </Link>

            {/* Mostrar elementos según el rol */}
            {user && (user.rol === 'admin' || user.rol === 'encargado') && (
              <>
                <Link href="/platillos" className="sidebar-item">
                  <div className="sidebar-icon">🌮</div>
                  <span>Platillos</span>
                </Link>
                <Link href="/productos" className="sidebar-item">
                  <div className="sidebar-icon">📦</div>
                  <span>Productos</span>
                </Link>
                <Link href="/compras" className="sidebar-item">
                  <div className="sidebar-icon">🛒</div>
                  <span>Compras</span>
                </Link>
                <Link href="/proveedores" className="sidebar-item">
                  <div className="sidebar-icon">🚚</div>
                  <span>Proveedores</span>
                </Link>
                <Link href="/empleados" className="sidebar-item">
                  <div className="sidebar-icon">👨‍🍳</div>
                  <span>Empleados</span>
                </Link>
              </>
            )}

            {user && user.rol === 'admin' && (
              <>
                <Link href="/sueldos" className="sidebar-item">
                  <div className="sidebar-icon">💸</div>
                  <span>Sueldos</span>
                </Link>
                <Link href="/gastos" className="sidebar-item">
                  <div className="sidebar-icon">📝</div>
                  <span>Gastos</span>
                </Link>
              </>
            )}
          </nav>

          <div className="absolute bottom-0 w-full p-4 bg-black/60">
            <div className="flex items-center">
              <div className="text-lg">⚙️</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Versión 1.0</p>
                <p className="text-xs text-[#a0a0a0]">© 2025 Taquería</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <div className="flex flex-col flex-1 overflow-y-auto bg-[#1a1a1a]">
          <header className="navbar sticky top-0 z-30 p-4 flex items-center justify-between bg-[#121212] border-b border-[#2c2c2c]">
            <h1 className="text-xl font-semibold text-white">
              <span className="gradient-text">Sistema de Gestión Taquería</span>
            </h1>

            {/* Usuario dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
                  {user?.nombre?.charAt(0) || 'A'}
                </div>
                <span className="hidden md:block text-white">{user?.nombre || 'Usuario'}</span>
              </button>

              {/* Animación con framer-motion */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    key="dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-[#111111] border border-[#333333] rounded-lg shadow-lg p-2 z-50"
                  >
                    <div className="p-3 border-b border-[#333333]">
                      <p className="text-white font-medium">{user?.nombre}</p>
                      <p className="text-[#a0a0a0] text-sm">{user?.email}</p>
                      <p className="text-white text-xs mt-1 bg-[#222222] px-2 py-1 rounded inline-block">
                        {user?.rol?.charAt(0).toUpperCase() + user?.rol?.slice(1)}
                      </p>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full text-left p-2 text-[#f87171] hover:bg-[#222222] rounded-md mt-2 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
