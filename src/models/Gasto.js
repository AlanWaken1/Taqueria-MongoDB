// src/models/Gasto.js
import mongoose from 'mongoose';

const GastoSchema = new mongoose.Schema({
  concepto: {
    type: String,
    required: [true, 'El concepto es requerido'],
    trim: true
  },
  total: {
    type: Number,
    required: [true, 'El total es requerido'],
    min: [0, 'El total no puede ser negativo']
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  compra_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Compra'
  },
  empleado: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado'
    },
    nombre: String
  },
  tipo: {
    type: String,
    enum: ['compra', 'sueldo', 'servicios', 'otro'],
    default: 'otro'
  }
}, {
  timestamps: true
});

// Middleware para asegurar que total es siempre un número válido
GastoSchema.pre('save', function(next) {
  if (isNaN(this.total)) {
    this.total = 0;
  }
  next();
});

export default mongoose.models.Gasto || mongoose.model('Gasto', GastoSchema);