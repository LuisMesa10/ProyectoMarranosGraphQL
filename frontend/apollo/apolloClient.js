
// src/apollo/apolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';

// Crear el link HTTP que apunta al servidor GraphQL
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql',
});

// Configurar el caché
const cache = new InMemoryCache({
  // Configurar políticas de tipo para optimizar el caché
  typePolicies: {
    Cliente: {
      fields: {
        porcinos: {
          // Merge policy para arrays
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Query: {
      fields: {
        clientes: {
          // Política de merge para listas
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        porcinos: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        alimentaciones: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// Crear el cliente Apollo
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
  // Configuraciones adicionales
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',  // Usar caché pero también buscar actualizaciones
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Habilitar herramientas de desarrollo en desarrollo
  devtools: import.meta.env.MODE === 'development',
});

export default apolloClient;
