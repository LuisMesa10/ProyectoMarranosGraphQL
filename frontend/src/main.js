
// src/main.js
import { createApp, provide, h } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import router from './router';
import apolloClient from '../apollo/apolloClient';

// Crear la aplicación Vue
const app = createApp({
  setup() {
    // Proveer el cliente Apollo a toda la aplicación
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App),
});

// Usar el router
app.use(router);

// Montar la aplicación
app.mount('#app');

// Manejo de errores global para Apollo
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Error no manejado:', event.reason);
});
