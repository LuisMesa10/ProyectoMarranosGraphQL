
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

// CORS específico para Apollo
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://studio.apollographql.com',
    'http://localhost:3000'
  ],
  credentials: true
}));

// CRÍTICO: NO usar express.json() aquí para evitar conflictos
// Apollo Server manejará su propio body parsing

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mi_base")
.then(() => {
  if (!serverInitialized) {
    console.log("✅ Conectado a MongoDB");
  }
})
.catch(err => console.error("❌ Error de conexión:", err));

// ========================================
// RUTAS REST CON BODY PARSING ESPECÍFICO
// ========================================
// Solo para rutas REST, usar body parsing específico
const restRouter = express.Router();
restRouter.use(express.json({ limit: '10mb' }));

// Aplicar rutas REST al router específico
restRouter.use('/clientes', require('./routes/clienteRoute'));
restRouter.use('/alimentacion', require('./routes/alimentacionRoutes'));
restRouter.use('/porcinos', require('./routes/porcinoRoutes'));

// Montar el router REST en /api
app.use('/api', restRouter);

// ========================================
// APOLLO SERVER SIN CONFLICTOS DE BODY PARSER
// ========================================
async function configureApollo() {
  try {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      // CRÍTICO: Configuración específica para evitar stream errors
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

    // CRÍTICO: Aplicar middleware SIN body parser config
    server.applyMiddleware({ 
      app, 
      path: '/graphql',
      cors: false, // Ya configurado globalmente
      // NO especificar bodyParserConfig para evitar conflictos
    });

    console.log("✅ GraphQL configurado en /graphql");
    console.log("🌐 GraphQL URL: http://localhost:" + PORT + "/graphql");
    return true;
  } catch (error) {
    console.error("❌ Error configurando GraphQL:", error.message);
    console.error("Stack:", error.stack);
    return false;
  }
}

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API La Granja S.A. funcionando',
    endpoints: {
      rest: {
        clientes: 'http://localhost:' + PORT + '/api/clientes',
        porcinos: 'http://localhost:' + PORT + '/api/porcinos',
        alimentacion: 'http://localhost:' + PORT + '/api/alimentacion'
      },
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
    console.log(' Iniciando La Granja S.A. API...');
    console.log('');

    // Configurar Apollo Server
    const apolloReady = await configureApollo();

    // Iniciar servidor Express
    const server = app.listen(PORT, () => {
      console.log(' ==========================================');
      console.log(' LA GRANJA S.A. - SERVIDOR ACTIVO');
      console.log(' ==========================================');
      console.log('');
      console.log(' Servidor corriendo en: http://localhost:' + PORT);
      console.log('');
      console.log(' ENDPOINTS REST:');
      console.log('   • http://localhost:' + PORT + '/api/clientes');
      console.log('   • http://localhost:' + PORT + '/api/porcinos');
      console.log('   • http://localhost:' + PORT + '/api/alimentacion');
      console.log('');

      if (apolloReady) {
        console.log(' ENDPOINT GRAPHQL:');
        console.log('   • http://localhost:' + PORT + '/graphql');
        console.log('   • Apollo Sandbox funcionará SIN errores de stream');
        console.log('');
      }

      console.log(' ==========================================');
      console.log(' Body parser conflicts RESUELTOS');
      console.log(' ==========================================');
      console.log('');
    });

    // Manejo de cierre graceful
    process.on('SIGINT', async () => {
      console.log('\n  Cerrando servidor...');
      server.close();
      await mongoose.connection.close();
      console.log(' Servidor cerrado correctamente');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error fatal al iniciar servidor:', error.message);
    process.exit(1);
  }
}

// Inicializar servidor
startServer();

module.exports = app;
