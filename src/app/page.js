'use client';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    productos: 0,
    platillos: 0,
    ventas: { count: 0, total: 0 },
    compras: { count: 0, total: 0 },
    empleados: 0,
    gastos: { count: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Productos
        const productosRes = await fetch('/api/productos');
        if (!productosRes.ok) throw new Error('Error al cargar productos');
        const productosData = await productosRes.json();
        
        // Platillos
        const platillosRes = await fetch('/api/platillos');
        if (!platillosRes.ok) throw new Error('Error al cargar platillos');
        const platillosData = await platillosRes.json();
        
        // Ventas
        const ventasRes = await fetch('/api/ventas');
        if (!ventasRes.ok) throw new Error('Error al cargar ventas');
        const ventasData = await ventasRes.json();
        const ventasTotal = ventasData.reduce((sum, venta) => sum + parseFloat(venta.total), 0);
        
        // Compras
        const comprasRes = await fetch('/api/compras');
        if (!comprasRes.ok) throw new Error('Error al cargar compras');
        const comprasData = await comprasRes.json();
        const comprasTotal = comprasData.reduce((sum, compra) => sum + parseFloat(compra.total), 0);
        
        // Empleados
        const empleadosRes = await fetch('/api/empleados');
        if (!empleadosRes.ok) throw new Error('Error al cargar empleados');
        const empleadosData = await empleadosRes.json();
        
        // Gastos
        const gastosRes = await fetch('/api/gastos');
        if (!gastosRes.ok) throw new Error('Error al cargar gastos');
        const gastosData = await gastosRes.json();
        const gastosTotal = gastosData.reduce((sum, gasto) => sum + parseFloat(gasto.total), 0);
        
        setStats({
          productos: productosData.length,
          platillos: platillosData.length,
          ventas: { count: ventasData.length, total: ventasTotal },
          compras: { count: comprasData.length, total: comprasTotal },
          empleados: empleadosData.length,
          gastos: { count: gastosData.length, total: gastosTotal },
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Cargando estadísticas...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-[#172231] rounded-lg text-center border border-[#38bdf8]">
        <h2 className="text-lg font-semibold text-[#60a5fa] mb-2">Error al cargar datos</h2>
        <p className="text-[#94a3b8]">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#38bdf8] text-white rounded-lg hover:bg-[#0ea5e9]"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }
  
  // Calcular balance
  const balance = stats.ventas.total - (stats.compras.total + stats.gastos.total);
  
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-[#94a3b8]">Resumen del sistema de gestión</p>
          </div>
          <div>
            <button className="btn-primary px-4 py-2 rounded-lg flex items-center">
              <span className="mr-2">📊</span> Generar Reporte
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats-card animate-glow shine">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#94a3b8]">Productos en Inventario</div>
              <div className="text-2xl font-bold text-white mt-1">{stats.productos}</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#334155] text-[#38bdf8] flex items-center justify-center text-xl">
              📦
            </div>
          </div>
          <a href="/productos" className="mt-4 text-[#38bdf8] text-sm hover:text-[#0ea5e9] flex items-center">
            Ver productos <span className="ml-1">→</span>
          </a>
        </div>
        
        <div className="stats-card animate-glow shine">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#94a3b8]">Platillos en Menú</div>
              <div className="text-2xl font-bold text-white mt-1">{stats.platillos}</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#334155] text-[#38bdf8] flex items-center justify-center text-xl">
              🌮
            </div>
          </div>
          <a href="/platillos" className="mt-4 text-[#38bdf8] text-sm hover:text-[#0ea5e9] flex items-center">
            Ver platillos <span className="ml-1">→</span>
          </a>
        </div>
        
        <div className="stats-card animate-glow shine">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#94a3b8]">Ventas</div>
              <div className="text-2xl font-bold text-white mt-1">${stats.ventas.total.toFixed(2)}</div>
              <div className="text-xs text-[#94a3b8] mt-1">{stats.ventas.count} transacciones</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#334155] text-[#38bdf8] flex items-center justify-center text-xl">
              💰
            </div>
          </div>
          <a href="/ventas" className="mt-4 text-[#38bdf8] text-sm hover:text-[#0ea5e9] flex items-center">
            Ver ventas <span className="ml-1">→</span>
          </a>
        </div>
        
        <div className="stats-card animate-glow shine">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#94a3b8]">Compras</div>
              <div className="text-2xl font-bold text-white mt-1">${stats.compras.total.toFixed(2)}</div>
              <div className="text-xs text-[#94a3b8] mt-1">{stats.compras.count} transacciones</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#334155] text-[#38bdf8] flex items-center justify-center text-xl">
              🛒
            </div>
          </div>
          <a href="/compras" className="mt-4 text-[#38bdf8] text-sm hover:text-[#0ea5e9] flex items-center">
            Ver compras <span className="ml-1">→</span>
          </a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance General */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-white">Balance General</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#0f2417] to-[#0f3a1d] p-5 rounded-lg border border-[#0f5132]">
                  <h3 className="text-sm font-medium text-[#4ade80] mb-2">Ingresos</h3>
                  <p className="text-2xl font-bold text-[#4ade80]">${stats.ventas.total.toFixed(2)}</p>
                  <p className="text-xs text-[#a3e6b6] mt-1">{stats.ventas.count} ventas</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#2d1718] to-[#3d191a] p-5 rounded-lg border border-[#510f0f]">
                  <h3 className="text-sm font-medium text-[#f87171] mb-2">Egresos</h3>
                  <p className="text-2xl font-bold text-[#f87171]">${(stats.compras.total + stats.gastos.total).toFixed(2)}</p>
                  <p className="text-xs text-[#e6a3a3] mt-1">{stats.compras.count + stats.gastos.count} transacciones</p>
                </div>
                
                <div className={`p-5 rounded-lg border ${balance >= 0 ? 'bg-gradient-to-br from-[#1a202c] to-[#2d3748] border-[#4299e1]' : 'bg-gradient-to-br from-[#2c2817] to-[#483d19] border-[#d97706]'}`}>
                  <h3 className={`text-sm font-medium ${balance >= 0 ? 'text-[#60a5fa]' : 'text-[#fbbf24]'} mb-2`}>Balance</h3>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[#60a5fa]' : 'text-[#fbbf24]'}`}>${balance.toFixed(2)}</p>
                  <p className={`text-xs ${balance >= 0 ? 'text-[#a3c2e6]' : 'text-[#e6d4a3]'} mt-1`}>
                    {balance >= 0 ? 'Ganancia neta' : 'Déficit'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-5 rounded-lg bg-[#1e293b] border border-[#334155]">
                <div className="flex items-start">
                  <div className="text-xl mr-3">📈</div>
                  <div>
                    <h3 className="font-medium text-white">Análisis Rápido</h3>
                    <p className="text-sm text-[#94a3b8] mt-1">
                      {balance >= 0 
                        ? 'Tu negocio está generando ganancias. Considera reinvertir para crecer.' 
                        : 'Tus gastos superan tus ingresos. Revisa tus costos y estrategias de ventas.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actividad Reciente */}
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-white">Actividad Reciente</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#4ade80]">💰</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Nueva Venta</h4>
                    <p className="text-sm text-[#94a3b8]">$245.50 - Hace 10 minutos</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#38bdf8]">👤</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Nuevo Empleado</h4>
                    <p className="text-sm text-[#94a3b8]">Juan Pérez - Hace 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#60a5fa]">🛒</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Nueva Compra</h4>
                    <p className="text-sm text-[#94a3b8]">$1,250.00 - Hace 4 horas</p>
                  </div>
                </div>
              </div>
              
              <a href="#" className="block mt-4 py-2 text-sm text-center text-[#38bdf8] hover:text-[#0ea5e9] hover:bg-[#334155] rounded">
                Ver todas las actividades
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Acciones Rápidas */}
      <div className="mt-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Acciones Rápidas</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/ventas" className="flex flex-col items-center p-4 bg-[#334155] rounded-lg hover:bg-[#475569] transition-colors shine">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] flex items-center justify-center mb-3">
                  <span className="text-2xl">💰</span>
                </div>
                <span className="text-sm font-medium text-white">Nueva Venta</span>
              </a>
              
              <a href="/compras" className="flex flex-col items-center p-4 bg-[#334155] rounded-lg hover:bg-[#475569] transition-colors shine">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] flex items-center justify-center mb-3">
                  <span className="text-2xl">🛒</span>
                </div>
                <span className="text-sm font-medium text-white">Nueva Compra</span>
              </a>
              
              <a href="/productos" className="flex flex-col items-center p-4 bg-[#334155] rounded-lg hover:bg-[#475569] transition-colors shine">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] flex items-center justify-center mb-3">
                  <span className="text-2xl">📦</span>
                </div>
                <span className="text-sm font-medium text-white">Agregar Producto</span>
              </a>
              
              <a href="/platillos" className="flex flex-col items-center p-4 bg-[#334155] rounded-lg hover:bg-[#475569] transition-colors shine">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] flex items-center justify-center mb-3">
                  <span className="text-2xl">🌮</span>
                </div>
                <span className="text-sm font-medium text-white">Agregar Platillo</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}