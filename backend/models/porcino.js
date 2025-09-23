const mongoose = require('mongoose');

const PorcinoSchema = new mongoose.Schema({
    identificacion: { 
        type: String, 
        required: [true, 'La identificación es obligatoria'], 
        unique: true,
        trim: true,
        uppercase: true
    },
    raza: { 
        type: Number, 
        required: [true, 'La raza es obligatoria'], 
        enum: {
            values: [1, 2, 3],
            message: 'La raza debe ser: 1=York, 2=Hampshire, 3=Duroc'
        }
    },
    edad: { 
        type: Number, 
        required: [true, 'La edad es obligatoria'], 
        min: [0, 'La edad no puede ser negativa'],
        max: [120, 'La edad no puede exceder 120 meses']
    },
    peso: { 
        type: Number, 
        required: [true, 'El peso es obligatorio'], 
        min: [0, 'El peso no puede ser negativo'],
        max: [500, 'El peso no puede exceder 500 kg']
    },
    clienteId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cliente', 
        required: [true, 'El cliente es obligatorio']
    },
    alimentacionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Alimentacion', 
        required: [true, 'La alimentación es obligatoria']
    }
}, { 
    timestamps: true,
    collection: 'porcinos'
});

// Método virtual para obtener el nombre de la raza
PorcinoSchema.virtual('razaNombre').get(function() {
    const razas = {
        1: 'York',
        2: 'Hampshire', 
        3: 'Duroc'
    };
    return razas[this.raza];
});

// Incluir virtuals en JSON
PorcinoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Porcino', PorcinoSchema);