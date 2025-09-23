<template>
  <div class="lista-clientes">
    <!-- Header de la vista -->
    <div class="view-header">
      <div class="view-header-content">
        <div class="view-title">
          <i class="fas fa-users"></i>
          <h2>Lista de Clientes</h2>
          <span class="count-badge">{{ clientes.length }}</span>
        </div>

        <div class="view-actions">
          <!-- Búsqueda -->
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchTerm" placeholder="Buscar por cédula, nombre o apellido..."
              class="search-input">
            <button v-if="searchTerm" @click="clearSearch" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Botón nuevo cliente -->
          <button @click="abrirModalCliente()" class="btn btn-primary btn-new-client">
            <i class="fas fa-plus"></i>
            Nuevo Cliente
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de clientes -->
    <div class="table-container">
      <div v-if="clientesFiltrados.length === 0 && !isLoading" class="empty-state">
        <i class="fas fa-user-slash"></i>
        <h3>{{ searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados' }}</h3>
        <p>{{ searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer cliente' }}</p>
        <button v-if="!searchTerm" @click="abrirModalCliente()" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Agregar Primer Cliente
        </button>
      </div>

      <div v-else class="table-wrapper">
        <table class="clients-table">
          <thead>
            <tr>
              <th>
                <button @click="cambiarOrden('cedula')" class="sort-button">
                  Cédula
                  <i :class="getSortIcon('cedula')"></i>
                </button>
              </th>
              <th>
                <button @click="cambiarOrden('nombres')" class="sort-button">
                  Nombre Completo
                  <i :class="getSortIcon('nombres')"></i>
                </button>
              </th>
              <th>Teléfono</th>
              <th>Porcinos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientesPaginados" :key="cliente._id || cliente.id" class="client-row">
              <td class="client-cedula">
                {{ cliente.cedula }}
              </td>
              <td class="client-name">
                <div class="name-container">
                  <strong>{{ cliente.nombres }} {{ cliente.apellidos }}</strong>
                  <small v-if="cliente.direccion">{{ cliente.direccion }}</small>
                </div>
              </td>
              <td class="client-phone">
                <span v-if="cliente.telefono" class="phone">
                  <i class="fas fa-phone"></i>
                  {{ cliente.telefono }}
                </span>
                <span v-else class="no-phone">Sin teléfono</span>
              </td>
              <td class="client-pigs">
                <span class="pig-count">
                  <i class="fas fa-pig"></i>
                  {{ getPorcinosCount(cliente._id || cliente.id) }}
                </span>
              </td>
              <td class="client-actions">
                <div class="action-buttons">
                  <button @click="verDetalle(cliente)" class="btn btn-sm btn-outline-primary" title="Ver detalle">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="abrirModalCliente(cliente)" class="btn btn-sm btn-outline-secondary" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="confirmarEliminar(cliente)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="paginaActual = 1" :disabled="paginaActual === 1" class="btn btn-sm btn-outline">
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button @click="paginaActual--" :disabled="paginaActual === 1" class="btn btn-sm btn-outline">
          <i class="fas fa-angle-left"></i>
        </button>

        <span class="pagination-info">
          Página {{ paginaActual }} de {{ totalPages }}
        </span>

        <button @click="paginaActual++" :disabled="paginaActual === totalPages" class="btn btn-sm btn-outline">
          <i class="fas fa-angle-right"></i>
        </button>
        <button @click="paginaActual = totalPages" :disabled="paginaActual === totalPages"
          class="btn btn-sm btn-outline">
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal de Cliente -->
    <ModalCliente v-if="mostrarModalCliente" :cliente="clienteSeleccionado" @guardar="guardarCliente"
      @cerrar="cerrarModalCliente" />

    <!-- Modal de Confirmación -->
    <ModalConfirmacion v-if="mostrarModalConfirmacion" :titulo="confirmacion.titulo" :mensaje="confirmacion.mensaje"
      :tipo="confirmacion.tipo" @confirmar="ejecutarConfirmacion" @cancelar="cerrarModalConfirmacion" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { clienteService, porcinoService } from '@/services/apiService'
import { useGlobalStore } from '@/stores/globalStore'
import ModalCliente from '@/components/ModalCliente.vue'
import ModalConfirmacion from '@/components/ModalConfirmacion.vue'

export default {
  name: 'ListaClientes',
  components: {
    ModalCliente,
    ModalConfirmacion
  },
  setup() {
    const router = useRouter()
    const globalStore = useGlobalStore()

    // Estado reactivo
    const clientes = ref([])
    const porcinos = ref([])
    const searchTerm = ref('')
    const ordenActual = ref({ campo: 'nombres', direccion: 'asc' })
    const paginaActual = ref(1)
    const itemsPorPagina = 10

    // Estado de modales
    const mostrarModalCliente = ref(false)
    const clienteSeleccionado = ref(null)
    const mostrarModalConfirmacion = ref(false)
    const confirmacion = ref({})

    // Estado de carga
    const isLoading = computed(() => globalStore.isLoading)

    // Clientes filtrados por búsqueda
    const clientesFiltrados = computed(() => {
      if (!searchTerm.value) return clientesOrdenados.value

      const termino = searchTerm.value.toLowerCase()
      return clientesOrdenados.value.filter(cliente =>
        cliente.cedula.toLowerCase().includes(termino) ||
        cliente.nombres.toLowerCase().includes(termino) ||
        cliente.apellidos.toLowerCase().includes(termino)
      )
    })

    // Clientes ordenados
    const clientesOrdenados = computed(() => {
      const clientesArray = [...clientes.value]
      const { campo, direccion } = ordenActual.value

      return clientesArray.sort((a, b) => {
        let valorA = a[campo] || ''
        let valorB = b[campo] || ''

        if (typeof valorA === 'string') {
          valorA = valorA.toLowerCase()
          valorB = valorB.toLowerCase()
        }

        if (direccion === 'asc') {
          return valorA < valorB ? -1 : valorA > valorB ? 1 : 0
        } else {
          return valorA > valorB ? -1 : valorA < valorB ? 1 : 0
        }
      })
    })

    // Paginación
    const totalPages = computed(() => {
      return Math.ceil(clientesFiltrados.value.length / itemsPorPagina)
    })

    const clientesPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * itemsPorPagina
      const fin = inicio + itemsPorPagina
      return clientesFiltrados.value.slice(inicio, fin)
    })

    // Métodos
    const cargarClientes = async () => {
      try {
        globalStore.setLoading(true, 'Cargando clientes...')
        const response = await clienteService.obtenerClientes()
        clientes.value = response.data || response
        globalStore.backendConnected = true
        console.log('✅ Backend conectado exitosamente')
      } catch (error) {
        globalStore.handleApiError(error, 'Error al cargar clientes')
        globalStore.backendConnected = false
        // Usar datos de ejemplo si no hay conexión
        clientes.value = [
          {
            id: 1,
            _id: '1',
            cedula: '12345678',
            nombres: 'Juan Carlos',
            apellidos: 'Pérez García',
            direccion: 'Calle 123 # 45-67',
            telefono: '310-123-4567'
          }
        ]
      } finally {
        globalStore.setLoading(false)
      }
    }

    const cargarPorcinos = async () => {
      try {
        const response = await porcinoService.obtenerPorcinos()
        porcinos.value = response.data || response
      } catch (error) {
        console.warn('Error al cargar porcinos:', error)
        porcinos.value = []
      }
    }

    const getPorcinosCount = (clienteId) => {
      if (!clienteId) return 0

      return porcinos.value.filter(p =>
        p.clienteId === clienteId || p.clienteId?._id === clienteId
      ).length
    }

    const cambiarOrden = (campo) => {
      if (ordenActual.value.campo === campo) {
        ordenActual.value.direccion = ordenActual.value.direccion === 'asc' ? 'desc' : 'asc'
      } else {
        ordenActual.value = { campo, direccion: 'asc' }
      }
    }

    const getSortIcon = (campo) => {
      if (ordenActual.value.campo !== campo) return 'fas fa-sort'
      return ordenActual.value.direccion === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
    }

    const clearSearch = () => {
      searchTerm.value = ''
    }

    const abrirModalCliente = (cliente = null) => {
      clienteSeleccionado.value = cliente
      mostrarModalCliente.value = true
    }

    const cerrarModalCliente = () => {
      mostrarModalCliente.value = false
      clienteSeleccionado.value = null
    }

    const guardarCliente = async (clienteData) => {
      try {
        globalStore.setLoading(true, 'Guardando cliente...')

        if (clienteSeleccionado.value) {
          // Actualizar
          await clienteService.actualizarCliente(
            clienteSeleccionado.value._id || clienteSeleccionado.value.id,
            clienteData
          )
          globalStore.handleSuccess('Cliente actualizado exitosamente')
        } else {
          // Crear
          await clienteService.crearCliente(clienteData)
          globalStore.handleSuccess('Cliente creado exitosamente')
        }

        cerrarModalCliente()
        await cargarClientes()
      } catch (error) {
        globalStore.handleApiError(error, 'Error al guardar cliente')
      } finally {
        globalStore.setLoading(false)
      }
    }

    // ✅ MÉTODOS DE ELIMINACIÓN - ESTE ERA EL PROBLEMA
    const confirmarEliminar = (cliente) => {
      console.log('🔥 CONFIRMAR ELIMINAR EJECUTADO:', cliente) // DEBUG

      if (!cliente) {
        console.error('❌ Cliente no definido')
        globalStore.showNotification('Error: Cliente no encontrado', 'error')
        return
      }

      const clienteId = cliente._id || cliente.id
      const porcinosAsociados = getPorcinosCount(clienteId)

      console.log('🐷 Porcinos asociados:', porcinosAsociados)

      if (porcinosAsociados > 0) {
        console.log('entra al if')
        try {
          console.log('🚀 EJECUTANDO showNotification...')

          const result = globalStore.showNotification(
            `No se puede eliminar el cliente "${cliente.nombres} ${cliente.apellidos}" porque tiene ${porcinosAsociados} porcino(s) asociado(s). Elimina primero sus porcinos.`, 'warning', 6000
          )


          console.log('✅ showNotification ejecutado, resultado:', result)
          console.log('📋 Notificaciones actuales:', globalStore.notifications)

        } catch (error) {
          console.error('❌ ERROR en showNotification:', error)
        }
        return
      }

      console.log('✅ Mostrando modal de confirmación')

      confirmacion.value = {
        titulo: 'Confirmar Eliminación',
        mensaje: `¿Está seguro de eliminar el cliente ${cliente.nombres} ${cliente.apellidos}?\n\nEsta acción no se puede deshacer.`,
        tipo: 'danger',
        accion: () => eliminarCliente(cliente)
      }
      mostrarModalConfirmacion.value = true
    }

    const eliminarCliente = async (cliente) => {
      try {
        console.log('🗑️ ELIMINAR CLIENTE EJECUTADO:', cliente)

        globalStore.setLoading(true, 'Eliminando cliente...')

        const clienteId = cliente._id || cliente.id
        await clienteService.eliminarCliente(clienteId)

        globalStore.handleSuccess('Cliente eliminado exitosamente')
        await cargarClientes()

        console.log('✅ Cliente eliminado exitosamente')
      } catch (error) {
        console.error('❌ Error al eliminar cliente:', error)
        globalStore.handleApiError(error, 'Error al eliminar cliente')
      } finally {
        globalStore.setLoading(false)
      }
    }

    const ejecutarConfirmacion = () => {
      console.log('✅ Usuario confirmó la eliminación')
      if (confirmacion.value.accion) {
        confirmacion.value.accion()
      }
      cerrarModalConfirmacion()
    }

    const cerrarModalConfirmacion = () => {
      console.log('❌ Cerrando modal de confirmación')
      mostrarModalConfirmacion.value = false
      confirmacion.value = {}
    }

    const verDetalle = (cliente) => {
      router.push(`/cliente/${cliente._id || cliente.id}`)
    }

    // Watchers
    watch(searchTerm, () => {
      paginaActual.value = 1
    })

    // Lifecycle
    onMounted(async () => {
      await cargarClientes()
      await cargarPorcinos()
    })

    return {
      // Estado
      clientes,
      porcinos,
      searchTerm,
      ordenActual,
      paginaActual,
      itemsPorPagina,
      mostrarModalCliente,
      clienteSeleccionado,
      mostrarModalConfirmacion,
      confirmacion,

      // Computed
      isLoading,
      clientesFiltrados,
      clientesOrdenados,
      totalPages,
      clientesPaginados,

      // Methods
      cargarClientes,
      cargarPorcinos,
      getPorcinosCount,
      cambiarOrden,
      getSortIcon,
      clearSearch,
      abrirModalCliente,
      cerrarModalCliente,
      guardarCliente,
      confirmarEliminar,
      eliminarCliente,
      ejecutarConfirmacion,
      cerrarModalConfirmacion,
      verDetalle
    }
  }
}
</script>

<style scoped>
.lista-clientes {
  max-width: 100%;
}

/* Header */
.view-header {
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.view-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.view-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-title h2 {
  margin: 0;
  color: #2e7d5e;
}

.count-badge {
  background: #2e7d5e;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.view-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Búsqueda */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: #adb5bd;
  z-index: 2;
}

.search-input {
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  width: 300px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #2e7d5e;
  box-shadow: 0 0 0 3px rgba(46, 125, 94, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  z-index: 2;
}

.clear-search:hover {
  background: #f8f9fa;
}

.btn-new-client {
  white-space: nowrap;
}

/* Tabla */
.table-container {
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #adb5bd;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.empty-state p {
  margin-bottom: 2rem;
}

.table-wrapper {
  overflow-x: auto;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.sort-button {
  background: none;
  border: none;
  font-weight: 600;
  color: #343a40;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-button:hover {
  color: #2e7d5e;
}

.clients-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.client-row:hover {
  background: #f8f9fa;
}

.client-name strong {
  display: block;
  margin-bottom: 0.25rem;
}

.client-name small {
  color: #adb5bd;
  font-size: 0.875rem;
}

.phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
}

.no-phone {
  color: #adb5bd;
  font-style: italic;
}

.pig-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #2e7d5e;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  width: fit-content;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  white-space: nowrap;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2e7d5e;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #267049;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
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

.btn-outline {
  color: #6c757d;
  border: 1px solid #6c757d;
  background: transparent;
}

.btn-outline:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-top: 1px solid #e9ecef;
}

.pagination-info {
  font-weight: 500;
  color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .view-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .view-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input {
    width: 100%;
  }

  .clients-table {
    font-size: 0.875rem;
  }

  .clients-table th,
  .clients-table td {
    padding: 0.75rem 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
