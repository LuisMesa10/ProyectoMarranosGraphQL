
// src/apollo/client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';

// Configurar el enlace HTTP
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
  credentials: 'include'
});

// Configurar cache
const cache = new InMemoryCache({
  typePolicies: {
    Cliente: {
      fields: {
        porcinos: {
          merge: false, // Reemplazar en lugar de merge
        },
      },
    },
    Porcino: {
      fields: {
        cliente: {
          merge: true,
        },
        alimentacion: {
          merge: true,
        },
      },
    },
  },
});

// Crear cliente Apollo
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'network-only', // Siempre obtener datos frescos
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
