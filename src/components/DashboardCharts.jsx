import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardCharts = ({ stats }) => {
  const [activeTab, setActiveTab] = useState('ventas');
  const [period, setPeriod] = useState('week');
  
  // Datos para simulación (en un caso real vendrían del backend)
  const [chartData, setChartData] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Colores para gráficos
  const COLORS = ['#38bdf8', '#4ade80', '#f87171', '#fbbf24', '#a78bfa', '#f472b6'];
  
  // Generar datos simulados al cargar
  useEffect(() => {
    generateData();
  }, [period, activeTab]);
  
  const generateData = () => {
    setLoading(true);
    
    // Simulación de tiempo de carga de datos
    setTimeout(() => {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      
      // Datos para gráfico de línea/barra
      const trendData = Array.from({ length: days }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        
        // Valores aleatorios pero realistas
        const ventasDia = Math.floor(1000 + Math.random() * 3000);
        const comprasDia = Math.floor(500 + Math.random() * 1000);
        const gastosDia = Math.floor(100 + Math.random() * 300);
        
        return {
          fecha: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
          fechaCompleta: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
          ventas: ventasDia,
          compras: comprasDia,
          gastos: gastosDia,
          beneficio: ventasDia - comprasDia - gastosDia
        };
      });
      
      // Datos para gráfico de pie
      const platillos = [
        { name: 'Tacos al Pastor', value: 35 },
        { name: 'Quesadillas', value: 20 },
        { name: 'Tortas', value: 15 },
        { name: 'Burritos', value: 12 },
        { name: 'Refrescos', value: 10 },
        { name: 'Otros', value: 8 }
      ];
      
      setChartData(trendData);
      setProductosPopulares(platillos);
      setLoading(false);
    }, 1000);
  };
  
  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Cargando gráficos...</div>
        </div>
      </div>
    );
  }
  
  // Customización de tooltips para recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] p-4 border border-[#334155] rounded-md shadow-lg">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Función para formar datos acumulados por semana
  const getAggregatedData = () => {
    if (period === 'week') return chartData;
    
    // Para periodos más largos, agrupar los datos para mejor visualización
    const aggregatedData = [];
    let currentWeek = 0;
    
    chartData.forEach((day, index) => {
      const weekNum = Math.floor(index / 7);
      
      if (weekNum !== currentWeek) {
        aggregatedData.push({
          fecha: `Sem ${weekNum + 1}`,
          ventas: 0,
          compras: 0,
          gastos: 0,
          beneficio: 0
        });
        currentWeek = weekNum;
      }
      
      // Verificar que existe un elemento en el array antes de acceder a él
      const lastIndex = aggregatedData.length - 1;
      if (lastIndex >= 0 && aggregatedData[lastIndex]) {
        aggregatedData[lastIndex].ventas += day.ventas || 0;
        aggregatedData[lastIndex].compras += day.compras || 0;
        aggregatedData[lastIndex].gastos += day.gastos || 0;
        aggregatedData[lastIndex].beneficio += day.beneficio || 0;
      }
    });
    
    return aggregatedData;
  };
  
  return (
    <div className="card mb-6">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Análisis de Tendencias</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                period === 'week' 
                  ? 'bg-[#38bdf8] text-white' 
                  : 'bg-[#334155] text-white/70 hover:bg-[#475569]'
              }`}
            >
              Semana
            </button>
            <button 
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                period === 'month' 
                  ? 'bg-[#38bdf8] text-white' 
                  : 'bg-[#334155] text-white/70 hover:bg-[#475569]'
              }`}
            >
              Mes
            </button>
            <button 
              onClick={() => setPeriod('quarter')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                period === 'quarter' 
                  ? 'bg-[#38bdf8] text-white' 
                  : 'bg-[#334155] text-white/70 hover:bg-[#475569]'
              }`}
            >
              Trimestre
            </button>
          </div>
        </div>
        <div className="mt-4 flex border-b border-[#334155]">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'ventas' 
                ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' 
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setActiveTab('ventas')}
          >
            Ventas vs Gastos
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'beneficio' 
                ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' 
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setActiveTab('beneficio')}
          >
            Beneficio
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'productos' 
                ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' 
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setActiveTab('productos')}
          >
            Platillos Populares
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 h-80 ${activeTab !== 'productos' ? 'block' : 'hidden'}`}>
            {activeTab === 'ventas' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getAggregatedData()}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="fecha" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ventas" 
                    name="Ventas" 
                    stroke="#38bdf8" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#38bdf8' }}
                    activeDot={{ r: 6, fill: '#38bdf8' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="compras" 
                    name="Compras" 
                    stroke="#f87171" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f87171' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gastos" 
                    name="Gastos" 
                    stroke="#fbbf24" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#fbbf24' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {activeTab === 'beneficio' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getAggregatedData()}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="fecha" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="beneficio" 
                    name="Beneficio Neto" 
                    fill="#4ade80"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className={`h-80 ${activeTab === 'productos' ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
            {activeTab === 'productos' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={productosPopulares}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {productosPopulares.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="lg:col-span-2">
                  <h3 className="text-white font-medium mb-4">Platillos más vendidos</h3>
                  <div className="space-y-4">
                    {productosPopulares.map((product, index) => (
                      <div key={index} className="bg-[#1e293b] p-3 rounded-lg border border-[#334155]">
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-[#94a3b8] text-sm">{product.value}%</div>
                        </div>
                        <div className="w-full bg-[#0f172a] rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${product.value}%`,
                              backgroundColor: COLORS[index % COLORS.length] 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <h3 className="text-white font-medium mb-4">Resumen de desempeño</h3>
                
                {/* KPIs */}
                <div className="space-y-4 mb-6">
                  <div className="bg-[#1e293b] p-4 rounded-lg border border-[#334155]">
                    <div className="text-[#94a3b8] text-sm mb-1">Ventas promedio diarias</div>
                    <div className="text-xl font-bold text-white">
                      ${Math.round(chartData.reduce((sum, day) => sum + day.ventas, 0) / chartData.length).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-[#1e293b] p-4 rounded-lg border border-[#334155]">
                    <div className="text-[#94a3b8] text-sm mb-1">Margen de beneficio</div>
                    <div className="text-xl font-bold text-white">
                      {Math.round(chartData.reduce((sum, day) => sum + day.beneficio, 0) / 
                      chartData.reduce((sum, day) => sum + day.ventas, 0) * 100)}%
                    </div>
                  </div>
                  
                  <div className="bg-[#1e293b] p-4 rounded-lg border border-[#334155]">
                    <div className="text-[#94a3b8] text-sm mb-1">Día con mayores ventas</div>
                    <div className="text-xl font-bold text-white">
                      {chartData.reduce((max, day) => day.ventas > max.ventas ? day : max, { ventas: 0 }).fechaCompleta}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => generateData()}
                  className="w-full py-2 bg-[#334155] text-[#38bdf8] rounded-lg hover:bg-[#475569] transition-colors"
                >
                  Actualizar datos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;