
// script_migracion_datos.js - Ejecutar una vez para actualizar datos existentes
const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Cliente = require('./models/cliente');
const Alimentacion = require('./models/alimentacion');

async function migrarDatos() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mi_base");
    console.log("✅ Conectado a MongoDB para migración");

    let clientesActualizados = 0;
    let alimentacionesActualizadas = 0;

    // ===== MIGRAR CLIENTES =====
    console.log("\n📋 Migrando clientes...");

    const clientes = await Cliente.find({});
    console.log(`📊 Encontrados ${clientes.length} clientes`);

    for (const cliente of clientes) {
      let actualizado = false;

      // Si no tiene 'nombre' pero tiene nombres/apellidos, crear nombre
      if (!cliente.nombre && (cliente.nombres || cliente.apellidos)) {
        cliente.nombre = `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();
        actualizado = true;
        console.log(`📝 Cliente ${cliente._id}: Agregado nombre "${cliente.nombre}"`);
      }

      // Si no tiene nombres/apellidos pero tiene nombre, dividir nombre
      if (cliente.nombre && (!cliente.nombres && !cliente.apellidos)) {
        const partes = cliente.nombre.split(' ');
        cliente.nombres = partes[0] || '';
        cliente.apellidos = partes.slice(1).join(' ') || '';
        actualizado = true;
        console.log(`📝 Cliente ${cliente._id}: Dividido "${cliente.nombre}" en nombres/apellidos`);
      }

      // Asegurar campos por defecto
      if (!cliente.telefono) { cliente.telefono = ''; actualizado = true; }
      if (!cliente.email) { cliente.email = ''; actualizado = true; }
      if (!cliente.direccion) { cliente.direccion = ''; actualizado = true; }
      if (!cliente.ciudad) { cliente.ciudad = ''; actualizado = true; }
      if (!cliente.cedula) { cliente.cedula = ''; actualizado = true; }

      if (actualizado) {
        await cliente.save();
        clientesActualizados++;
      }
    }

    // ===== MIGRAR ALIMENTACIONES =====
    console.log("\n🌾 Migrando alimentaciones...");

    const alimentaciones = await Alimentacion.find({});
    console.log(`📊 Encontradas ${alimentaciones.length} alimentaciones`);

    for (const alimentacion of alimentaciones) {
      let actualizado = false;

      // Si no tiene 'tipoComida' pero tiene descripcion, usar descripcion
      if (!alimentacion.tipoComida && alimentacion.descripcion) {
        alimentacion.tipoComida = alimentacion.descripcion;
        actualizado = true;
        console.log(`📝 Alimentación ${alimentacion._id}: tipoComida = "${alimentacion.tipoComida}"`);
      }

      // Si no tiene descripcion pero tiene tipoComida, usar tipoComida
      if (!alimentacion.descripcion && alimentacion.tipoComida) {
        alimentacion.descripcion = alimentacion.tipoComida;
        actualizado = true;
        console.log(`📝 Alimentación ${alimentacion._id}: descripcion = "${alimentacion.descripcion}"`);
      }

      // Asegurar campos por defecto
      if (!alimentacion.marca) { 
        alimentacion.marca = 'Sin especificar'; 
        actualizado = true; 
      }
      if (alimentacion.cantidad === undefined || alimentacion.cantidad === null) { 
        alimentacion.cantidad = 0; 
        actualizado = true; 
      }
      if (alimentacion.precio === undefined || alimentacion.precio === null) { 
        alimentacion.precio = 0; 
        actualizado = true; 
      }
      if (!alimentacion.dosis) { 
        alimentacion.dosis = ''; 
        actualizado = true; 
      }

      if (actualizado) {
        await alimentacion.save();
        alimentacionesActualizadas++;
      }
    }

    console.log("\n🎉 ==========================================");
    console.log("✅ MIGRACIÓN COMPLETADA");
    console.log("🎉 ==========================================");
    console.log(`📋 Clientes actualizados: ${clientesActualizados}`);
    console.log(`🌾 Alimentaciones actualizadas: ${alimentacionesActualizadas}`);
    console.log("🎉 ==========================================");

  } catch (error) {
    console.error("❌ Error en migración:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("✅ Conexión cerrada");
  }
}

// Ejecutar migración
migrarDatos();
