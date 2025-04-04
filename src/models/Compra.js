// /models/Compra.js
import mongoose from 'mongoose';

const CompraSchema = new mongoose.Schema({
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
    min: [0, 'El total no puede ser negativo']
  },
  proveedor: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor'
    },
    nombre: String
  },
  detalles: [{
    producto_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto'
    },
    nombre: String,
    cantidad: {
      type: Number,
      min: [0, 'La cantidad no puede ser negativa']
    },
    costo_unitario: {
      type: Number,
      min: [0, 'El costo unitario no puede ser negativo']
    }
  }]
}, {
  timestamps: true
});

export default mongoose.models.Compra || mongoose.model('Compra', CompraSchema);