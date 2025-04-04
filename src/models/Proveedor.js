// /models/Proveedor.js
import mongoose from 'mongoose';

const ProveedorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  telefono: String,
  email: {
    type: String,
    match: [/\S+@\S+\.\S+/, 'Por favor, ingrese un email válido']
  }
}, {
  timestamps: true
});

// Middleware para normalizar el nombre (como el trigger en MySQL)
ProveedorSchema.pre('save', function(next) {
  if (this.nombre && this.nombre.length > 0) {
    this.nombre = this.nombre.charAt(0).toUpperCase() + this.nombre.slice(1).toLowerCase();
  }
  next();
});

export default mongoose.models.Proveedor || mongoose.model('Proveedor', ProveedorSchema);