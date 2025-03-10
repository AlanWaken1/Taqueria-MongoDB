// src/app/api/compras/route.js
import { executeTransaction } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener todas las compras
export async function GET() {
  try {
    const result = await executeTransaction(async (connection) => {
      const [compras] = await connection.execute(`
        SELECT c.*, p.nombre as proveedor_nombre
        FROM Compras c
        LEFT JOIN Proveedores p ON c.id_Proveedor = p.id_Proveedor
        ORDER BY c.fecha DESC, c.hora DESC
      `);
      
      // Para cada compra, obtener sus detalles
      for (let i = 0; i < compras.length; i++) {
        const [detalles] = await connection.execute(`
          SELECT cp.*, p.nombre as producto_nombre
          FROM Compra_Producto cp
          LEFT JOIN Productos p ON cp.id_Producto = p.id_Producto
          WHERE cp.id_Compra = ?
        `, [compras[i].id_Compra]);
        
        compras[i].detalles = detalles;
      }
      
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
    const { fecha, hora, total, id_Proveedor, detalles } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Iniciar transacción
      await connection.beginTransaction();
      
      try {
        // Crear la compra principal
        const [compraResult] = await connection.execute(
          'CALL CrearCompra(?, ?, ?, ?)',
          [fecha || new Date().toISOString().split('T')[0], 
           hora || new Date().toTimeString().split(' ')[0], 
           total, id_Proveedor]
        );
        
        // Obtener el ID de la compra recién creada
        const [idResult] = await connection.execute('SELECT LAST_INSERT_ID() as id');
        const idCompra = idResult[0].id;
        
        // Registrar los detalles de la compra
        if (detalles && detalles.length > 0) {
          for (const detalle of detalles) {
            // Insertar en la tabla de relación
            await connection.execute(
              'INSERT INTO Compra_Producto (id_Compra, id_Producto, cantidad, costo_unitario) VALUES (?, ?, ?, ?)',
              [idCompra, detalle.id_Producto, detalle.cantidad, detalle.costo_unitario]
            );
            
            // Actualizar el stock del producto
            await connection.execute(
              'CALL sp_updateProducto(?, ?)',
              [detalle.id_Producto, detalle.cantidad]
            );
          }
        }
        
        // Confirmar la transacción
        await connection.commit();
        
        return { 
          Mensaje: "Compra registrada correctamente", 
          id_Compra: idCompra 
        };
      } catch (error) {
        // Revertir en caso de error
        await connection.rollback();
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
    const { id_Compra, fecha, hora, total, id_Proveedor } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado ActualizarCompra
      const [rows] = await connection.execute(
        'CALL ActualizarCompra(?, ?, ?, ?, ?)',
        [id_Compra, fecha, hora, total, id_Proveedor]
      );
      
      return { Mensaje: "Compra actualizada correctamente" };
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de compra no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado EliminarCompra
      const [rows] = await connection.execute('CALL EliminarCompra(?)', [id]);
      return { Mensaje: "Compra eliminada correctamente" };
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