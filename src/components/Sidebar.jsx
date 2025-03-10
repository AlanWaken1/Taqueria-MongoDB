'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Ventas', href: '/ventas', icon: '💰' },
    { name: 'Platillos', href: '/platillos', icon: '🌮' },
    { name: 'Productos', href: '/productos', icon: '📦' },
    { name: 'Compras', href: '/compras', icon: '🛒' },
    { name: 'Proveedores', href: '/proveedores', icon: '🚚' },
    { name: 'Empleados', href: '/empleados', icon: '👨‍🍳' },
    { name: 'Sueldos', href: '/sueldos', icon: '💸' },
    { name: 'Gastos', href: '/gastos', icon: '📝' },
  ];
  
  return (
    <aside
      className={`${expanded ? 'w-64' : 'w-20'} 
                 bg-gradient-to-b from-orange-600 to-red-600 text-white transition-all duration-300 ease-in-out relative
                 h-screen shadow-xl flex-shrink-0 overflow-y-auto`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-20 bg-white text-orange-600 rounded-full p-1 shadow-md hover:bg-orange-50 focus:outline-none"
        aria-label={expanded ? 'Contraer sidebar' : 'Expandir sidebar'}
      >
        {expanded ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      {/* Logo & Brand */}
      <div className="flex items-center px-4 py-5">
        <div className="text-3xl">🌮</div>
        {expanded && (
          <div className="ml-3">
            <h1 className="text-xl font-bold">Taquería</h1>
            <p className="text-xs text-orange-200">Sistema de Gestión</p>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  ${isActive
                    ? 'bg-orange-700 text-white'
                    : 'text-orange-100 hover:bg-orange-700 hover:text-white'}
                  group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200
                `}
              >
                <div className={`
                  ${isActive ? 'bg-orange-800' : 'bg-orange-600 group-hover:bg-orange-800'} 
                  p-2 rounded-lg mr-3 flex-shrink-0 transition-all duration-200
                `}>
                  <span className="text-lg">{item.icon}</span>
                </div>
                {expanded && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Footer */}
      {expanded && (
        <div className="absolute bottom-0 w-full p-4 bg-orange-700">
          <div className="flex items-center">
            <div className="text-lg">🔧</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Soporte Técnico</p>
              <p className="text-xs text-orange-200">soporte@taqueria.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}