// src/app/api/productos/route.js
import { executeTransaction } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Producto from '@/models/Producto';
import Proveedor from '@/models/Proveedor';
import Platillo from '@/models/Platillo';
import Compra from '@/models/Compra';
import mongoose from 'mongoose';
import { protectRoute, checkRole } from '@/lib/auth';

// Obtener todos los productos
export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo los usuarios autenticados pueden ver el inventario, sin restricción adicional de roles
    const result = await executeTransaction(async () => {
      const productos = await Producto.find({})
        .sort({ nombre: 1 })
        .lean();
      
      return productos;
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

// Agregar o actualizar un producto
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin, encargado y tesorero pueden agregar productos
    if (!checkRole(authResult.user, ['admin', 'encargado', 'tesorero'])) {
      return NextResponse.json({ error: 'No tienes permisos para agregar productos' }, { status: 403 });
    }

    const { nombre, cantidad, proveedor_id, fecha_llegada, categoria } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar datos
      if (!nombre || nombre.trim() === "") {
        throw new Error("El nombre del producto no puede estar vacío");
      }
      
      if (cantidad < 0) {
        throw new Error("La cantidad no puede ser negativa");
      }
      
      // Verificar si existe el proveedor
      let proveedor = null;
      if (proveedor_id) {
        proveedor = await Proveedor.findById(proveedor_id);
        if (!proveedor) {
          throw new Error("El proveedor no existe");
        }
      }
      
      // Verificar si el producto ya existe
      const productoExistente = await Producto.findOne({ nombre });
      
      if (productoExistente) {
        // Actualizar producto existente con información de auditoría
        const productoActualizado = await Producto.findByIdAndUpdate(
          productoExistente._id,
          {
            cantidad: productoExistente.cantidad + cantidad,
            proveedor: proveedor ? {
              _id: proveedor._id,
              nombre: proveedor.nombre
            } : productoExistente.proveedor,
            // Campos de auditoría para actualización
            actualizadoPor: {
              id: authResult.user.id,
              email: authResult.user.email,
              rol: authResult.user.rol
            },
            fechaActualizacion: new Date()
          },
          { new: true }
        );
        
        return { 
          Mensaje: "Producto actualizado correctamente",
          producto: productoActualizado
        };
      } else {
        // Crear nuevo producto con información de auditoría
        const nuevoProducto = await Producto.create({
          nombre,
          cantidad,
          fecha_llegada: fecha_llegada || new Date(),
          categoria: categoria || 'alimentos',
          proveedor: proveedor ? {
            _id: proveedor._id,
            nombre: proveedor.nombre
          } : null,
          // Campos de auditoría
          creadoPor: {
            id: authResult.user.id,
            email: authResult.user.email,
            rol: authResult.user.rol
          },
          fechaCreacion: new Date()
        });
        
        return { 
          Mensaje: "Nuevo producto agregado",
          producto: nuevoProducto
        };
      }
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

// Actualizar cantidad de un producto
export async function PUT(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - múltiples roles pueden actualizar cantidades
    if (!checkRole(authResult.user, ['admin', 'encargado', 'cocinero', 'tesorero'])) {
      return NextResponse.json({ error: 'No tienes permisos para actualizar productos' }, { status: 403 });
    }

    const { _id, cantidad } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar cantidad
      if (cantidad < 0) {
        throw new Error("La cantidad no puede ser negativa");
      }
      
      // Verificar que el producto exista
      const producto = await Producto.findById(_id);
      if (!producto) {
        throw new Error("El producto no existe");
      }
      
      // Actualizar cantidad con información de auditoría
      const productoActualizado = await Producto.findByIdAndUpdate(
        _id,
        { 
          cantidad,
          // Campos de auditoría para actualización
          actualizadoPor: {
            id: authResult.user.id,
            email: authResult.user.email,
            rol: authResult.user.rol
          },
          fechaActualizacion: new Date()
        },
        { new: true }
      );
      
      return { 
        Mensaje: "Cantidad actualizada correctamente",
        producto: productoActualizado
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

// Eliminar un producto
export async function DELETE(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin puede eliminar productos
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar productos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de producto no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async () => {
      // Verificar que exista el producto
      const producto = await Producto.findById(id);
      if (!producto) {
        throw new Error("El producto no existe");
      }
      
      // Verificar si hay compras relacionadas
      const comprasConProducto = await Compra.countDocuments({
        'detalles.producto_id': new mongoose.Types.ObjectId(id)
      });
      
      if (comprasConProducto > 0) {
        throw new Error("No se puede eliminar, el producto tiene compras registradas");
      }
      
      // Verificar si hay platillos relacionados
      const platillosConProducto = await Platillo.countDocuments({
        'ingredientes.producto_id': new mongoose.Types.ObjectId(id)
      });
      
      if (platillosConProducto > 0) {
        throw new Error("No se puede eliminar, el producto es utilizado en platillos");
      }
      
      // Guardar información para auditoría
      const productoInfo = {
        id: producto._id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        proveedor: producto.proveedor
      };
      
      // Eliminar el producto
      await Producto.findByIdAndDelete(id);
      
      // Aquí podrías crear un registro de auditoría
      // await AuditoriaLog.create({
      //   accion: 'ELIMINAR_PRODUCTO',
      //   entidad: 'Producto',
      //   entidadId: id,
      //   datos: productoInfo,
      //   usuarioId: authResult.user.id,
      //   usuarioEmail: authResult.user.email,
      //   usuarioRol: authResult.user.rol,
      //   fecha: new Date()
      // });
      
      return { Mensaje: "Producto eliminado correctamente" };
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