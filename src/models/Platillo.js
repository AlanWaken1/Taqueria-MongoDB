// /models/Platillo.js
import mongoose from 'mongoose';

const PlatilloSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    unique: true // Equivalente al trigger para prevenir duplicados
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0.01, 'El precio debe ser mayor que cero']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  ingredientes: [{
    producto_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto'
    },
    nombre: String,
    cantidad: Number
  }]
}, {
  timestamps: true
});

export default mongoose.models.Platillo || mongoose.model('Platillo', PlatilloSchema);