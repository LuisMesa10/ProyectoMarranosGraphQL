const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

// Importar schema y resolvers de GraphQL
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Variable para evitar inicialización múltiple
let serverInitialized = false;

// Middleware para JSON y CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Conexión a MongoDB (sin opciones deprecadas)
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mi_base")
.then(() => {
  if (!serverInitialized) {
    console.log("✅ Conectado a MongoDB");
  }
})
.catch(err => console.error("❌ Error de conexión:", err));

// ========================================
// RUTAS REST (MANTENIENDO FUNCIONAMIENTO ACTUAL)
// ========================================
app.use('/api/clientes', require('./routes/clienteRoute'));
app.use('/api/alimentacion', require('./routes/alimentacionRoutes'));
app.use('/api/porcinos', require('./routes/porcinoRoutes'));

// ========================================
// APOLLO SERVER CONFIGURACIÓN
// ========================================
async function configureApollo() {
  try {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req }) => ({ req }),
      formatError: (error) => {
        console.error('GraphQL Error:', error.message);
        return {
          message: error.message,
          locations: error.locations || [],
          path: error.path || []
        };
      }
    });

    await server.start();
    server.applyMiddleware({ 
      app, 
      path: '/graphql',
      cors: false // Ya tenemos CORS configurado globalmente
    });

    console.log("✅ GraphQL configurado en /graphql");
    return true;
  } catch (error) {
    console.error("❌ Error configurando GraphQL:", error.message);
    return false;
  }
}

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API La Granja S.A. funcionando',
    endpoints: {
      clientes: 'http://localhost:' + PORT + '/api/clientes',
      porcinos: 'http://localhost:' + PORT + '/api/porcinos', 
      alimentacion: 'http://localhost:' + PORT + '/api/alimentacion',
      graphql: 'http://localhost:' + PORT + '/graphql'
    },
    status: 'OK'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error del servidor:', error.message);
  res.status(500).json({
    message: 'Error interno del servidor'
  });
});

// ========================================
// INICIALIZACIÓN DEL SERVIDOR
// ========================================
async function startServer() {
  if (serverInitialized) {
    return;
  }

  serverInitialized = true;

  try {
    console.log('');
    console.log('🚀 Iniciando La Granja S.A. API...');
    console.log('');

    // Configurar Apollo Server
    const apolloReady = await configureApollo();

    // Iniciar servidor Express
    const server = app.listen(PORT, () => {
      console.log('🎉 ==========================================');
      console.log('🐷 LA GRANJA S.A. - SERVIDOR ACTIVO');
      console.log('🎉 ==========================================');
      console.log('');
      console.log('🌐 Servidor corriendo en: http://localhost:' + PORT);
      console.log('');
      console.log('📋 ENDPOINTS REST:');
      console.log('   • Clientes: http://localhost:' + PORT + '/api/clientes');
      console.log('   • Porcinos: http://localhost:' + PORT + '/api/porcinos');
      console.log('   • Alimentación: http://localhost:' + PORT + '/api/alimentacion');
      console.log('');

      if (apolloReady) {
        console.log('🚀 ENDPOINT GRAPHQL:');
        console.log('   • Apollo Sandbox: http://localhost:' + PORT + '/graphql');
        console.log('');
      }

      console.log('🎉 ==========================================');
      console.log('✅ Todos los servicios están funcionando correctamente');
      console.log('🎉 ==========================================');
      console.log('');
    });

    // Manejo de cierre graceful
    process.on('SIGINT', async () => {
      console.log('\n⏹️  Cerrando servidor...');
      server.close();
      await mongoose.connection.close();
      console.log('✅ Servidor cerrado correctamente');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error fatal al iniciar servidor:', error.message);
    process.exit(1);
  }
}

// Inicializar servidor solo una vez
startServer();

module.exports = app;