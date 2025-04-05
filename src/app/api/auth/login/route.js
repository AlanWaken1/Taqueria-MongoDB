// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import Usuario from '@/models/Usuario';
import { generateToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb'; // Añade esto

// src/app/api/auth/login/route.js
export async function POST(request) {
  try {
    // 1. Conectar primero a MongoDB
    await connectToDatabase();
    console.log('[DEBUG] Conexión a MongoDB OK');

    const { email, password } = await request.json();
    
    // 2. Quitar .lean() para mantener los métodos de Mongoose
    const usuario = await Usuario.findOne({ email });
    console.log('[DEBUG] Resultado de findOne:', usuario ? 'Usuario encontrado' : 'Usuario no encontrado'); 
    
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ 
        error: 'Credenciales inválidas' 
      }, { status: 401 });
    }

    // 3. Usar el método correcto para comparar contraseñas
    const passwordValido = await usuario.compararPassword(password);
    console.log('[DEBUG] Resultado de compararPassword:', passwordValido);
    
    if (!passwordValido) {
      return NextResponse.json({ 
        error: 'Credenciales inválidas' 
      }, { status: 401 });
    }

    // 4. Actualizar y guardar correctamente (sin .lean())
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    // 5. Generar token con datos limpios
    const usuarioParaToken = {
      _id: usuario._id,
      email: usuario.email,
      rol: usuario.rol
    };
    
    const token = generateToken(usuarioParaToken);
    
    // Log para depuración (truncar el token por seguridad)
    console.log('[DEBUG] Token generado:', token.substring(0, 15) + '...');

    return NextResponse.json({ 
      mensaje: 'Inicio exitoso',
      usuario: usuarioParaToken,
      token 
    });

  } catch (error) {
    console.error('Error detallado:', error);
    return NextResponse.json({ 
      error: `Error interno: ${error.message}` 
    }, { status: 500 });
  }
}