'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 lg:px-6 flex items-center justify-between">
        {/* Left - Logo & Title (visible on mobile) */}
        <div className="flex items-center lg:hidden">
          <Link href="/" className="flex items-center">
            <span className="text-2xl">🌮</span>
            <span className="ml-2 font-semibold text-gray-900">Taquería</span>
          </Link>
        </div>
        
        {/* Center - Search Bar */}
        <div className="hidden md:flex items-center flex-1 mx-4 lg:mx-8">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
            <input 
              type="text" 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2" 
              placeholder="Buscar..."
            />
          </div>
        </div>
        
        {/* Right - Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <span className="sr-only">Ver notificaciones</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-0.5 -right-0.5">3</div>
            </button>
            {/* Dropdown menu */}
            {notificationsOpen && (
              <div className="absolute right-0 z-10 mt-2 w-80 bg-white divide-y divide-gray-100 rounded-lg shadow border border-gray-200">
                <div className="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 rounded-t-lg">
                  Notificaciones
                </div>
                <div className="divide-y divide-gray-100">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-100">
                    <div className="flex-shrink-0">
                      <span className="rounded-lg p-2 bg-green-100 text-green-800">💰</span>
                    </div>
                    <div className="w-full pl-3">
                      <div className="text-gray-500 text-sm mb-1.5">Nueva venta registrada <span className="font-semibold text-gray-900">$450.00</span></div>
                      <div className="text-xs text-gray-500">Hace 10 minutos</div>
                    </div>
                  </a>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-100">
                    <div className="flex-shrink-0">
                      <span className="rounded-lg p-2 bg-orange-100 text-orange-800">📦</span>
                    </div>
                    <div className="w-full pl-3">
                      <div className="text-gray-500 text-sm mb-1.5"><span className="font-semibold text-gray-900">Producto bajo en stock:</span> Tortillas</div>
                      <div className="text-xs text-gray-500">Hace 1 hora</div>
                    </div>
                  </a>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-100">
                    <div className="flex-shrink-0">
                      <span className="rounded-lg p-2 bg-red-100 text-red-800">⚠️</span>
                    </div>
                    <div className="w-full pl-3">
                      <div className="text-gray-500 text-sm mb-1.5"><span className="font-semibold text-gray-900">Alerta:</span> Varios gastos no categorizados</div>
                      <div className="text-xs text-gray-500">Hace 3 horas</div>
                    </div>
                  </a>
                </div>
                <a href="#" className="block py-2 text-sm font-medium text-center text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-b-lg">
                  Ver todas las notificaciones
                </a>
              </div>
            )}
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2 text-sm font-medium text-gray-900 rounded-lg hover:text-primary-600 md:mr-0 focus:ring-4 focus:ring-gray-100"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <span className="sr-only">Abrir menú de usuario</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">Admin</div>
                <div className="text-xs text-gray-500 truncate">admin@taqueria.com</div>
              </div>
              <svg className="w-4 h-4 mx-1.5 hidden md:block" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
            {/* Dropdown menu */}
            {profileOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 bg-white divide-y divide-gray-100 rounded-lg shadow border border-gray-200">
                <div className="px-4 py-3 text-sm text-gray-900">
                  <div className="font-medium">Administrador</div>
                  <div className="truncate">admin@taqueria.com</div>
                </div>
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">Mi perfil</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">Configuración</a>
                  </li>
                </ul>
                <div className="py-2">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cerrar sesión</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}