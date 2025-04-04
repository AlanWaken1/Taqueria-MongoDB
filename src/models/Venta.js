// src/models/Venta.js
import mongoose from 'mongoose';

const VentaSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: [true, 'La fecha es requerida'],
    default: Date.now
  },
  hora: {
    type: String,
    required: [true, 'La hora es requerida']
  },
  total: {
    type: Number,
    required: [true, 'El total es requerido'],
    min: [0, 'El total no puede ser negativo'],
    default: 0
  },
  metodo: {
    type: String,
    enum: {
      values: ['efectivo', 'tarjeta'],
      message: '{VALUE} no es un método de pago válido'
    },
    required: [true, 'El método de pago es requerido']
  },
  detalles: [{
    platillo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Platillo'
    },
    nombre: String,
    cantidad: {
      type: Number,
      min: [1, 'La cantidad debe ser al menos 1']
    },
    precio: {
      type: Number,
      min: [0, 'El precio no puede ser negativo']
    }
  }]
}, {
  timestamps: true
});

// Middleware para calcular el total automáticamente
VentaSchema.pre('save', function(next) {
  try {
    if (this.detalles && this.detalles.length > 0) {
      this.total = this.detalles.reduce((sum, item) => {
        return sum + (item.cantidad * item.precio);
      }, 0);
    }
    next();
  } catch (error) {
    console.error("Error en middleware de Venta:", error);
    next(error);
  }
});

export default mongoose.models.Venta || mongoose.model('Venta', VentaSchema);