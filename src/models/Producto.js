// /models/Producto.js
import mongoose from 'mongoose';

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [0, 'La cantidad no puede ser negativa'],
    default: 0
  },
  fecha_llegada: {
    type: Date,
    default: Date.now
  },
  categoria: {
    type: String,
    enum: {
      values: ['refrescos', 'alimentos', 'artículos de limpieza'],
      message: '{VALUE} no es una categoría válida'
    },
    default: 'alimentos'
  },
  proveedor: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor'
    },
    nombre: String
  }
}, {
  timestamps: true
});

export default mongoose.models.Producto || mongoose.model('Producto', ProductoSchema);