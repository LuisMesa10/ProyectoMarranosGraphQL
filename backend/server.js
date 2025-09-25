
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

// Middleware para JSON y CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL del frontend Vue
  credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mi_base", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error de conexión:", err));

// Función para inicializar el servidor Apollo
async function startServer() {
  // Crear servidor Apollo
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Habilitar introspection y playground en desarrollo
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.NODE_ENV !== 'production',
    // Context para pasar datos entre resolvers
    context: ({ req }) => {
      // Aquí puedes agregar información del usuario, tokens, etc.
      return {
        req,
        // user: req.user, // Si usas autenticación
      };
    },
    // Manejo de errores personalizado
    formatError: (error) => {
      console.error('❌ GraphQL Error:', error);
      return {
        message: error.message,
        // En desarrollo, mostrar más detalles del error
        ...(process.env.NODE_ENV === 'development' && {
          locations: error.locations,
          path: error.path,
          stack: error.stack
        })
      };
    }
  });

  // Inicializar el servidor Apollo
  await server.start();

  // Aplicar el middleware de Apollo al servidor Express
  server.applyMiddleware({ 
    app, 
    path: '/graphql',  // El endpoint será http://localhost:3000/graphql
    cors: false  // Ya tenemos CORS configurado arriba
  });

  console.log('🚀 Servidor GraphQL listo en http://localhost:\${PORT}\${server.graphqlPath}');
}

// OPCIONAL: Mantener las rutas REST existentes para migración gradual
// Descomenta estas líneas si quieres mantener tanto GraphQL como REST
/*
app.use('/api/clientes', require('./routes/clienteRoute'));
app.use('/api/alimentacion', require('./routes/alimentacionRoutes'));
app.use('/api/porcinos', require('./routes/porcinoRoutes'));
*/

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ 
    message: '🐷 API de La Granja S.A. funcionando',
    graphql: `http://localhost:\${PORT}/graphql`,
    status: 'OK'
  });
});

// Ruta para verificar la salud del servidor
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  res.status(500).json({
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Inicializar el servidor
startServer().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Express corriendo en http://localhost:\${PORT}`);
    console.log(`📊 GraphQL Playground disponible en http://localhost:\${PORT}/graphql`);
  });
}).catch(error => {
  console.error('❌ Error al inicializar el servidor:', error);
  process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n⏹️  Cerrando servidor...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
