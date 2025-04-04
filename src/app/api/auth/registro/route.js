// src/app/api/auth/registro/route.js
import { executeTransaction } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Usuario from '@/models/Usuario';

export async function POST(request) {
  try {
    const { nombre, email, password, rol } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Verificar si el email ya existe
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        throw new Error('Este email ya está registrado');
      }
      
      // Crear nuevo usuario
      const usuario = await Usuario.create({
        nombre,
        email,
        password, // Se hasheará automáticamente gracias al middleware pre-save
        rol: rol || 'mesero' // Rol por defecto si no se especifica
      });
      
      // No devolver el password en la respuesta
      const usuarioResponse = usuario.toObject();
      delete usuarioResponse.password;
      
      return { 
        mensaje: 'Usuario registrado correctamente',
        usuario: usuarioResponse
      };
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