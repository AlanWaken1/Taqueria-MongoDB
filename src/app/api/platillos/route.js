// src/app/api/platillos/route.js
import { executeTransaction } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Platillo from '@/models/Platillo';
import Producto from '@/models/Producto';
import Venta from '@/models/Venta';
import mongoose from 'mongoose';

// Obtener todos los platillos
export async function GET() {
  try {
    const result = await executeTransaction(async () => {
      const platillos = await Platillo.find({})
        .sort({ nombre: 1 })
        .lean();
      
      return platillos;
    });
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Agregar un platillo
export async function POST(request) {
  try {
    const { nombre, precio, categoria, ingredientes } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar el nombre
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre del platillo no puede estar vacío');
      }
      
      // Validar el precio
      if (!precio || precio <= 0) {
        throw new Error('El precio no puede ser negativo o quedarse en 0');
      }
      
      // Validar la categoría
      if (!categoria || categoria.trim() === '') {
        throw new Error('La categoría no puede estar vacía');
      }
      
      // Verificar si ya existe un platillo con el mismo nombre
      const platilloExistente = await Platillo.findOne({ nombre });
      if (platilloExistente) {
        throw new Error('Ya existe un platillo con ese nombre');
      }
      
      // Procesar ingredientes si se proporcionaron
      let ingredientesProcessed = [];
      if (ingredientes && ingredientes.length > 0) {
        for (const ingrediente of ingredientes) {
          const producto = await Producto.findById(ingrediente.producto_id);
          if (!producto) {
            throw new Error(`El producto con ID ${ingrediente.producto_id} no existe`);
          }
          
          ingredientesProcessed.push({
            producto_id: producto._id,
            nombre: producto.nombre,
            cantidad: ingrediente.cantidad
          });
        }
      }
      
      // Crear el platillo
      const platillo = await Platillo.create({
        nombre,
        precio,
        categoria,
        ingredientes: ingredientesProcessed
      });
      
      return { Mensaje: "Platillo agregado correctamente", platillo };
    });
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ Mensaje: `Error: ${result.error}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Actualizar un platillo
export async function PUT(request) {
  try {
    const { _id, nombre, precio, categoria, ingredientes } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Verificar que el platillo exista
      const platillo = await Platillo.findById(_id);
      if (!platillo) {
        throw new Error('El platillo no existe');
      }
      
      // Validar el nombre
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre del platillo no puede estar vacío');
      }
      
      // Validar el precio
      if (!precio || precio <= 0) {
        throw new Error('El precio no puede ser negativo');
      }
      
      // Validar la categoría
      if (!categoria || categoria.trim() === '') {
        throw new Error('La categoría no puede estar vacía');
      }
      
      // Verificar si ya existe otro platillo con el mismo nombre
      const platilloExistente = await Platillo.findOne({ 
        nombre, 
        _id: { $ne: _id } 
      });
      
      if (platilloExistente) {
        throw new Error('Ya existe otro platillo con ese nombre');
      }
      
      // Procesar ingredientes si se proporcionaron
      let ingredientesProcessed = platillo.ingredientes;
      if (ingredientes) {
        ingredientesProcessed = [];
        for (const ingrediente of ingredientes) {
          const producto = await Producto.findById(ingrediente.producto_id);
          if (!producto) {
            throw new Error(`El producto con ID ${ingrediente.producto_id} no existe`);
          }
          
          ingredientesProcessed.push({
            producto_id: producto._id,
            nombre: producto.nombre,
            cantidad: ingrediente.cantidad
          });
        }
      }
      
      // Actualizar el platillo
      const platilloActualizado = await Platillo.findByIdAndUpdate(
        _id,
        {
          nombre,
          precio,
          categoria,
          ingredientes: ingredientesProcessed
        },
        { new: true, runValidators: true }
      );
      
      return { Mensaje: "El platillo fue modificado", platillo: platilloActualizado };
    });
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ Mensaje: `Error: ${result.error}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Eliminar un platillo
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de platillo no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async () => {
      // Verificar si hay ventas que incluyen este platillo
      const ventasConPlatillo = await Venta.countDocuments({
        'detalles.platillo_id': new mongoose.Types.ObjectId(id)
      });
      
      if (ventasConPlatillo > 0) {
        throw new Error('No se puede eliminar el platillo porque está asociado a ventas');
      }
      
      // Eliminar el platillo
      const platilloEliminado = await Platillo.findByIdAndDelete(id);
      
      if (!platilloEliminado) {
        throw new Error('El platillo no existe');
      }
      
      return { Mensaje: "El platillo fue eliminado" };
    });
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ Mensaje: `Error: ${result.error}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}