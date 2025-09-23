<template>
  <div class="detalle-cliente">
    <!-- Loading state -->
    <div v-if="cargandoCliente" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando información del cliente...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="!cliente" class="error-container">
      <i class="fas fa-user-slash"></i>
      <h3>Cliente no encontrado</h3>
      <p>El cliente solicitado no existe o ha sido eliminado.</p>
      <button @click="$router.push('/')" class="btn btn-primary">
        <i class="fas fa-arrow-left"></i>
        Volver a la Lista
      </button>
    </div>

    <!-- Contenido principal -->
    <div v-else class="cliente-content">
      <!-- Header del cliente -->
      <div class="cliente-header">
        <div class="cliente-info">
          <div class="cliente-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="cliente-datos">
            <h2 class="cliente-nombre">{{ cliente.nombres }} {{ cliente.apellidos }}</h2>
            <p class="cliente-cedula">
              <i class="fas fa-id-card"></i>
              Cédula: {{ cliente.cedula }}
            </p>
            <div class="cliente-meta">
              <span v-if="cliente.telefono" class="meta-item">
                <i class="fas fa-phone"></i>
                {{ cliente.telefono }}
              </span>
              <span v-if="cliente.direccion" class="meta-item">
                <i class="fas fa-map-marker-alt"></i>
                {{ cliente.direccion }}
              </span>
            </div>
          </div>
        </div>

        <div class="cliente-stats">
          <div class="stat-card">
            <div class="stat-number">{{ porcinos.length }}</div>
            <div class="stat-label">
              <i class="fas fa-pig"></i>
              Porcinos
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ pesoTotal }} kg</div>
            <div class="stat-label">
              <i class="fas fa-weight"></i>
              Peso Total
            </div>
          </div>
        </div>
      </div>

      <!-- Navegación de pestañas -->
      <nav class="tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="tabActiva = tab.id"
          :class="['tab-button', { 'active': tabActiva === tab.id }]"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
        </button>
      </nav>

      <!-- Contenido de pestañas -->
      <div class="tab-content">
        <!-- Pestaña: Datos del Cliente -->
        <div v-show="tabActiva === 'datos'" class="tab-panel">
          <div class="panel-header">
            <h3>
              <i class="fas fa-user-edit"></i>
              Información del Cliente
            </h3>
            <div class="panel-actions">
              <button @click=" ModoEdicion" class="btn btn-secondary">
                <i :class="modoEdicion ? 'fas fa-times' : 'fas fa-edit'"></i>
                {{ modoEdicion ? 'Cancelar' : 'Editar' }}
              </button>
              <button
                v-if="modoEdicion"
                @click="guardarCliente"
                :disabled="!clienteModificado"
                class="btn btn-primary"
              >
                <i class="fas fa-save"></i>
                Guardar Cambios
              </button>
            </div>
          </div>

          <form @submit.prevent="guardarCliente" class="cliente-form">
            <div class="form-grid">
              <!-- Cédula -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-id-card"></i>
                  Cédula
                </label>
                <input
                  v-model="clienteEditado.cedula"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="10"
                >
              </div>

              <!-- Nombres -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-user"></i>
                  Nombres
                </label>
                <input
                  v-model="clienteEditado.nombres"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="50"
                >
              </div>

              <!-- Apellidos -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-user"></i>
                  Apellidos
                </label>
                <input
                  v-model="clienteEditado.apellidos"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="50"
                >
              </div>

              <!-- Teléfono -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-phone"></i>
                  Teléfono
                </label>
                <input
                  v-model="clienteEditado.telefono"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="20"
                >
              </div>

              <!-- Dirección -->
              <div class="form-group span-full">
                <label class="form-label">
                  <i class="fas fa-map-marker-alt"></i>
                  Dirección
                </label>
                <input
                  v-model="clienteEditado.direccion"
                  :disabled="!modoEdicion"
                  type="text"
                  class="form-control"
                  maxlength="100"
                >
              </div>
            </div>
          </form>
        </div>

        <!-- Pestaña: Porcinos -->
        <div v-show="tabActiva === 'porcinos'" class="tab-panel">
          <div class="panel-header">
            <h3>
              <i class="fas fa-pig"></i>
              Porcinos del Cliente
            </h3>
            <div class="panel-actions">
              <button @click="abrirModalPorcino()" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                Nuevo Porcino
              </button>
            </div>
          </div>

          <!-- Lista de porcinos -->
          <div v-if="porcinos.length === 0" class="empty-state">
            <i class="fas fa-pig"></i>
            <h4>No hay porcinos registrados</h4>
            <p>Comienza agregando el primer porcino para este cliente.</p>
            <button @click="abrirModalPorcino()" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Agregar Primer Porcino
            </button>
          </div>

          <div v-else class="porcinos-grid">
            <div
              v-for="porcino in porcinos"
              :key="porcino._id || porcino.id"
              class="porcino-card"
            >
              <div class="card-header">
                <h4 class="porcino-id">{{ porcino.identificacion }}</h4>
                <div class="card-actions">
                  <button
                    @click="abrirModalPorcino(porcino)"
                    class="btn btn-sm btn-outline-secondary"
                    title="Editar"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="confirmarEliminarPorcino(porcino)"
                    class="btn btn-sm btn-outline-danger"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div class="porcino-info">
                  <div class="info-item">
                    <span class="label">Raza:</span>
                    <span class="value raza-badge" :class="'raza-' + porcino.raza">
                      {{ getRazaNombre(porcino.raza) }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="label">Edad:</span>
                    <span class="value">{{ porcino.edad }} meses</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Peso:</span>
                    <span class="value weight">{{ porcino.peso }} kg</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Alimentación:</span>
                    <span class="value">{{ getAlimentacionNombre(porcino.alimentacionId) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña: Alimentaciones -->
        <div v-show="tabActiva === 'alimentacion'" class="tab-panel">
          <div class="panel-header">
            <h3>
              <i class="fas fa-apple-alt"></i>
              Gestión de Alimentaciones
            </h3>
            <div class="panel-actions">
              <button @click="abrirModalAlimentacion()" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                Nueva Alimentación
              </button>
            </div>
          </div>

          <!-- Lista de alimentaciones -->
          <div v-if="alimentaciones.length === 0" class="empty-state">
            <i class="fas fa-apple-alt"></i>
            <h4>No hay alimentaciones registradas</h4>
            <p>Las alimentaciones son necesarias para crear porcinos.</p>
            <button @click="abrirModalAlimentacion()" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Agregar Primera Alimentación
            </button>
          </div>

          <div v-else class="alimentaciones-list">
            <div
              v-for="alimentacion in alimentaciones"
              :key="alimentacion._id || alimentacion.id"
              class="alimentacion-card"
            >
              <div class="card-content">
                <h4 class="alimentacion-name">{{ alimentacion.descripcion }}</h4>
                <p class="alimentacion-dosis">
                  <i class="fas fa-prescription-bottle"></i>
                  {{ alimentacion.dosis || 'Dosis no especificada' }}
                </p>
              </div>
              <div class="card-actions">
                <button
                  @click="abrirModalAlimentacion(alimentacion)"
                  class="btn btn-sm btn-outline-secondary"
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="confirmarEliminarAlimentacion(alimentacion)"
                  class="btn btn-sm btn-outline-danger"
                  title="Eliminar"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ModalPorcino
      v-if="mostrarModalPorcino"
      :porcino="porcinoSeleccionado"
      :cliente-id="clienteId"
      :alimentaciones="alimentaciones"
      @guardar="guardarPorcino"
      @cerrar="cerrarModalPorcino"
    />

    <ModalAlimentacion
      v-if="mostrarModalAlimentacion"
      :alimentacion="alimentacionSeleccionada"
      @guardar="guardarAlimentacion"
      @cerrar="cerrarModalAlimentacion"
    />

    <ModalConfirmacion
      v-if="mostrarModalConfirmacion"
      :titulo="confirmacion.titulo"
      :mensaje="confirmacion.mensaje"
      :tipo="confirmacion.tipo"
      @confirmar="ejecutarConfirmacion"
      @cancelar="cerrarModalConfirmacion"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  clienteService,
  porcinoService,
  alimentacionService,
  getRazaNombre
} from '@/services/apiService'
import { useGlobalStore } from '@/stores/globalStore'
import ModalPorcino from '@/components/ModalPorcino.vue'
import ModalAlimentacion from '@/components/ModalAlimentacion.vue'
import ModalConfirmacion from '@/components/ModalConfirmacion.vue'

export default {
  name: 'DetalleCliente',
  components: {
    ModalPorcino,
    ModalAlimentacion,
    ModalConfirmacion
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const globalStore = useGlobalStore()

    // Estado principal
    const cliente = ref(null)
    const porcinos = ref([])
    const alimentaciones = ref([])
    const cargandoCliente = ref(false)

    // Estado de pestañas
    const tabActiva = ref('datos')
    const tabs = computed(() => [
      { id: 'datos', label: 'Datos del Cliente', icon: 'fas fa-user-edit' },
      { id: 'porcinos', label: 'Porcinos', icon: 'fas fa-pig', count: porcinos.value.length },
      { id: 'alimentacion', label: 'Alimentaciones', icon: 'fas fa-apple-alt', count: alimentaciones.value.length }
    ])

    // Estado de edición de cliente
    const modoEdicion = ref(false)
    const clienteEditado = reactive({
      cedula: '',
      nombres: '',
      apellidos: '',
      direccion: '',
      telefono: ''
    })

    // Estado de modales
    const mostrarModalPorcino = ref(false)
    const porcinoSeleccionado = ref(null)
    const mostrarModalAlimentacion = ref(false)
    const alimentacionSeleccionada = ref(null)
    const mostrarModalConfirmacion = ref(false)
    const confirmacion = ref({})

    // Computed properties
    const clienteId = computed(() => props.id)
    const pesoTotal = computed(() => {
      return porcinos.value.reduce((total, porcino) => total + (porcino.peso || 0), 0)
    })
    const clienteModificado = computed(() => {
      if (!cliente.value) return false
      return Object.keys(clienteEditado).some(key =>
        clienteEditado[key] !== (cliente.value[key] || '')
      )
    })

    // Métodos de carga de datos
    const cargarCliente = async () => {
      try {
        globalStore.setLoading(true, 'Cargando cliente...')
        const response = await clienteService.obtenerClientePorId(clienteId.value)
        cliente.value = response.data || response
        inicializarClienteEditado()
      } catch (error) {
        globalStore.handleApiError(error, 'Error al cargar cliente')
        cliente.value = null
      } finally {
        globalStore.setLoading(false)
      }
    }

    const cargarPorcinos = async () => {
      try {
        const response = await porcinoService.obtenerPorcinos(clienteId.value)
        porcinos.value = (response.data || response).filter(p =>
          (p.clienteId === clienteId.value) || (p.clienteId._id === clienteId.value)
        )
      } catch (error) {
        console.warn('Error al cargar porcinos:', error)
        porcinos.value = []
      }
    }

    const cargarAlimentaciones = async () => {
      try {
        const response = await alimentacionService.obtenerAlimentaciones()
        alimentaciones.value = response.data || response
      } catch (error) {
        console.warn('Error al cargar alimentaciones:', error)
        alimentaciones.value = []
      }
    }

    const cargarTodosDatos = async () => {
      await Promise.all([
        cargarCliente(),
        cargarPorcinos(),
        cargarAlimentaciones()
      ])
    }

    // Métodos de cliente
    const inicializarClienteEditado = () => {
      if (cliente.value) {
        clienteEditado.cedula = cliente.value.cedula || ''
        clienteEditado.nombres = cliente.value.nombres || ''
        clienteEditado.apellidos = cliente.value.apellidos || ''
        clienteEditado.direccion = cliente.value.direccion || ''
        clienteEditado.telefono = cliente.value.telefono || ''
      }
    }

    const toggleModoEdicion = () => {
      modoEdicion.value = !modoEdicion.value
      if (!modoEdicion.value) {
        inicializarClienteEditado() // Restaurar valores originales
      }
    }

    const guardarCliente = async () => {
      try {
        globalStore.setLoading(true, 'Guardando cliente...')
        const response = await clienteService.actualizarCliente(clienteId.value, clienteEditado)
        cliente.value = response.data || response
        modoEdicion.value = false
        globalStore.handleSuccess('Cliente actualizado exitosamente')
      } catch (error) {
        globalStore.handleApiError(error, 'Error al guardar cliente')
      } finally {
        globalStore.setLoading(false)
      }
    }

    // Métodos de porcinos
    const abrirModalPorcino = (porcino = null) => {
      porcinoSeleccionado.value = porcino
      mostrarModalPorcino.value = true
    }

    const cerrarModalPorcino = () => {
      mostrarModalPorcino.value = false
      porcinoSeleccionado.value = null
    }

    const guardarPorcino = async (porcinoData) => {
      try {
        globalStore.setLoading(true, 'Guardando porcino...')

        if (porcinoSeleccionado.value) {
          await porcinoService.actualizarPorcino(
            porcinoSeleccionado.value._id || porcinoSeleccionado.value.id,
            porcinoData
          )
          globalStore.handleSuccess('Porcino actualizado exitosamente')
        } else {
          await porcinoService.crearPorcino({
            ...porcinoData,
            clienteId: clienteId.value
          })
          globalStore.handleSuccess('Porcino creado exitosamente')
        }

        cerrarModalPorcino()
        await cargarPorcinos()
      } catch (error) {
        globalStore.handleApiError(error, 'Error al guardar porcino')
      } finally {
        globalStore.setLoading(false)
      }
    }

    const confirmarEliminarPorcino = (porcino) => {
      confirmacion.value = {
        titulo: 'Confirmar Eliminación',
        mensaje: `¿Está seguro de eliminar el porcino ${porcino.identificacion}?`,
        tipo: 'danger',
        accion: () => eliminarPorcino(porcino)
      }
      mostrarModalConfirmacion.value = true
    }

    const eliminarPorcino = async (porcino) => {
      try {
        globalStore.setLoading(true, 'Eliminando porcino...')
        await porcinoService.eliminarPorcino(porcino._id || porcino.id)
        await cargarPorcinos()
        globalStore.handleSuccess('Porcino eliminado exitosamente')
      } catch (error) {
        globalStore.handleApiError(error, 'Error al eliminar porcino')
      } finally {
        globalStore.setLoading(false)
      }
    }

    // Métodos de alimentación
    const abrirModalAlimentacion = (alimentacion = null) => {
      alimentacionSeleccionada.value = alimentacion
      mostrarModalAlimentacion.value = true
    }

    const cerrarModalAlimentacion = () => {
      mostrarModalAlimentacion.value = false
      alimentacionSeleccionada.value = null
    }

    const guardarAlimentacion = async (alimentacionData) => {
      try {
        globalStore.setLoading(true, 'Guardando alimentación...')

        if (alimentacionSeleccionada.value) {
          await alimentacionService.actualizarAlimentacion(
            alimentacionSeleccionada.value._id || alimentacionSeleccionada.value.id,
            alimentacionData
          )
          globalStore.handleSuccess('Alimentación actualizada exitosamente')
        } else {
          await alimentacionService.crearAlimentacion(alimentacionData)
          globalStore.handleSuccess('Alimentación creada exitosamente')
        }

        cerrarModalAlimentacion()
        await cargarAlimentaciones()
      } catch (error) {
        globalStore.handleApiError(error, 'Error al guardar alimentación')
      } finally {
        globalStore.setLoading(false)
      }
    }

    const confirmarEliminarAlimentacion = (alimentacion) => {
      confirmacion.value = {
        titulo: 'Confirmar Eliminación',
        mensaje: `¿Está seguro de eliminar la alimentación "${alimentacion.descripcion}"?`,
        tipo: 'danger',
        accion: () => eliminarAlimentacion(alimentacion)
      }
      mostrarModalConfirmacion.value = true
    }

    const eliminarAlimentacion = async (alimentacion) => {
      try {
        globalStore.setLoading(true, 'Eliminando alimentación...')
        await alimentacionService.eliminarAlimentacion(alimentacion._id || alimentacion.id)
        await cargarAlimentaciones()
        globalStore.handleSuccess('Alimentación eliminada exitosamente')
      } catch (error) {
        globalStore.handleApiError(error, 'Error al eliminar alimentación')
      } finally {
        globalStore.setLoading(false)
      }
    }

    // Métodos de confirmación
    const ejecutarConfirmacion = () => {
      if (confirmacion.value.accion) {
        confirmacion.value.accion()
      }
      cerrarModalConfirmacion()
    }

    const cerrarModalConfirmacion = () => {
      mostrarModalConfirmacion.value = false
      confirmacion.value = {}
    }

    // Métodos auxiliares
    const getAlimentacionNombre = (alimentacionId) => {
      if (!alimentacionId) return 'Sin alimentación'

      let alimentacion
      if (typeof alimentacionId === 'object' && alimentacionId.descripcion) {
        alimentacion = alimentacionId
      } else {
        alimentacion = alimentaciones.value.find(a =>
          (a._id === alimentacionId) || (a.id === alimentacionId)
        )
      }

      return alimentacion ? alimentacion.descripcion : 'Alimentación no encontrada'
    }

    // Watchers
    watch(() => route.params.id, (newId) => {
      if (newId !== clienteId.value) {
        cargarTodosDatos()
      }
    })

    watch(() => cliente.value, () => {
      inicializarClienteEditado()
    })

    // Lifecycle
    onMounted(() => {
      cargarTodosDatos()
    })

    return {
      // Estado principal
      cliente,
      porcinos,
      alimentaciones,
      cargandoCliente,

      // Store global
      globalStore,

      // Pestañas
      tabActiva,
      tabs,

      // Edición de cliente
      modoEdicion,
      clienteEditado,
      clienteModificado,

      // Modales
      mostrarModalPorcino,
      porcinoSeleccionado,
      mostrarModalAlimentacion,
      alimentacionSeleccionada,
      mostrarModalConfirmacion,
      confirmacion,

      // Computed
      clienteId,
      pesoTotal,

      // Métodos de cliente
      toggleModoEdicion,
      guardarCliente,

      // Métodos de porcinos
      abrirModalPorcino,
      cerrarModalPorcino,
      guardarPorcino,
      confirmarEliminarPorcino,

      // Métodos de alimentación
      abrirModalAlimentacion,
      cerrarModalAlimentacion,
      guardarAlimentacion,
      confirmarEliminarAlimentacion,

      // Métodos de confirmación
      ejecutarConfirmacion,
      cerrarModalConfirmacion,

      // Métodos auxiliares
      getRazaNombre,
      getAlimentacionNombre
    }
  }
}
</script>

<style scoped>
.detalle-cliente {
  max-width: 100%;
}

/* Loading & Error states */
.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.loading-container .spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e9ecef;
  border-top: 4px solid #2e7d5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-container i {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.error-container h3 {
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.error-container p {
  color: #adb5bd;
  margin-bottom: 2rem;
}

/* Header del cliente */
.cliente-header {
  background: linear-gradient(135deg, white, #f8f9fa);
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.cliente-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.cliente-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2e7d5e, #4a90b8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.cliente-datos h2 {
  margin: 0 0 0.5rem 0;
  color: #2e7d5e;
  font-size: 1.75rem;
  font-weight: 600;
}

.cliente-cedula {
  margin: 0 0 0.75rem 0;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
}

.cliente-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #adb5bd;
  font-size: 0.875rem;
}

.cliente-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  background: white;
  padding: 1.5rem;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  min-width: 120px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2e7d5e;
  margin-bottom: 0.5rem;
}

.stat-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Navegación de pestañas */
.tabs-nav {
  display: flex;
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 2rem;
  overflow: hidden;
}

.tab-button {
  flex: 1;
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  background: #f8f9fa;
  color: #2e7d5e;
}

.tab-button.active {
  color: #2e7d5e;
  background: #f8f9fa;
  border-bottom-color: #2e7d5e;
}

.tab-count {
  background: #2e7d5e;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.25rem;
  text-align: center;
}

.tab-button.active .tab-count {
  background: white;
  color: #2e7d5e;
}

/* Contenido de pestañas */
.tab-content {
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  overflow: hidden;
}

.tab-panel {
  padding: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.panel-header h3 {
  margin: 0;
  color: #2e7d5e;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
}

.panel-actions {
  display: flex;
  gap: 1rem;
}

/* Formulario de cliente */
.cliente-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.span-full {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #343a40;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #2e7d5e;
  box-shadow: 0 0 0 3px rgba(46, 125, 94, 0.1);
}

.form-control:disabled {
  background: #f8f9fa;
  color: #6c757d;
}

/* Estados vacíos */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #adb5bd;
}

.empty-state i {
  font-size: 3rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-state h4 {
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.empty-state p {
  margin-bottom: 2rem;
}

/* Grid de porcinos */
.porcinos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.porcino-card {
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  overflow: hidden;
  transition: all 0.3s;
}

.porcino-card:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transform: translateY(-2px);
}

.porcino-card .card-header {
  background: #f8f9fa;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.porcino-id {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2e7d5e;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.porcino-card .card-body {
  padding: 1rem;
}

.porcino-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-weight: 500;
  color: #6c757d;
}

.info-item .value {
  font-weight: 600;
  color: #343a40;
}

.raza-badge {
  background: #2e7d5e;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.raza-1 { background: #28a745; }
.raza-2 { background: #007bff; }
.raza-3 { background: #fd7e14; }

.weight {
  color: #28a745;
  font-weight: 700;
}

/* Lista de alimentaciones */
.alimentaciones-list {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alimentacion-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  transition: all 0.3s;
}

.alimentacion-card:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-color: #2e7d5e;
}

.card-content h4 {
  margin: 0 0 0.5rem 0;
  color: #2e7d5e;
  font-size: 1.125rem;
}

.alimentacion-dosis {
  margin: 0;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  white-space: nowrap;
}

.btn-primary {
  background-color: #2e7d5e;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #267049;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #4a90b8;
  color: white;
}

.btn-secondary:hover {
  background-color: #3a7ea8;
}

.btn-outline-primary {
  color: #2e7d5e;
  border: 1px solid #2e7d5e;
  background: transparent;
}

.btn-outline-primary:hover {
  background: #2e7d5e;
  color: white;
}

.btn-outline-secondary {
  color: #4a90b8;
  border: 1px solid #4a90b8;
  background: transparent;
}

.btn-outline-secondary:hover {
  background: #4a90b8;
  color: white;
}

.btn-outline-danger {
  color: #dc3545;
  border: 1px solid #dc3545;
  background: transparent;
}

.btn-outline-danger:hover {
  background: #dc3545;
  color: white;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animaciones */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .cliente-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .cliente-info {
    flex-direction: column;
    text-align: center;
  }

  .cliente-stats {
    justify-content: center;
  }

  .tabs-nav {
    flex-direction: column;
  }

  .tab-button {
    justify-content: flex-start;
    text-align: left;
  }

  .panel-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .panel-actions {
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .porcinos-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .alimentacion-card {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .card-actions {
    justify-content: center;
  }
}
</style>
