const mongoose = require('mongoose');


const ClienteSchema = new mongoose.Schema({
cedula: { type: String, required: true, unique: true },
nombres: { type: String, required: true },
apellidos: { type: String, required: true },
direccion: { type: String, default: '' },
telefono: { type: String, default: '' }
}, { timestamps: true });


module.exports = mongoose.model('Cliente', ClienteSchema);