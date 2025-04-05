// /src/app/compras/page.js - Adaptado para MongoDB
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FormInput, FormSelect, FormButton, FormCard } from '@/components/ui/Form';
import { useAuth } from '@/context/AuthContext'; 

export default function ComprasPage() {
  const { fetchWithAuth } = useAuth();
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario - Adaptado para MongoDB
  const [compraForm, setCompraForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
    total: 0,
    proveedor_id: '', // Cambiado de id_Proveedor a proveedor_id
    detalles: []
  });
  
  // Estado para el detalle actual - Adaptado para MongoDB
  const [detalleActual, setDetalleActual] = useState({
    producto_id: '', // Cambiado de id_Producto a producto_id
    cantidad: 1,
    costo_unitario: 0
  });
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar compras
        const comprasRes = await fetchWithAuth('/api/compras');
        if (!comprasRes.ok) throw new Error('Error al cargar compras');
        const comprasData = await comprasRes.json();
        setCompras(comprasData);
        
        // Cargar proveedores
        const proveedoresRes = await fetchWithAuth('/api/proveedores');
        if (!proveedoresRes.ok) throw new Error('Error al cargar proveedores');
        const proveedoresData = await proveedoresRes.json();
        setProveedores(proveedoresData);
        
        // Cargar productos
        const productosRes = await fetchWithAuth('/api/productos');
        if (!productosRes.ok) throw new Error('Error al cargar productos');
        const productosData = await productosRes.json();
        setProductos(productosData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchWithAuth]);
  
  // Manejar cambios en el formulario de compra
  const handleCompraChange = (e) => {
    const { name, value } = e.target;
    setCompraForm({
      ...compraForm,
      [name]: value
    });
  };
  
  // Manejar cambios en el detalle actual
  const handleDetalleChange = (e) => {
    const { name, value } = e.target;
    setDetalleActual({
      ...detalleActual,
      [name]: name === 'producto_id' ? value : parseFloat(value) // Cambiado id_Producto a producto_id
    });
    
    // Si cambia el producto, actualizar el precio si está disponible
    if (name === 'producto_id' && value) { // Cambiado id_Producto a producto_id
      const productoSeleccionado = productos.find(p => p._id === value); // Cambiado id_Producto a _id
      if (productoSeleccionado && productoSeleccionado.costo_unitario) {
        setDetalleActual(prev => ({
          ...prev,
          costo_unitario: productoSeleccionado.costo_unitario
        }));
      }
    }
  };
  
  // Agregar detalle a la compra
  const handleAgregarDetalle = () => {
    if (!detalleActual.producto_id || detalleActual.cantidad <= 0 || detalleActual.costo_unitario <= 0) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }
    
    const productoSeleccionado = productos.find(p => p._id === detalleActual.producto_id);
    
    // Verificar si el producto ya está en los detalles
    const detalleExistente = compraForm.detalles.findIndex(
      d => d.producto_id === detalleActual.producto_id
    );
    
    let nuevosDetalles = [...compraForm.detalles];
    
    if (detalleExistente >= 0) {
      // Actualizar cantidad si ya existe
      nuevosDetalles[detalleExistente].cantidad += detalleActual.cantidad;
      nuevosDetalles[detalleExistente].subtotal = 
        nuevosDetalles[detalleExistente].cantidad * nuevosDetalles[detalleExistente].costo_unitario;
    } else {
      // Agregar nuevo detalle
      nuevosDetalles.push({
        producto_id: detalleActual.producto_id,
        nombre: productoSeleccionado.nombre,
        cantidad: detalleActual.cantidad,
        costo_unitario: detalleActual.costo_unitario,
        subtotal: detalleActual.cantidad * detalleActual.costo_unitario
      });
    }
    
    // Calcular nuevo total
    const nuevoTotal = nuevosDetalles.reduce((total, detalle) => 
      total + (detalle.cantidad * detalle.costo_unitario), 0);
    
    setCompraForm({
      ...compraForm,
      detalles: nuevosDetalles,
      total: nuevoTotal
    });
    
    // Resetear detalle actual
    setDetalleActual({
      producto_id: '',
      cantidad: 1,
      costo_unitario: 0
    });
  };
  
  // Eliminar detalle de la compra
  const handleEliminarDetalle = (index) => {
    const nuevosDetalles = [...compraForm.detalles];
    nuevosDetalles.splice(index, 1);
    
    // Calcular nuevo total
    const nuevoTotal = nuevosDetalles.reduce((total, detalle) => 
      total + (detalle.cantidad * detalle.costo_unitario), 0);
    
    setCompraForm({
      ...compraForm,
      detalles: nuevosDetalles,
      total: nuevoTotal
    });
  };
  
  // Registrar compra
  const handleSubmit = async (e) => {
    e.preventDefault();
    

    

    if (!compraForm.proveedor_id) {
      alert('Por favor seleccione un proveedor');
      return;
    }
    
    if (compraForm.detalles.length === 0) {
      alert('Debe agregar al menos un producto a la compra');
      return;
    }
    
    try {
      const response = await fetchWithAuth('/api/compras', {
        method: 'POST',
        body: JSON.stringify(datosCompra)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.Mensaje || 'Error al registrar compra');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de compras
      const comprasRes = await fetchWithAuth('/api/compras');
      const comprasData = await comprasRes.json();
      setCompras(comprasData);
      
      // Limpiar formulario
      setCompraForm({
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
        total: 0,
        proveedor_id: '',
        detalles: []
      });
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Eliminar compra
  const handleDeleteCompra = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta compra?')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/api/compras?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.Mensaje || 'Error al eliminar compra');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de compras
      const comprasRes = await fetchWithAuth('/api/compras');
      const comprasData = await comprasRes.json();
      setCompras(comprasData);
    } catch (err) {
      alert(err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Cargando compras...</div>
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
        <h1 className="text-2xl font-bold text-white">Gestión de Compras</h1>
        <Link href="/" className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors">
          Volver al inicio
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de nueva compra */}
        <FormCard title="Registrar Nueva Compra">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormInput
                label="Fecha"
                type="date"
                name="fecha"
                value={compraForm.fecha}
                onChange={handleCompraChange}
                required
              />
              
              <FormInput
                label="Hora"
                type="time"
                name="hora"
                value={compraForm.hora}
                onChange={handleCompraChange}
                required
              />
            </div>
            
            <FormSelect
              label="Proveedor"
              name="proveedor_id" // Cambiado de id_Proveedor
              value={compraForm.proveedor_id}
              onChange={handleCompraChange}
              options={proveedores.map(p => ({ 
                value: p._id, // Cambiado de id_Proveedor
                label: p.nombre 
              }))}
              required
            />
            
            {/* Agregar productos */}
            <div className="mb-4 p-4 border border-[#334155] rounded-lg bg-[#1e293b]">
              <h3 className="text-white font-semibold mb-3">Agregar Productos</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                <FormSelect
                  label="Producto"
                  name="producto_id" // Cambiado de id_Producto
                  value={detalleActual.producto_id}
                  onChange={handleDetalleChange}
                  options={productos.map(p => ({ 
                    value: p._id, // Cambiado de id_Producto
                    label: p.nombre 
                  }))}
                />
                
                <FormInput
                  label="Cantidad"
                  type="number"
                  name="cantidad"
                  value={detalleActual.cantidad}
                  onChange={handleDetalleChange}
                  min="1"
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Costo Unitario
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
                    <input
                      type="number"
                      name="costo_unitario"
                      value={isNaN(detalleActual.costo_unitario) ? '' : detalleActual.costo_unitario}
                      onChange={handleDetalleChange}
                      min="0.01"
                      step="0.01"
                      className="w-full bg-[#334155] border border-[#475569] rounded-md p-2.5 text-white 
                                 focus:border-[#38bdf8] focus:ring focus:ring-[#38bdf8]/20 transition-all 
                                 pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAgregarDetalle}
                className="w-full p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Agregar Producto
              </button>
            </div>
            
            {/* Lista de productos agregados */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-semibold">Productos en la compra</h3>
                {compraForm.detalles.length > 0 && (
                  <span className="badge badge-blue">
                    {compraForm.detalles.length} items
                  </span>
                )}
              </div>
              
              {compraForm.detalles.length > 0 ? (
                <div className="bg-[#1e293b] border border-[#334155] rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#334155]">
                        <tr>
                          <th className="p-2 text-left text-[#94a3b8] font-medium text-xs uppercase">Producto</th>
                          <th className="p-2 text-center text-[#94a3b8] font-medium text-xs uppercase">Cant.</th>
                          <th className="p-2 text-right text-[#94a3b8] font-medium text-xs uppercase">Costo Unit.</th>
                          <th className="p-2 text-right text-[#94a3b8] font-medium text-xs uppercase">Subtotal</th>
                          <th className="p-2 text-center text-[#94a3b8] font-medium text-xs uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]">
                        {compraForm.detalles.map((detalle, index) => (
                          <tr key={index} className="hover:bg-[#334155]/50 transition-colors">
                            <td className="p-2 text-white">{detalle.nombre}</td>
                            <td className="p-2 text-center text-white">{detalle.cantidad}</td>
                            <td className="p-2 text-right text-[#38bdf8]">${detalle.costo_unitario.toFixed(2)}</td>
                            <td className="p-2 text-right text-[#38bdf8] font-bold">${(detalle.cantidad * detalle.costo_unitario).toFixed(2)}</td>
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
                          <td className="p-3 text-right text-white font-bold text-lg">${compraForm.total.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 bg-[#1e293b] border border-[#334155] rounded-lg">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="text-[#94a3b8] text-center">No hay productos agregados</p>
                  <p className="text-[#94a3b8] text-center text-sm mt-1">Agrega productos usando el formulario de arriba</p>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full p-3 rounded-lg flex items-center justify-center"
              disabled={!compraForm.proveedor_id || compraForm.detalles.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Registrar Compra
            </button>
          </form>
        </FormCard>
        
        {/* Historial de compras */}
        <FormCard title="Historial de Compras">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-white">Compras Registradas</h2>
            <span className="badge badge-blue">
              {compras.length} total
            </span>
          </div>
          
          {compras.length > 0 ? (
            <div className="space-y-4">
              {compras.map(compra => (
                <div 
                  key={compra._id} // Cambiado de id_Compra
                  className="shine-card p-4 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center mr-3">
                        <span className="text-lg">🛒</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Compra #{compra._id.substring(0, 8)}</h3>
                        <p className="text-[#94a3b8] text-sm">
                          {new Date(compra.fecha).toLocaleDateString()} - {compra.hora ? compra.hora.slice(0, 5) : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-[#38bdf8]">${parseFloat(compra.total).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      <span className="badge bg-[#334155] text-white">
                        Proveedor: {compra.proveedor ? compra.proveedor.nombre : 'No asignado'}
                      </span>
                      <span className="badge bg-[#334155] text-white">
                        Productos: {compra.detalles ? compra.detalles.length : 0}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteCompra(compra._id)} // Cambiado de id_Compra
                      className="p-2 bg-[#334155] text-[#f87171] rounded-lg hover:bg-[#475569] transition-colors"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-[#94a3b8] text-center">No hay compras registradas</p>
              <p className="text-[#94a3b8] text-center text-sm mt-1">Registra una compra utilizando el formulario</p>
            </div>
          )}
        </FormCard>
      </div>
    </div>
  );
}