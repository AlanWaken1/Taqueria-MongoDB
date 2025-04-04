// src/app/api/proveedores/route.js
import { executeTransaction } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Proveedor from '@/models/Proveedor';
import Producto from '@/models/Producto';
import Compra from '@/models/Compra';
import mongoose from 'mongoose';
import { protectRoute, checkRole } from '@/lib/auth';

// Obtener todos los proveedores
export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Todos los usuarios autenticados pueden ver proveedores
    const result = await executeTransaction(async () => {
      // Obtener proveedores
      const proveedores = await Proveedor.find({})
        .sort({ nombre: 1 })
        .lean();
      
      // Para cada proveedor, contar los productos asociados
      for (let i = 0; i < proveedores.length; i++) {
        const numProductos = await Producto.countDocuments({
          'proveedor._id': proveedores[i]._id
        });
        
        proveedores[i].num_productos = numProductos;
      }
      
      return proveedores;
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

// Agregar un nuevo proveedor
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo admin, encargado y tesorero pueden agregar proveedores
    if (!checkRole(authResult.user, ['admin', 'encargado', 'tesorero'])) {
      return NextResponse.json({ error: 'No tienes permisos para agregar proveedores' }, { status: 403 });
    }

    const { nombre, telefono, email } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar el nombre
      if (!nombre || nombre.trim() === "") {
        throw new Error("El nombre del proveedor no puede estar vacío");
      }
      
      // Verificar si ya existe un proveedor con el mismo nombre
      const proveedorExistente = await Proveedor.findOne({ nombre });
      if (proveedorExistente) {
        throw new Error("Ya existe un proveedor con ese nombre");
      }
      
      // Validar formato de email
      if (email && !email.includes('@')) {
        throw new Error("Formato de email inválido");
      }
      
      // Crear el proveedor con información de auditoría
      const proveedor = await Proveedor.create({
        nombre,
        telefono,
        email,
        // Campos de auditoría
        creadoPor: {
          id: authResult.user.id,
          email: authResult.user.email,
          rol: authResult.user.rol
        },
        fechaCreacion: new Date()
      });
      
      return { 
        Mensaje: "Proveedor agregado correctamente",
        proveedor
      };
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

// Actualizar un proveedor
export async function PUT(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo admin, encargado y tesorero pueden actualizar proveedores
    if (!checkRole(authResult.user, ['admin', 'encargado', 'tesorero'])) {
      return NextResponse.json({ error: 'No tienes permisos para modificar proveedores' }, { status: 403 });
    }

    const { _id, nombre, telefono, email } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar que exista el proveedor
      const proveedor = await Proveedor.findById(_id);
      if (!proveedor) {
        throw new Error("El proveedor no existe");
      }
      
      // Validar el nombre
      if (!nombre || nombre.trim() === "") {
        throw new Error("El nombre del proveedor no puede estar vacío");
      }
      
      // Verificar si el nuevo nombre ya existe (excepto para el mismo proveedor)
      const nombreDuplicado = await Proveedor.findOne({ 
        nombre, 
        _id: { $ne: _id } 
      });
      
      if (nombreDuplicado) {
        throw new Error("Ya existe otro proveedor con ese nombre");
      }
      
      // Validar formato de email
      if (email && !email.includes('@')) {
        throw new Error("Formato de email inválido");
      }
      
      // Actualizar el proveedor con información de auditoría
      const proveedorActualizado = await Proveedor.findByIdAndUpdate(
        _id,
        { 
          nombre, 
          telefono, 
          email,
          // Campos de auditoría para actualización
          actualizadoPor: {
            id: authResult.user.id,
            email: authResult.user.email,
            rol: authResult.user.rol
          },
          fechaActualizacion: new Date()
        },
        { new: true, runValidators: true }
      );
      
      // También actualizar el nombre en los productos relacionados
      await Producto.updateMany(
        { 'proveedor._id': _id },
        { 'proveedor.nombre': nombre }
      );
      
      // Y en las compras relacionadas
      await Compra.updateMany(
        { 'proveedor._id': _id },
        { 'proveedor.nombre': nombre }
      );
      
      return { 
        Mensaje: "Proveedor actualizado correctamente",
        proveedor: proveedorActualizado
      };
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

// Eliminar un proveedor
export async function DELETE(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo admin puede eliminar proveedores
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar proveedores' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de proveedor no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async () => {
      // Verificar si hay productos asociados
      const productosAsociados = await Producto.countDocuments({
        'proveedor._id': new mongoose.Types.ObjectId(id)
      });
      
      if (productosAsociados > 0) {
        throw new Error("No se puede eliminar, el proveedor tiene productos asociados");
      }
      
      // Verificar si hay compras asociadas
      const comprasAsociadas = await Compra.countDocuments({
        'proveedor._id': new mongoose.Types.ObjectId(id)
      });
      
      if (comprasAsociadas > 0) {
        throw new Error("No se puede eliminar, el proveedor tiene compras asociadas");
      }
      
      // Obtener información del proveedor para auditoría
      const proveedor = await Proveedor.findById(id);
      if (!proveedor) {
        throw new Error("El proveedor no existe");
      }
      
      // Guardar información para registro de auditoría
      const proveedorInfo = {
        id: proveedor._id,
        nombre: proveedor.nombre,
        telefono: proveedor.telefono,
        email: proveedor.email
      };
      
      // Eliminar el proveedor
      await Proveedor.findByIdAndDelete(id);
      
      // Aquí podrías agregar un registro de auditoría
      // await AuditoriaLog.create({
      //   accion: 'ELIMINAR_PROVEEDOR',
      //   entidad: 'Proveedor',
      //   entidadId: id,
      //   datos: proveedorInfo,
      //   usuarioId: authResult.user.id,
      //   usuarioEmail: authResult.user.email,
      //   usuarioRol: authResult.user.rol,
      //   fecha: new Date()
      // });
      
      return { Mensaje: "Proveedor eliminado correctamente" };
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