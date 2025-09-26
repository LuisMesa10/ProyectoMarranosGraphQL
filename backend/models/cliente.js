
const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  // Campos básicos - haciendo opcional lo que tu frontend no envía siempre
  nombre: { 
    type: String, 
    required: false,  // Cambiado a opcional temporalmente
    trim: true,
    default: ''
  },
  telefono: { 
    type: String, 
    required: false,  // Cambiado a opcional temporalmente
    trim: true,
    default: ''
  },
  email: { 
    type: String, 
    required: false,  // Cambiado a opcional temporalmente
    unique: false,     // Cambiado a no único temporalmente
    trim: true,
    lowercase: true,
    default: ''
  },
  direccion: { 
    type: String, 
    required: false,  // Cambiado a opcional temporalmente
    trim: true,
    default: ''
  },
  ciudad: { 
    type: String, 
    required: false,  // Cambiado a opcional temporalmente
    trim: true,
    default: ''
  },

  // CAMPOS ORIGINALES (compatibilidad con tu sistema existente)
  cedula: { 
    type: String, 
    required: false,
    unique: false,
    trim: true,
    default: ''
  },
  nombres: { 
    type: String, 
    required: false,
    trim: true,
    default: ''
  },
  apellidos: { 
    type: String, 
    required: false,
    trim: true,
    default: ''
  }
}, { 
  timestamps: true,
  collection: 'clientes'
});

// Middleware pre-save para mapear campos si es necesario
ClienteSchema.pre('save', function(next) {
  // Si tienes nombres/apellidos, combinarlos en nombre
  if (this.nombres && this.apellidos && !this.nombre) {
    this.nombre = this.nombres + ' ' + this.apellidos;
  }

  // Si tienes nombre pero no nombres/apellidos, separarlos
  if (this.nombre && !this.nombres) {
    const parts = this.nombre.split(' ');
    this.nombres = parts[0] || '';
    this.apellidos = parts.slice(1).join(' ') || '';
  }

  next();
});

module.exports = mongoose.model('Cliente', ClienteSchema);