// src/app/api/compras/route.js
import { executeTransaction } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Compra from '@/models/Compra';
import Producto from '@/models/Producto';
import Proveedor from '@/models/Proveedor';
import mongoose from 'mongoose';
import { protectRoute, checkRole } from '@/lib/auth';

// Obtener todas las compras
export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin y encargado pueden ver compras
    if (!checkRole(authResult.user, ['admin', 'encargado'])) {
      return NextResponse.json({ error: 'No tienes permisos para ver compras' }, { status: 403 });
    }

    const result = await executeTransaction(async () => {
      // Obtener todas las compras ordenadas por fecha y hora descendente
      const compras = await Compra.find({})
        .sort({ fecha: -1, hora: -1 })
        .lean();
      
      return compras;
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

// Crear una compra
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin y encargado pueden crear compras
    if (!checkRole(authResult.user, ['admin', 'encargado'])) {
      return NextResponse.json({ error: 'No tienes permisos para registrar compras' }, { status: 403 });
    }

    const { fecha, hora, total, proveedor_id, detalles } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Iniciar sesión de transacción en MongoDB
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Obtener el proveedor para incluir su información
        const proveedor = await Proveedor.findById(proveedor_id).lean();
        if (!proveedor && proveedor_id) {
          throw new Error("El proveedor especificado no existe");
        }
        
        // Crear la compra principal
        const fechaFormateada = fecha || new Date().toISOString().split('T')[0];
        const horaFormateada = hora || new Date().toTimeString().split(' ')[0];
        
        const nuevaCompra = new Compra({
          fecha: new Date(fechaFormateada),
          hora: horaFormateada,
          total: total,
          proveedor: proveedor ? {
            _id: proveedor._id,
            nombre: proveedor.nombre
          } : null,
          detalles: [],
          // Agregar información del usuario que creó la compra
          creadoPor: {
            id: authResult.user.id,
            email: authResult.user.email,
            rol: authResult.user.rol
          }
        });
        
        // Registrar los detalles de la compra y actualizar el stock
        if (detalles && detalles.length > 0) {
          for (const detalle of detalles) {
            // Buscar el producto
            const producto = await Producto.findById(detalle.producto_id).session(session);
            if (!producto) {
              throw new Error(`El producto con ID ${detalle.producto_id} no existe`);
            }
            
            // Añadir el detalle a la compra
            nuevaCompra.detalles.push({
              producto_id: producto._id,
              nombre: producto.nombre,
              cantidad: detalle.cantidad,
              costo_unitario: detalle.costo_unitario
            });
            
            // Actualizar el stock del producto
            await Producto.findByIdAndUpdate(
              producto._id,
              { $inc: { cantidad: detalle.cantidad } },
              { session }
            );
          }
        }
        
        // Guardar la compra
        await nuevaCompra.save({ session });
        
        // Confirmar la transacción
        await session.commitTransaction();
        session.endSession();
        
        return { 
          Mensaje: "Compra registrada correctamente", 
          id_Compra: nuevaCompra._id 
        };
      } catch (error) {
        // Revertir en caso de error
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    });
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Actualizar una compra
export async function PUT(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin y encargado pueden modificar compras
    if (!checkRole(authResult.user, ['admin', 'encargado'])) {
      return NextResponse.json({ error: 'No tienes permisos para modificar compras' }, { status: 403 });
    }

    const { _id, fecha, hora, total, proveedor_id } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Verificar que la compra exista
      const compra = await Compra.findById(_id);
      if (!compra) {
        throw new Error("La compra no existe");
      }
      
      // Si se está actualizando el proveedor, obtener su información
      let proveedorData = compra.proveedor;
      
      if (proveedor_id && (!compra.proveedor || compra.proveedor._id.toString() !== proveedor_id)) {
        const proveedor = await Proveedor.findById(proveedor_id);
        if (!proveedor) {
          throw new Error("El proveedor especificado no existe");
        }
        
        proveedorData = {
          _id: proveedor._id,
          nombre: proveedor.nombre
        };
      }
      
      // Actualizar la compra
      const compraActualizada = await Compra.findByIdAndUpdate(
        _id,
        {
          fecha: fecha ? new Date(fecha) : compra.fecha,
          hora: hora || compra.hora,
          total: total !== undefined ? total : compra.total,
          proveedor: proveedorData,
          // Registrar quién actualizó
          actualizadoPor: {
            id: authResult.user.id,
            email: authResult.user.email,
            rol: authResult.user.rol
          }
        },
        { new: true, runValidators: true }
      );
      
      return { 
        Mensaje: "Compra actualizada correctamente",
        compra: compraActualizada
      };
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

// Eliminar una compra
export async function DELETE(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin puede eliminar compras
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar compras' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de compra no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async () => {
      // Iniciar sesión de transacción
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Buscar la compra
        const compra = await Compra.findById(id).session(session);
        if (!compra) {
          throw new Error("La compra no existe");
        }
        
        // Revertir el inventario si es necesario
        if (compra.detalles && compra.detalles.length > 0) {
          for (const detalle of compra.detalles) {
            // Actualizar el stock del producto (restar lo que se había sumado)
            await Producto.findByIdAndUpdate(
              detalle.producto_id,
              { $inc: { cantidad: -detalle.cantidad } },
              { session }
            );
          }
        }
        
        // Eliminar la compra
        await Compra.findByIdAndDelete(id).session(session);
        
        // Confirmar la transacción
        await session.commitTransaction();
        session.endSession();
        
        return { Mensaje: "Compra eliminada correctamente" };
      } catch (error) {
        // Revertir en caso de error
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
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