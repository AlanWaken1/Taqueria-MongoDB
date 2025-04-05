'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ProductosPage() {
  const { fetchWithAuth } = useAuth();
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario - adaptado para MongoDB
  const [productoForm, setProductoForm] = useState({
    nombre: '',
    cantidad: 1,
    categoria: 'alimentos', // Valor predeterminado según modelo
    proveedor_id: '', // Cambiado de id_Proveedor a proveedor_id
  });
  
  // Estado para edición de cantidad - adaptado para MongoDB
  const [editCantidad, setEditCantidad] = useState({
    _id: null, // Cambiado de id_Producto a _id
    cantidad: 0
  });
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar productos
        const productosRes = await fetchWithAuth('/api/productos');
        if (!productosRes.ok) throw new Error('Error al cargar productos');
        const productosData = await productosRes.json();
        setProductos(productosData);
        
        // Cargar proveedores
        const proveedoresRes = await fetchWithAuth('/api/proveedores');
        if (!proveedoresRes.ok) throw new Error('Error al cargar proveedores');
        const proveedoresData = await proveedoresRes.json();
        setProveedores(proveedoresData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchWithAuth]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductoForm({
      ...productoForm,
      [name]: name === 'cantidad' ? parseInt(value) : value
    });
  };
  
  // Iniciar modo edición de cantidad - adaptado para MongoDB
  const handleEditMode = (producto) => {
    setEditCantidad({
      _id: producto._id, // Cambiado de id_Producto a _id
      cantidad: producto.cantidad
    });
  };
  
  // Actualizar cantidad en el formulario de edición
  const handleEditCantidadChange = (e) => {
    setEditCantidad({
      ...editCantidad,
      cantidad: parseInt(e.target.value)
    });
  };
  
  // Guardar cambios de cantidad - adaptado para MongoDB
  const handleSaveCantidad = async () => {
    try {
      const response = await fetchWithAuth('/api/productos', {
        method: 'PUT',
        body: JSON.stringify(editCantidad)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar cantidad');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de productos
      const productosRes = await fetchWithAuth('/api/productos');
      const productosData = await productosRes.json();
      setProductos(productosData);
      
      // Resetear estado de edición
      setEditCantidad({
        _id: null, // Cambiado de id_Producto a _id
        cantidad: 0
      });
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditCantidad({
      _id: null, // Cambiado de id_Producto a _id
      cantidad: 0
    });
  };
  
  // Enviar formulario para nuevo producto - adaptado para MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productoForm.nombre || productoForm.cantidad < 0 || !productoForm.proveedor_id) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }
    
    try {
      const response = await fetchWithAuth('/api/productos', {
        method: 'POST',
        body: JSON.stringify(productoForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar producto');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de productos
      const productosRes = await fetchWithAuth('/api/productos');
      const productosData = await productosRes.json();
      setProductos(productosData);
      
      // Limpiar formulario
      setProductoForm({
        nombre: '',
        cantidad: 1,
        categoria: 'alimentos',
        proveedor_id: '',
      });
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Eliminar producto - adaptado para MongoDB
  const handleDeleteProducto = async (id) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/api/productos?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar producto');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de productos
      const productosRes = await fetchWithAuth('/api/productos');
      const productosData = await productosRes.json();
      setProductos(productosData);
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Función para determinar el color de fondo de la cantidad
  const getQuantityColor = (cantidad) => {
    if (cantidad === 0) return 'bg-red-600';
    if (cantidad < 5) return 'bg-amber-600';
    return 'bg-green-600';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Cargando productos...</div>
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
        <h1 className="text-2xl font-bold text-white">Gestión de Productos</h1>
        <Link href="/" className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors">
          Volver al inicio
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de nuevo producto */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Agregar Nuevo Producto</h2>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Nombre del Producto</label>
                <input
                  type="text"
                  name="nombre"
                  value={productoForm.nombre}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ej. Carne para tacos"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  value={productoForm.cantidad}
                  onChange={handleChange}
                  min="0"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Categoría</label>
                <select
                  name="categoria"
                  value={productoForm.categoria}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="alimentos">Alimentos</option>
                  <option value="refrescos">Refrescos</option>
                  <option value="artículos de limpieza">Artículos de limpieza</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Proveedor</label>
                <select
                  name="proveedor_id"
                  value={productoForm.proveedor_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full p-3 rounded-lg flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Agregar Producto
              </button>
            </form>
          </div>
        </div>
        
        {/* Lista de productos */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Inventario de Productos</h2>
            <span className="bg-[#38bdf8] text-white text-xs font-bold py-1 px-2 rounded-full">
              {productos.length} total
            </span>
          </div>
          
          <div className="card-body">
            {productos.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Cantidad</th>
                      <th>Proveedor</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(producto => (
                      <tr key={producto._id}>
                        <td>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#334155] rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm">📦</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{producto.nombre}</p>
                              <p className="text-xs text-[#94a3b8]">Cat: {producto.categoria}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          {editCantidad._id === producto._id ? (
                            <div className="flex items-center space-x-2 justify-center">
                              <input
                                type="number"
                                value={editCantidad.cantidad}
                                onChange={handleEditCantidadChange}
                                min="0"
                                className="w-16 bg-[#334155] border-0 rounded p-1 text-center text-white"
                              />
                              <div className="flex">
                                <button
                                  onClick={handleSaveCantidad}
                                  className="p-1 text-green-500 hover:text-green-400"
                                  title="Guardar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 text-red-500 hover:text-red-400"
                                  title="Cancelar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => handleEditMode(producto)}
                              className="cursor-pointer inline-flex items-center justify-center px-3 py-1 rounded-full text-white font-bold text-xs whitespace-nowrap"
                              style={{ backgroundColor: producto.cantidad === 0 ? '#ef4444' : (producto.cantidad < 5 ? '#f59e0b' : '#10b981') }}
                            >
                              {producto.cantidad}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td>
                          {producto.proveedor ? (
                            <span className="bg-[#334155] text-white px-2 py-1 rounded text-xs">
                              {producto.proveedor.nombre}
                            </span>
                          ) : (
                            <span className="text-[#94a3b8] text-xs">No asignado</span>
                          )}
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => handleDeleteProducto(producto._id)}
                            className="p-1 text-[#f87171] hover:text-[#ef4444] rounded"
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
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-[#94a3b8] text-center">No hay productos registrados</p>
                <p className="text-[#94a3b8] text-center text-sm mt-1">Agrega un producto utilizando el formulario</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}