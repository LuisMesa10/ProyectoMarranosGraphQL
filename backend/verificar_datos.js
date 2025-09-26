
// verificar_datos.js - Script para verificar que los datos están correctos
const mongoose = require('mongoose');
require('dotenv').config();

const Cliente = require('./models/cliente');
const Alimentacion = require('./models/alimentacion');

async function verificarDatos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mi_base");
    console.log("✅ Conectado para verificación");

    // Verificar clientes
    console.log("\n📋 VERIFICANDO CLIENTES...");
    const clientes = await Cliente.find({}).limit(5);

    clientes.forEach((cliente, index) => {
      console.log(`\n👤 Cliente ${index + 1}:`);
      console.log(`   ID: ${cliente._id}`);
      console.log(`   nombre: "${cliente.nombre || 'VACÍO'}"`);
      console.log(`   nombres: "${cliente.nombres || 'VACÍO'}"`);
      console.log(`   apellidos: "${cliente.apellidos || 'VACÍO'}"`);
      console.log(`   telefono: "${cliente.telefono || 'VACÍO'}"`);
      console.log(`   email: "${cliente.email || 'VACÍO'}"`);
      console.log(`   cedula: "${cliente.cedula || 'VACÍO'}"`);
    });

    // Verificar alimentaciones
    console.log("\n🌾 VERIFICANDO ALIMENTACIONES...");
    const alimentaciones = await Alimentacion.find({}).limit(3);

    alimentaciones.forEach((alimentacion, index) => {
      console.log(`\n🌾 Alimentación ${index + 1}:`);
      console.log(`   ID: ${alimentacion._id}`);
      console.log(`   tipoComida: "${alimentacion.tipoComida || 'VACÍO'}"`);
      console.log(`   marca: "${alimentacion.marca || 'VACÍO'}"`);
      console.log(`   descripcion: "${alimentacion.descripcion || 'VACÍO'}"`);
      console.log(`   cantidad: ${alimentacion.cantidad || 0}`);
      console.log(`   precio: ${alimentacion.precio || 0}`);
    });

    console.log("\n✅ Verificación completada");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

verificarDatos();
