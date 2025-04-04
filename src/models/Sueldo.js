// /models/Sueldo.js
import mongoose from 'mongoose';

const SueldoSchema = new mongoose.Schema({
  puesto: {
    type: String,
    required: [true, 'El puesto es requerido'],
    trim: true
  },
  sueldo: {
    type: Number,
    required: [true, 'El sueldo es requerido'],
    min: [0, 'El sueldo no puede ser negativo']
  }
}, {
  timestamps: true
});

// Validar que el sueldo no sea negativo
SueldoSchema.pre('save', function(next) {
  if (this.sueldo < 0) {
    const error = new Error('El sueldo no puede ser negativo');
    return next(error);
  }
  next();
});

export default mongoose.models.Sueldo || mongoose.model('Sueldo', SueldoSchema);