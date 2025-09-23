const mongoose = require('mongoose');

const AlimentacionSchema = new mongoose.Schema({
    descripcion: { 
        type: String, 
        required: [true, 'La descripción es obligatoria'],
        trim: true,
        maxlength: [200, 'La descripción no puede exceder 200 caracteres']
    },
    dosis: { 
        type: String, 
        default: '',
        trim: true,
        maxlength: [100, 'La dosis no puede exceder 100 caracteres']
    }
}, { 
    timestamps: true,
    collection: 'alimentaciones' // Nombre de colección más claro
});

// Middleware para capitalizar la primera letra
AlimentacionSchema.pre('save', function(next) {
    if (this.descripcion) {
        this.descripcion = this.descripcion.charAt(0).toUpperCase() + this.descripcion.slice(1);
    }
    next();
});

module.exports = mongoose.model('Alimentacion', AlimentacionSchema);