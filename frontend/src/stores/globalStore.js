import { reactive } from 'vue'
import { utilsService } from '@/services/apiService'

// Estado reactivo global
const state = reactive({
  // Loading states
  isLoading: false,
  loadingMessage: '',

  // Notifications
  notifications: [],
  notificationId: 0,

  // Backend connection
  backendConnected: false,

  // Cache de datos
  clientesCache: [],
  alimentacionesCache: [],

  // Estados de formularios
  modalStates: {
    clienteModal: false,
    porcinoModal: false,
    alimentacionModal: false,
    confirmModal: false
  }
})

// ✅ SISTEMA DE NOTIFICACIONES FUNCIONAL
const showNotification = (message, type = 'info', duration = 5000) => {
  console.log('📢 [GlobalStore] showNotification called:', { message, type, duration })

  const id = ++state.notificationId
  const notification = {
    id,
    message,
    type,
    timestamp: Date.now()
  }

  // Agregar notificación al array
  state.notifications.push(notification)
  console.log('📋 [GlobalStore] Notifications after push:', state.notifications.length)

  // Auto-remover después del tiempo especificado
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }

  return id
}

const removeNotification = (id) => {
  console.log('🗑️ [GlobalStore] Removing notification:', id)
  const index = state.notifications.findIndex(n => n.id === id)
  if (index > -1) {
    state.notifications.splice(index, 1)
    console.log('✅ [GlobalStore] Notification removed, remaining:', state.notifications.length)
  }
}

const clearNotifications = () => {
  state.notifications.splice(0, state.notifications.length)
}

// Loading methods
const setLoading = (loading, message = 'Cargando...') => {
  state.isLoading = loading
  state.loadingMessage = message
}

// ✅ ERROR HANDLER FUNCIONAL
const handleApiError = (error, defaultMessage = 'Ha ocurrido un error') => {
  console.error('[GlobalStore] API Error:', error)

  let message = defaultMessage

  // Extraer mensaje específico del error
  if (error.message) {
    message = error.message
  } else if (error.response?.data?.message) {
    message = error.response.data.message
  } else if (typeof error === 'string') {
    message = error
  }

  console.log('📢 [GlobalStore] Showing error notification:', message)

  // ✅ MOSTRAR NOTIFICACIÓN DE ERROR
  showNotification(message, 'error', 8000)

  // Quitar loading
  setLoading(false)
}

// ✅ SUCCESS HANDLER FUNCIONAL
const handleSuccess = (message) => {
  console.log('📢 [GlobalStore] Showing success notification:', message)
  showNotification(message, 'success', 4000)
}

// Modal methods
const openModal = (modalName) => {
  if (modalName in state.modalStates) {
    state.modalStates[modalName] = true
  }
}

const closeModal = (modalName) => {
  if (modalName in state.modalStates) {
    state.modalStates[modalName] = false
  }
}

const closeAllModals = () => {
  Object.keys(state.modalStates).forEach(key => {
    state.modalStates[key] = false
  })
}

// Backend connection
const checkBackendConnection = async () => {
  try {
    setLoading(true, 'Verificando conexión...')
    const connected = await utilsService.verificarConexion()
    state.backendConnected = connected

    if (connected) {
      showNotification('✅ Conectado al servidor', 'success', 3000)
    } else {
      showNotification('❌ Sin conexión con el servidor', 'error', 0)
    }

    return connected
  } catch (error) {
    console.error('[Backend Connection Error]:', error)
    state.backendConnected = false
    showNotification('❌ Error de conexión con el servidor', 'error', 0)
    return false
  } finally {
    setLoading(false)
  }
}

// Cache methods
const updateClientesCache = (clientes) => {
  state.clientesCache = clientes
}

const updateAlimentacionesCache = (alimentaciones) => {
  state.alimentacionesCache = alimentaciones
}

const getClienteFromCache = (id) => {
  return state.clientesCache.find(c => c._id === id)
}

const getAlimentacionFromCache = (id) => {
  return state.alimentacionesCache.find(a => a._id === id)
}

// ✅ EXPORT PRINCIPAL
export const useGlobalStore = () => {
  return {
    // Estado reactivo directo
    isLoading: state.isLoading,
    loadingMessage: state.loadingMessage,
    notifications: state.notifications,
    backendConnected: state.backendConnected,
    clientesCache: state.clientesCache,
    alimentacionesCache: state.alimentacionesCache,
    modalStates: state.modalStates,

    // Métodos de notificaciones
    showNotification,
    removeNotification,
    clearNotifications,

    // Métodos de loading
    setLoading,

    // Métodos de manejo de errores
    handleApiError,
    handleSuccess,

    // Métodos de modales
    openModal,
    closeModal,
    closeAllModals,

    // Backend
    checkBackendConnection,

    // Cache
    updateClientesCache,
    updateAlimentacionesCache,
    getClienteFromCache,
    getAlimentacionFromCache,

    // Estado completo para debugging
    state
  }
}

export default useGlobalStore
