'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // AÑADIR ESTA IMPORTACIÓN


export default function VentasPage() {
  const { fetchWithAuth } = useAuth(); // AÑADIR ESTO
  const [ventas, setVentas] = useState([]);
  const [platillos, setPlatillos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el reporte
  const [reporteDates, setReporteDates] = useState({
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0]
  });
  const [totalVentas, setTotalVentas] = useState(null);
  
  // Estado para el formulario de nueva venta
  const [ventaForm, setVentaForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
    metodo: 'efectivo',
    detalles: []
  });
  
  // Estado para el detalle actual que se está agregando
  const [detalleActual, setDetalleActual] = useState({
    platillo_id: '',
    cantidad: 1,
    precio: 0
  });
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar ventas CON AUTENTICACIÓN
        const ventasRes = await fetchWithAuth('/api/ventas');
        if (!ventasRes.ok) throw new Error('Error al cargar ventas');
        const ventasData = await ventasRes.json();
        setVentas(ventasData);
        
        // Cargar platillos CON AUTENTICACIÓN
        const platillosRes = await fetchWithAuth('/api/platillos');
        if (!platillosRes.ok) throw new Error('Error al cargar platillos');
        const platillosData = await platillosRes.json();
        setPlatillos(platillosData);
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchWithAuth]); // Incluir fetchWithAuth en las dependencias
  
  // Manejar cambios en el formulario de venta
  const handleVentaChange = (e) => {
    const { name, value } = e.target;
    setVentaForm({
      ...ventaForm,
      [name]: value
    });
  };
  
  // Manejar cambios en el detalle actual
  const handleDetalleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'platillo_id') {
      const platilloSeleccionado = platillos.find(p => p._id === value);
      setDetalleActual({
        ...detalleActual,
        platillo_id: value,
        precio: platilloSeleccionado ? parseFloat(platilloSeleccionado.precio) : 0
      });
    } else {
      setDetalleActual({
        ...detalleActual,
        [name]: name === 'cantidad' ? parseInt(value) : parseFloat(value)
      });
    }
  };
  
  // Agregar detalle a la venta
  const handleAgregarDetalle = () => {
    if (!detalleActual.platillo_id || detalleActual.cantidad <= 0) {
      alert('Por favor seleccione un platillo y una cantidad válida');
      return;
    }
    
    const platilloSeleccionado = platillos.find(p => p._id === detalleActual.platillo_id);
    
    if (!platilloSeleccionado) {
      alert('Platillo no encontrado. Por favor, seleccione uno válido.');
      return;
    }
    
    // Verificar si el platillo ya está en los detalles
    const detalleExistente = ventaForm.detalles.findIndex(
      d => d.platillo_id === detalleActual.platillo_id
    );
    
    let nuevosDetalles = [...ventaForm.detalles];
    
    if (detalleExistente >= 0) {
      // Actualizar cantidad si ya existe
      nuevosDetalles[detalleExistente].cantidad += detalleActual.cantidad;
      nuevosDetalles[detalleExistente].subtotal = 
        nuevosDetalles[detalleExistente].cantidad * nuevosDetalles[detalleExistente].precio;
    } else {
      // Agregar nuevo detalle
      nuevosDetalles.push({
        platillo_id: detalleActual.platillo_id,
        nombre: platilloSeleccionado.nombre,
        cantidad: detalleActual.cantidad,
        precio: detalleActual.precio || platilloSeleccionado.precio,
        subtotal: detalleActual.cantidad * (detalleActual.precio || platilloSeleccionado.precio)
      });
    }
    
    setVentaForm({
      ...ventaForm,
      detalles: nuevosDetalles
    });
    
    // Resetear detalle actual
    setDetalleActual({
      platillo_id: '',
      cantidad: 1,
      precio: 0
    });
  };
  
  // Eliminar detalle de la venta
  const handleEliminarDetalle = (index) => {
    const nuevosDetalles = [...ventaForm.detalles];
    nuevosDetalles.splice(index, 1);
    
    setVentaForm({
      ...ventaForm,
      detalles: nuevosDetalles
    });
  };
  
  // Calcular total de la venta
  const calcularTotal = () => {
    return ventaForm.detalles.reduce((total, detalle) => total + (detalle.cantidad * detalle.precio), 0);
  };
  
  // Registrar venta
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (ventaForm.detalles.length === 0) {
      alert('Debe agregar al menos un platillo a la venta');
      return;
    }
    
    try {
      // Formatear datos para API
      const datosVenta = {
        ...ventaForm,
        detalles: ventaForm.detalles.map(detalle => ({
          platillo_id: detalle.platillo_id,
          cantidad: detalle.cantidad,
          precio: detalle.precio
        }))
      };
      
      console.log("Enviando datos:", JSON.stringify(datosVenta));
      
      const response = await fetchWithAuth('/api/ventas', {
        method: 'POST',
        body: JSON.stringify(datosVenta)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || 'Error al registrar venta');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de ventas
      const ventasRes = await fetchWithAuth('/api/ventas');
      const ventasData = await ventasRes.json();
      setVentas(ventasData);
      
      // Limpiar formulario
      setVentaForm({
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
        metodo: 'efectivo',
        detalles: []
      });
    } catch (err) {
      console.error("Error completo:", err);
      alert('Error al registrar venta: ' + err.message);
    }
  };
  
  // Eliminar venta
  const handleDeleteVenta = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta venta?')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/api/ventas?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar venta');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de ventas
      const ventasRes = await fetchWithAuth('/api/ventas');
      const ventasData = await ventasRes.json();
      setVentas(ventasData);
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Manejar cambios en fechas del reporte
  const handleReporteDateChange = (e) => {
    const { name, value } = e.target;
    setReporteDates({
      ...reporteDates,
      [name]: value
    });
  };
  
  // Generar reporte de ventas
  const handleGenerarReporte = async () => {
    try {
      const res = await fetchWithAuth(
        `/api/ventas?fecha_inicio=${reporteDates.fecha_inicio}&fecha_fin=${reporteDates.fecha_fin}`
      );
      
      if (!res.ok) throw new Error('Error al generar reporte');
      
      const data = await res.json();
      setTotalVentas(data.total);
    } catch (err) {
      alert(err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Cargando ventas...</div>
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
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gestión de Ventas</h1>
        <Link href="/" className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors">
          Volver al inicio
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de nueva venta */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Registrar Nueva Venta</h2>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={ventaForm.fecha}
                    onChange={handleVentaChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Hora</label>
                  <input
                    type="time"
                    name="hora"
                    value={ventaForm.hora}
                    onChange={handleVentaChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Método de Pago</label>
                <select
                  name="metodo"
                  value={ventaForm.metodo}
                  onChange={handleVentaChange}
                  className="form-select"
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
              
              {/* Agregar platillos */}
              <div className="mb-4 p-4 border border-[#334155] rounded-lg bg-[#1e293b]">
                <h3 className="text-white font-semibold mb-3">Agregar Platillos</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="form-label">Platillo</label>
                    <select
                      name="platillo_id"
                      value={detalleActual.platillo_id}
                      onChange={handleDetalleChange}
                      className="form-select"
                    >
                      <option value="">Seleccionar platillo</option>
                      {platillos.map(p => (
                        <option key={p._id} value={p._id}>
                        {p.nombre} - ${parseFloat(p.precio).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      name="cantidad"
                      value={detalleActual.cantidad}
                      onChange={handleDetalleChange}
                      min="1"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAgregarDetalle}
                  className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Agregar Platillo
                </button>
              </div>
              
              {/* Lista de platillos agregados */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-semibold">Platillos en la venta</h3>
                  {ventaForm.detalles.length > 0 && (
                    <span className="badge badge-blue">
                      {ventaForm.detalles.length} items
                    </span>
                  )}
                </div>
                
                {ventaForm.detalles.length > 0 ? (
                  <div className="bg-[#1e293b] border border-[#334155] rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#334155]">
                          <tr>
                            <th className="p-2 text-left text-[#94a3b8] font-medium text-xs uppercase">Platillo</th>
                            <th className="p-2 text-center text-[#94a3b8] font-medium text-xs uppercase">Cant.</th>
                            <th className="p-2 text-right text-[#94a3b8] font-medium text-xs uppercase">Precio</th>
                            <th className="p-2 text-right text-[#94a3b8] font-medium text-xs uppercase">Subtotal</th>
                            <th className="p-2 text-center text-[#94a3b8] font-medium text-xs uppercase">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]">
                          {ventaForm.detalles.map((detalle, index) => (
                            <tr key={index} className="hover:bg-[#334155]/50 transition-colors">
                              <td className="p-2 text-white">{detalle.nombre}</td>
                              <td className="p-2 text-center text-white">{detalle.cantidad}</td>
                              <td className="p-2 text-right text-[#38bdf8]">${parseFloat(detalle.precio).toFixed(2)}</td>
                              <td className="p-2 text-right text-[#38bdf8] font-bold">${(detalle.cantidad * detalle.precio).toFixed(2)}</td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleEliminarDetalle(index)}
                                  className="text-[#f87171] hover:text-[#ef4444] transition-colors"
                                  title="Eliminar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-[#334155]">
                          <tr>
                            <td className="p-3 font-semibold text-white" colSpan="3">Total</td>
                            <td className="p-3 text-right text-white font-bold text-lg">${calcularTotal().toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 bg-[#1e293b] border border-[#334155] rounded-lg">
                    <div className="text-5xl mb-3">🌮</div>
                    <p className="text-[#94a3b8] text-center">No hay platillos agregados</p>
                    <p className="text-[#94a3b8] text-center text-sm mt-1">Agrega platillos usando el formulario de arriba</p>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full p-3 rounded-lg flex items-center justify-center"
                disabled={ventaForm.detalles.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Registrar Venta
              </button>
            </form>
          </div>
        </div>
        
        {/* Historial de ventas y reportes */}
        <div className="space-y-6">
          {/* Reportes */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-white">Generar Reporte de Ventas</h2>
            </div>
            
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="form-label">Fecha Inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={reporteDates.fecha_inicio}
                    onChange={handleReporteDateChange}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Fecha Fin</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={reporteDates.fecha_fin}
                    onChange={handleReporteDateChange}
                    className="form-input"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleGenerarReporte}
                className="w-full p-3 mb-4 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                </svg>
                Generar Reporte
              </button>
              
              {totalVentas !== null && (
                <div className="p-4 bg-[#0f2417] rounded-lg border border-[#0f5132]">
                  <h3 className="text-[#4ade80] font-medium mb-1">Resultado del Reporte:</h3>
                  <p className="text-white text-sm mb-2">
                    Periodo: <span className="text-[#94a3b8]">{reporteDates.fecha_inicio}</span> al <span className="text-[#94a3b8]">{reporteDates.fecha_fin}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94a3b8]">Total de ventas:</span>
                    <span className="text-2xl font-bold text-[#4ade80]">
                         ${totalVentas !== undefined ? parseFloat(totalVentas).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Historial de ventas */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Historial de Ventas</h2>
              <span className="bg-[#38bdf8] text-white text-xs font-bold py-1 px-2 rounded-full">
                {ventas.length} total
              </span>
            </div>
            
            <div className="card-body">
              {ventas.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th className="text-right">Total</th>
                        <th>Método</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.map(venta => (
                        <tr key={venta._id}>
                          <td>#{venta._id.toString().substring(0, 6)}</td>
                          <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                          <td>{venta.hora ? venta.hora.slice(0, 5) : ''}</td>
                          <td className="text-right font-bold text-[#38bdf8]">${parseFloat(venta.total).toFixed(2)}</td>
                          <td>
                            <span 
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                ${venta.metodo === 'efectivo' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
                            >
                              {venta.metodo === 'efectivo' ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                  </svg>
                                  Efectivo
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                  </svg>
                                  Tarjeta
                                </>
                              )}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleDeleteVenta(venta._id)}
                              className="text-[#f87171] hover:text-[#ef4444] transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-5xl mb-4">💰</div>
                  <p className="text-[#94a3b8] text-center">No hay ventas registradas</p>
                  <p className="text-[#94a3b8] text-center text-sm mt-1">Registra una venta utilizando el formulario</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}