// /models/Empleado.js
import mongoose from 'mongoose';

const EmpleadoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  telefono: String,
  email: {
    type: String,
    match: [/\S+@\S+\.\S+/, 'Por favor, ingrese un email válido']
  },
  puesto: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sueldo'
    },
    puesto: String,
    sueldo: Number
  }
}, {
  timestamps: true
});

// Middleware para validar correo electrónico (similar al trigger en MySQL)
EmpleadoSchema.pre('save', function(next) {
  if (this.email && !(/\S+@\S+\.\S+/).test(this.email)) {
    this.email = 'correo_invalido@example.com';
  }
  next();
});

export default mongoose.models.Empleado || mongoose.model('Empleado', EmpleadoSchema);