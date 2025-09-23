import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Crear la aplicación Vue
const app = createApp(App)

// Configurar Vue Router
app.use(router)

// Configuración global de propiedades
app.config.globalProperties.$apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Manejo global de errores no capturados
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error Handler]:', err, info)

  // Aquí podrías enviar el error a un servicio de logging
  // logError(err, { instance, info })
}

// Configuraciones de desarrollo
if (import.meta.env.DEV) {
  app.config.performance = true
}

// Montar la aplicación en el DOM
app.mount('#app')

// Configurar interceptor global para requests de red
window.addEventListener('unhandledrejection', event => {
  console.error('[Unhandled Promise Rejection]:', event.reason)

  // Prevenir que aparezca en la consola del navegador si ya lo manejamos
  event.preventDefault()
})

// Información de la aplicación en desarrollo
if (import.meta.env.DEV) {
  console.log('🐷 La Granja S.A. - Sistema de Gestión Porcina')
  console.log('📊 Modo: Desarrollo')
  console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000/api')
  console.log('📱 Vue Version:', app.version)
}
