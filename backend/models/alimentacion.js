
const mongoose = require('mongoose');

const AlimentacionSchema = new mongoose.Schema({
  // Campos que coinciden exactamente con el schema GraphQL
  tipoComida: {
    type: String,
    required: false, // Temporal para evitar errores
    trim: true,
    default: ''
  },
  marca: {
    type: String,
    required: false, // Temporal para evitar errores
    trim: true,
    default: ''
  },
  cantidad: {
    type: Number,
    required: false, // Temporal para evitar errores
    min: 0,
    default: 0
  },
  precio: {
    type: Number,
    required: false, // Temporal para evitar errores
    min: 0,
    default: 0
  },

  // MANTENER campos originales para compatibilidad
  descripcion: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  dosis: {
    type: String,
    required: false,
    trim: true,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'alimentaciones'
});

// Middleware para mapear campos automáticamente
AlimentacionSchema.pre('save', function(next) {
  // Si tienes descripcion pero no tipoComida, usar descripcion como tipoComida
  if (this.descripcion && !this.tipoComida) {
    this.tipoComida = this.descripcion;
  }

  // Si tienes tipoComida pero no descripcion, usar tipoComida como descripcion
  if (this.tipoComida && !this.descripcion) {
    this.descripcion = this.tipoComida;
  }

  // Valores por defecto para campos nuevos
  if (!this.marca && this.descripcion) {
    this.marca = 'Sin especificar';
  }

  if (!this.cantidad) {
    this.cantidad = 0;
  }

  if (!this.precio) {
    this.precio = 0;
  }

  next();
});

module.exports = mongoose.model('Alimentacion', AlimentacionSchema);
