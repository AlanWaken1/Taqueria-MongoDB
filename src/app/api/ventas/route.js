// src/app/api/ventas/route.js
import { executeTransaction } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener todas las ventas
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');

    const result = await executeTransaction(async (connection) => {
      if (fecha_inicio && fecha_fin) {
        // Si hay fechas, obtener el total de ventas en ese rango
        const [rows] = await connection.execute(
          'CALL sp_obtenerTotalVentas(?, ?, @total)',
          [fecha_inicio, fecha_fin]
        );
        
        // Obtener el valor de la variable de salida
        const [total] = await connection.execute('SELECT @total as total');
        return { total: total[0].total };
      } else {
        // Obtener todas las ventas con detalles
        const [ventas] = await connection.execute(`
          SELECT v.*, GROUP_CONCAT(vp.id_Platillo) as platillos_ids, 
                 GROUP_CONCAT(vp.cantidad) as platillos_cantidades,
                 GROUP_CONCAT(vp.precio) as platillos_precios,
                 GROUP_CONCAT(p.nombre) as platillos_nombres
          FROM Ventas v
          LEFT JOIN Venta_Platillo vp ON v.id_Venta = vp.id_Venta
          LEFT JOIN Platillos p ON vp.id_Platillo = p.id_Platillo
          GROUP BY v.id_Venta
          ORDER BY v.fecha DESC, v.hora DESC
        `);
        
        // Procesar los datos para mejor estructura
        const ventasFormateadas = ventas.map(venta => {
          const platillosIds = venta.platillos_ids ? venta.platillos_ids.split(',') : [];
          const platillosCantidades = venta.platillos_cantidades ? venta.platillos_cantidades.split(',') : [];
          const platillosPrecios = venta.platillos_precios ? venta.platillos_precios.split(',') : [];
          const platillosNombres = venta.platillos_nombres ? venta.platillos_nombres.split(',') : [];
          
          const detalles = platillosIds.map((id, index) => ({
            id_Platillo: id,
            nombre: platillosNombres[index] || 'Desconocido',
            cantidad: parseInt(platillosCantidades[index] || 0),
            precio: parseFloat(platillosPrecios[index] || 0)
          }));
          
          return {
            id_Venta: venta.id_Venta,
            fecha: venta.fecha,
            hora: venta.hora,
            total: venta.total,
            metodo: venta.metodo,
            detalles
          };
        });
        
        return ventasFormateadas;
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

// Registrar una venta
export async function POST(request) {
  try {
    const { fecha, hora, metodo, detalles } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Iniciar transacción
      await connection.beginTransaction();
      
      try {
        // Registrar la venta principal
        const [resultVenta] = await connection.execute(
          'CALL sp_registrarVenta(?, ?, ?, @id_venta)',
          [fecha || new Date().toISOString().split('T')[0], 
           hora || new Date().toTimeString().split(' ')[0], 
           metodo || 'efectivo']
        );
        
        // Obtener el ID de la venta recién creada
        const [idResult] = await connection.execute('SELECT @id_venta as id');
        const idVenta = idResult[0].id;
        
        // Registrar los detalles de la venta
        if (detalles && detalles.length > 0) {
          for (const detalle of detalles) {
            await connection.execute(
              'INSERT INTO Venta_Platillo (id_Venta, id_Platillo, cantidad, precio) VALUES (?, ?, ?, ?)',
              [idVenta, detalle.id_Platillo, detalle.cantidad, detalle.precio]
            );
          }
        }
        
        // Confirmar la transacción
        await connection.commit();
        
        return { 
          Mensaje: "Venta registrada correctamente", 
          id_Venta: idVenta 
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

// Eliminar una venta
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de venta no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_eliminarVenta
      const [rows] = await connection.execute('CALL sp_eliminarVenta(?)', [id]);
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