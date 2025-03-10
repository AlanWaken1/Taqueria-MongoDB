import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sistema de Gestión - Taquería',
  description: 'Sistema de gestión para taquería',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar con degradado azul */}
          <aside className="sidebar w-64 h-screen shadow-lg">
            <div className="flex items-center px-4 py-6">
              <div className="text-3xl">🌮</div>
              <div className="ml-3">
                <h1 className="text-xl font-bold">Taquería</h1>
                <p className="text-xs opacity-75">Sistema de Gestión</p>
              </div>
            </div>
            
            <nav className="mt-8 px-3">
              <div className="space-y-2">
                <a href="/" className="sidebar-item active">
                  <div className="sidebar-icon">📊</div>
                  <span>Dashboard</span>
                </a>
                
                <a href="/ventas" className="sidebar-item">
                  <div className="sidebar-icon">💰</div>
                  <span>Ventas</span>
                </a>
                
                <a href="/platillos" className="sidebar-item">
                  <div className="sidebar-icon">🌮</div>
                  <span>Platillos</span>
                </a>
                
                <a href="/productos" className="sidebar-item">
                  <div className="sidebar-icon">📦</div>
                  <span>Productos</span>
                </a>
                
                <a href="/compras" className="sidebar-item">
                  <div className="sidebar-icon">🛒</div>
                  <span>Compras</span>
                </a>
                
                <a href="/proveedores" className="sidebar-item">
                  <div className="sidebar-icon">🚚</div>
                  <span>Proveedores</span>
                </a>
                
                <a href="/empleados" className="sidebar-item">
                  <div className="sidebar-icon">👨‍🍳</div>
                  <span>Empleados</span>
                </a>
                
                <a href="/sueldos" className="sidebar-item">
                  <div className="sidebar-icon">💸</div>
                  <span>Sueldos</span>
                </a>
                
                <a href="/gastos" className="sidebar-item">
                  <div className="sidebar-icon">📝</div>
                  <span>Gastos</span>
                </a>
              </div>
            </nav>
            
            <div className="absolute bottom-0 w-full p-4 bg-[#0f172a]/60">
              <div className="flex items-center">
                <div className="text-lg">⚙️</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Versión 1.0</p>
                  <p className="text-xs text-[#94a3b8]">© 2025 Taquería</p>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            <header className="navbar sticky top-0 z-30 p-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-white">
                <span className="gradient-text">Sistema de Gestión Taquería</span>
              </h1>
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full bg-[#334155] hover:bg-[#475569] text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </header>
            
            <main className="flex-1 p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}