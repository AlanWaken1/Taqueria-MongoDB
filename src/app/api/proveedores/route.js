// src/app/api/proveedores/route.js
import { executeTransaction } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener todos los proveedores
export async function GET() {
  try {
    const result = await executeTransaction(async (connection) => {
      const [rows] = await connection.execute(`
        SELECT p.*, 
               (SELECT COUNT(*) FROM Productos WHERE id_Proveedor = p.id_Proveedor) as num_productos
        FROM Proveedores p
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

// Agregar un nuevo proveedor
export async function POST(request) {
  try {
    const { nombre, telefono, email } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_addProveedor
      const [rows] = await connection.execute(
        'CALL sp_addProveedor(?, ?, ?)',
        [nombre, telefono, email]
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

// Actualizar un proveedor
export async function PUT(request) {
  try {
    const { id_Proveedor, nombre, telefono, email } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_updateProveedor
      const [rows] = await connection.execute(
        'CALL sp_updateProveedor(?, ?, ?, ?)',
        [id_Proveedor, nombre, telefono, email]
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

// Eliminar un proveedor
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de proveedor no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_deleteProveedor
      const [rows] = await connection.execute('CALL sp_deleteProveedor(?)', [id]);
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