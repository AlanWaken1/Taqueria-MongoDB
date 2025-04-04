'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PlatillosPage() {
  const [platillos, setPlatillos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario - adaptado para MongoDB
  const [platilloForm, setPlatilloForm] = useState({
    nombre: '',
    precio: 0,
    categoria: '',
    ingredientes: []
  });
  
  // Estado para ingrediente actual - adaptado para MongoDB
  const [ingredienteActual, setIngredienteActual] = useState({
    producto_id: '', // Cambiado de id_Producto a producto_id
    cantidad: 1
  });
  
  // Estado para edición - adaptado para MongoDB
  const [editForm, setEditForm] = useState({
    _id: null, // Cambiado de id_Platillo a _id
    nombre: '',
    precio: 0,
    categoria: '',
    ingredientes: []
  });
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar platillos
        const platillosRes = await fetch('/api/platillos');
        if (!platillosRes.ok) throw new Error('Error al cargar platillos');
        const platillosData = await platillosRes.json();
        setPlatillos(platillosData);
        
        // Cargar productos para ingredientes
        const productosRes = await fetch('/api/productos');
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
  }, []);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlatilloForm({
      ...platilloForm,
      [name]: name === 'precio' ? parseFloat(value) : value
    });
  };
  
  // Manejar cambios en el ingrediente actual
  const handleIngredienteChange = (e) => {
    const { name, value } = e.target;
    setIngredienteActual({
      ...ingredienteActual,
      [name]: name === 'cantidad' ? parseFloat(value) : value
    });
  };
  
  // Agregar ingrediente al platillo
  const handleAgregarIngrediente = () => {
    if (!ingredienteActual.producto_id || ingredienteActual.cantidad <= 0) {
      alert('Por favor seleccione un producto y una cantidad válida');
      return;
    }
    
    const productoSeleccionado = productos.find(p => p._id === ingredienteActual.producto_id);
    
    if (!productoSeleccionado) {
      alert('El producto seleccionado no existe');
      return;
    }
    
    // Verificar si el producto ya está en los ingredientes
    const existeIngrediente = platilloForm.ingredientes.findIndex(
      i => i.producto_id === ingredienteActual.producto_id
    );
    
    let nuevosIngredientes = [...platilloForm.ingredientes];
    
    if (existeIngrediente >= 0) {
      // Actualizar cantidad si ya existe
      nuevosIngredientes[existeIngrediente].cantidad += ingredienteActual.cantidad;
    } else {
      // Agregar nuevo ingrediente
      nuevosIngredientes.push({
        producto_id: ingredienteActual.producto_id,
        nombre: productoSeleccionado.nombre,
        cantidad: ingredienteActual.cantidad
      });
    }
    
    setPlatilloForm({
      ...platilloForm,
      ingredientes: nuevosIngredientes
    });
    
    // Resetear ingrediente actual
    setIngredienteActual({
      producto_id: '',
      cantidad: 1
    });
  };
  
  // Eliminar ingrediente del platillo
  const handleEliminarIngrediente = (index) => {
    const nuevosIngredientes = [...platilloForm.ingredientes];
    nuevosIngredientes.splice(index, 1);
    
    setPlatilloForm({
      ...platilloForm,
      ingredientes: nuevosIngredientes
    });
  };
  
  // Eliminar ingrediente del formulario de edición
  const handleEliminarIngredienteEdit = (index) => {
    const nuevosIngredientes = [...editForm.ingredientes];
    nuevosIngredientes.splice(index, 1);
    
    setEditForm({
      ...editForm,
      ingredientes: nuevosIngredientes
    });
  };
  
  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'precio' ? parseFloat(value) : value
    });
  };
  
  // Iniciar modo edición - adaptado para MongoDB
  const handleEditMode = (platillo) => {
    setEditForm({
      _id: platillo._id, // Cambiado de id_Platillo a _id
      nombre: platillo.nombre,
      precio: platillo.precio,
      categoria: platillo.categoria,
      ingredientes: platillo.ingredientes || []
    });
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditForm({
      _id: null,
      nombre: '',
      precio: 0,
      categoria: '',
      ingredientes: []
    });
  };
  
  // Guardar platillo editado - adaptado para MongoDB
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!editForm.nombre || editForm.precio <= 0 || !editForm.categoria) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }
    
    try {
      const response = await fetch('/api/platillos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar platillo');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de platillos
      const res = await fetch('/api/platillos');
      const platillosData = await res.json();
      setPlatillos(platillosData);
      
      // Resetear formulario de edición
      handleCancelEdit();
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Enviar formulario para nuevo platillo - adaptado para MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!platilloForm.nombre || platilloForm.precio <= 0 || !platilloForm.categoria) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }
    
    try {
      const response = await fetch('/api/platillos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(platilloForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar platillo');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de platillos
      const res = await fetch('/api/platillos');
      const platillosData = await res.json();
      setPlatillos(platillosData);
      
      // Limpiar formulario
      setPlatilloForm({
        nombre: '',
        precio: 0,
        categoria: '',
        ingredientes: []
      });
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Eliminar platillo - adaptado para MongoDB
  const handleDeletePlatillo = async (id) => {
    if (!confirm('¿Está seguro de eliminar este platillo?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/platillos?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar platillo');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de platillos
      const res = await fetch('/api/platillos');
      const platillosData = await res.json();
      setPlatillos(platillosData);
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Función para obtener un color de badge para cada categoría
  const getCategoryColor = (categoria) => {
    const categories = {
      'Taco': 'bg-green-600',
      'Torta': 'bg-amber-600',
      'Bebida': 'bg-blue-600',
      'Postre': 'bg-purple-600',
      'Combo': 'bg-pink-600'
    };
    
    return categories[categoria] || 'bg-gray-600';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Cargando platillos...</div>
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
        <h1 className="text-2xl font-bold text-white">Gestión de Platillos</h1>
        <Link href="/" className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors">
          Volver al inicio
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de nuevo platillo */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Agregar Nuevo Platillo</h2>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Nombre del Platillo</label>
                <input
                  type="text"
                  name="nombre"
                  value={platilloForm.nombre}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ej. Taco al Pastor"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Precio</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8]">$</span>
                  <input
                    type="number"
                    name="precio"
                    value={platilloForm.precio}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    className="form-input pl-7"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Categoría</label>
                <select
                  name="categoria"
                  value={platilloForm.categoria}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  <option value="Taco">Taco</option>
                  <option value="Torta">Torta</option>
                  <option value="Bebida">Bebida</option>
                  <option value="Postre">Postre</option>
                  <option value="Combo">Combo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              {/* Sección para agregar ingredientes */}
              <div className="mb-4 p-4 border border-[#334155] rounded-lg bg-[#1e293b]">
                <h3 className="text-white font-semibold mb-3">Agregar Ingredientes</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="form-label">Producto</label>
                    <select
                      name="producto_id"
                      value={ingredienteActual.producto_id}
                      onChange={handleIngredienteChange}
                      className="form-select"
                    >
                      <option value="">Seleccionar ingrediente</option>
                      {productos.map(producto => (
                        <option key={producto._id} value={producto._id}>
                          {producto.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      name="cantidad"
                      value={ingredienteActual.cantidad}
                      onChange={handleIngredienteChange}
                      step="0.01"
                      min="0.01"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAgregarIngrediente}
                  className="w-full py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors"
                >
                  Agregar Ingrediente
                </button>
              </div>
              
              {/* Lista de ingredientes agregados */}
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2">Ingredientes</h3>
                
                {platilloForm.ingredientes.length > 0 ? (
                  <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3">
                    <ul className="divide-y divide-[#334155]">
                      {platilloForm.ingredientes.map((ingrediente, index) => (
                        <li key={index} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="text-white">{ingrediente.nombre}</span>
                            <span className="text-[#94a3b8] text-sm ml-2">({ingrediente.cantidad})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEliminarIngrediente(index)}
                            className="text-[#f87171] hover:text-[#ef4444] transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-[#1e293b] border border-[#334155] rounded-lg">
                    <p className="text-[#94a3b8]">No hay ingredientes agregados</p>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full p-3 rounded-lg flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Agregar Platillo
              </button>
            </form>
          </div>
        </div>
        
        {/* Lista de platillos */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Platillos Disponibles</h2>
            <span className="bg-[#38bdf8] text-white text-xs font-bold py-1 px-2 rounded-full">
              {platillos.length} total
            </span>
          </div>
          
          <div className="card-body">
            {platillos.length > 0 ? (
              <div className="space-y-4">
                {platillos.map(platillo => (
                  <div 
                    key={platillo._id}
                    className="p-4 rounded-lg bg-[#1e293b] border border-[#334155] shine flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-2xl mr-2">🌮</span>
                        <h3 className="text-white font-medium">{platillo.nombre}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold py-1 px-2 rounded ${getCategoryColor(platillo.categoria)}`}>
                          {platillo.categoria}
                        </span>
                        <span className="text-[#38bdf8] font-bold">
                          ${parseFloat(platillo.precio).toFixed(2)}
                        </span>
                      </div>
                      {platillo.ingredientes && platillo.ingredientes.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-[#94a3b8]">
                            Ingredientes: {platillo.ingredientes.map(i => i.nombre).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => handleEditMode(platillo)}
                        className="p-2 bg-[#334155] text-[#38bdf8] rounded-lg hover:bg-[#475569] transition-colors"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePlatillo(platillo._id)}
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
                <div className="text-5xl mb-4">🌮</div>
                <p className="text-[#94a3b8] text-center">No hay platillos registrados</p>
                <p className="text-[#94a3b8] text-center text-sm mt-1">Agrega un platillo utilizando el formulario</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de edición */}
      {editForm._id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg w-full max-w-md border border-[#334155]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Editar Platillo</h2>
              <button 
                onClick={handleCancelEdit}
                className="text-[#94a3b8] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div className="mb-4">
                <label className="form-label">Nombre del Platillo</label>
                <input
                  type="text"
                  name="nombre"
                  value={editForm.nombre}
                  onChange={handleEditChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Precio</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8]">$</span>
                  <input
                    type="number"
                    name="precio"
                    value={editForm.precio}
                    onChange={handleEditChange}
                    min="0.01"
                    step="0.01"
                    className="form-input pl-7"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Categoría</label>
                <select
                  name="categoria"
                  value={editForm.categoria}
                  onChange={handleEditChange}
                  className="form-select"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  <option value="Taco">Taco</option>
                  <option value="Torta">Torta</option>
                  <option value="Bebida">Bebida</option>
                  <option value="Postre">Postre</option>
                  <option value="Combo">Combo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              {/* Lista de ingredientes en edición */}
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2">Ingredientes</h3>
                
                {editForm.ingredientes && editForm.ingredientes.length > 0 ? (
                  <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3">
                    <ul className="divide-y divide-[#334155]">
                      {editForm.ingredientes.map((ingrediente, index) => (
                        <li key={index} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="text-white">{ingrediente.nombre}</span>
                            <span className="text-[#94a3b8] text-sm ml-2">({ingrediente.cantidad})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEliminarIngredienteEdit(index)}
                            className="text-[#f87171] hover:text-[#ef4444] transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-[#1e293b] border border-[#334155] rounded-lg">
                    <p className="text-[#94a3b8]">No hay ingredientes agregados</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-[#334155] text-white rounded hover:bg-[#475569]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#38bdf8] text-white rounded hover:bg-[#0ea5e9]"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}