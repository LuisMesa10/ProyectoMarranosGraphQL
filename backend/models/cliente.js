
const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  telefono: { 
    type: String, 
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'El email es obligatorio'],
    unique: true,  // Solo aquí, no duplicar con index()
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email no válido'
    }
  },
  direccion: { 
    type: String, 
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  ciudad: { 
    type: String, 
    required: [true, 'La ciudad es obligatoria'],
    trim: true
  }
}, { 
  timestamps: true,
  collection: 'clientes'
});

// NO duplicar índices - unique: true ya crea el índice
// Comentar o eliminar estas líneas si las tienes:
// ClienteSchema.index({ email: 1 });

module.exports = mongoose.model('Cliente', ClienteSchema);
