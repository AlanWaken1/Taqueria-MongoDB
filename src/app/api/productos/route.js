// src/app/api/productos/route.js
import { executeTransaction } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener todos los productos
export async function GET() {
  try {
    const result = await executeTransaction(async (connection) => {
      const [rows] = await connection.execute(`
        SELECT p.*, pr.nombre as proveedor_nombre 
        FROM Productos p
        LEFT JOIN Proveedores pr ON p.id_Proveedor = pr.id_Proveedor
        ORDER BY p.nombre
      `);
      return rows;
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

// Agregar o actualizar un producto usando el procedimiento almacenado
export async function POST(request) {
  try {
    const { nombre, cantidad, id_Proveedor, fecha_llegada, categoria } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_addProductos
      const [rows] = await connection.execute(
        'CALL sp_addProductos(?, ?, ?)',
        [nombre, cantidad, id_Proveedor]
      );
      
      return rows[0]; // Los procedimientos devuelven resultados en un array
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

// Actualizar cantidad de un producto
export async function PUT(request) {
  try {
    const { id_Producto, cantidad } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_updateProducto
      const [rows] = await connection.execute(
        'CALL sp_updateProducto(?, ?)',
        [id_Producto, cantidad]
      );
      
      return rows[0];
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

// Eliminar un producto
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de producto no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_deleteProducto
      const [rows] = await connection.execute('CALL sp_deleteProducto(?)', [id]);
      return rows[0];
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