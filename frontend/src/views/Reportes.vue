<template>
  <div class="reportes">
    <!-- Header de la vista -->
    <div class="view-header">
      <div class="view-header-content">
        <div class="view-title">
          <i class="fas fa-chart-bar"></i>
          <h2>Sistema de Reportes</h2>
        </div>
        <div class="view-subtitle">
          Genera reportes detallados de clientes y porcinos
        </div>
      </div>
    </div>

    <!-- Sección de Reporte por Cédula -->
    <section class="report-section">
      <div class="section-header">
        <h3>
          <i class="fas fa-search"></i>
          Reporte por Cliente
        </h3>
        <p class="section-description">
          Busca un cliente por su cédula y obtén un reporte completo con sus porcinos
        </p>
      </div>

      <div class="section-content">
        <form @submit.prevent="buscarPorCedula" class="search-form">
          <div class="search-group">
            <div class="input-group">
              <i class="fas fa-id-card input-icon"></i>
              <input
                v-model="cedulaBusqueda"
                type="text"
                placeholder="Ingrese la cédula del cliente..."
                class="search-input"
                maxlength="10"
                @input="limpiarResultados"
              >
              <button
                type="submit"
                :disabled="!cedulaBusqueda.trim() || buscandoCliente"
                class="search-button"
              >
                <i v-if="buscandoCliente" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-search"></i>
                {{ buscandoCliente ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
          </div>
        </form>

        <!-- Resultado de búsqueda por cédula -->
        <div v-if="reporteCliente" class="report-result">
          <div class="client-card">
            <div class="client-header">
              <div class="client-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="client-info">
                <h4>{{ reporteCliente.cliente.nombres }} {{ reporteCliente.cliente.apellidos }}</h4>
                <p>
                  <i class="fas fa-id-card"></i>
                  {{ reporteCliente.cliente.cedula }}
                </p>
                <div class="client-meta">
                  <span v-if="reporteCliente.cliente.telefono">
                    <i class="fas fa-phone"></i>
                    {{ reporteCliente.cliente.telefono }}
                  </span>
                  <span v-if="reporteCliente.cliente.direccion">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ reporteCliente.cliente.direccion }}
                  </span>
                </div>
              </div>
              <div class="client-actions">
                <button
                  @click="descargarPDF(reporteCliente.cliente.cedula)"
                  :disabled="generandoPDF"
                  class="btn btn-primary"
                >
                  <i v-if="generandoPDF" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-file-pdf"></i>
                  {{ generandoPDF ? 'Generando...' : 'Descargar PDF' }}
                </button>
              </div>
            </div>

            <!-- Estadísticas del cliente -->
            <div class="client-stats">
              <div class="stat-item">
                <div class="stat-number">{{ reporteCliente.totalPorcinos }}</div>
                <div class="stat-label">
                  <i class="fas fa-pig"></i>
                  Porcinos
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ reporteCliente.pesoTotal }} kg</div>
                <div class="stat-label">
                  <i class="fas fa-weight"></i>
                  Peso Total
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ promedioEdad }} meses</div>
                <div class="stat-label">
                  <i class="fas fa-calendar"></i>
                  Edad Promedio
                </div>
              </div>
            </div>

            <!-- Lista de porcinos -->
            <div v-if="reporteCliente.porcinos.length > 0" class="porcinos-section">
              <h5>
                <i class="fas fa-pig"></i>
                Porcinos Registrados
              </h5>
              <div class="porcinos-table-container">
                <table class="porcinos-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Raza</th>
                      <th>Edad</th>
                      <th>Peso</th>
                      <th>Alimentación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="porcino in reporteCliente.porcinos" :key="porcino._id">
                      <td class="id-cell">{{ porcino.identificacion }}</td>
                      <td>
                        <span :class="'raza-badge raza-' + porcino.raza">
                          {{ getRazaNombre(porcino.raza) }}
                        </span>
                      </td>
                      <td>{{ porcino.edad }} meses</td>
                      <td class="weight-cell">{{ porcino.peso }} kg</td>
                      <td>{{ getAlimentacionNombre(porcino.alimentacionId) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else class="no-porcinos">
              <i class="fas fa-pig"></i>
              <p>Este cliente no tiene porcinos registrados</p>
            </div>
          </div>
        </div>

        <!-- Error de búsqueda -->
        <div v-if="errorBusqueda" class="search-error">
          <i class="fas fa-exclamation-circle"></i>
          <h4>Cliente no encontrado</h4>
          <p>{{ errorBusqueda }}</p>
        </div>
      </div>
    </section>

    <!-- Sección de Reporte General -->
    <section class="report-section">
      <div class="section-header">
        <h3>
          <i class="fas fa-list-alt"></i>
          Reporte General
        </h3>
        <p class="section-description">
          Obtén un resumen completo de todos los clientes y sus porcinos
        </p>
      </div>

      <div class="section-content">
        <!--
        <div class="general-actions">
          <button
            @click="generarReporteGeneral"
            :disabled="cargandoGeneral"
            class="btn btn-secondary btn-lg"
          >
            <i v-if="cargandoGeneral" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-chart-line"></i>
            {{ cargandoGeneral ? 'Generando...' : 'Generar Reporte General' }}
          </button>
        </div>
        -->

        <!-- Resumen general -->
        <div v-if="reporteGeneral" class="general-report">
          <!-- Estadísticas globales -->
          <div class="global-stats">
            <div class="stat-card primary">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ reporteGeneral.resumen.totalClientes }}</div>
                <div class="stat-label">Clientes Registrados</div>
              </div>
            </div>
            <div class="stat-card success">
              <div class="stat-icon">
                <i class="fas fa-pig"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ reporteGeneral.resumen.totalPorcinos }}</div>
                <div class="stat-label">Porcinos Total</div>
              </div>
            </div>
            <div class="stat-card warning">
              <div class="stat-icon">
                <i class="fas fa-weight"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ reporteGeneral.resumen.pesoTotalGeneral }} kg</div>
                <div class="stat-label">Peso Total Global</div>
              </div>
            </div>
          </div>

          <!-- Lista de clientes -->
          <div class="clients-summary">
            <div class="summary-header">
              <h4>
                <i class="fas fa-users"></i>
                Resumen por Cliente
              </h4>
              <div class="summary-filters">
                <select v-model="filtroOrden" class="filter-select">
                  <option value="nombre">Ordenar por Nombre</option>
                  <option value="porcinos">Ordenar por Cantidad de Porcinos</option>
                  <option value="peso">Ordenar por Peso Total</option>
                </select>
              </div>
            </div>

            <div class="clients-grid">
              <div
                v-for="item in clientesOrdenados"
                :key="item.cliente._id"
                class="client-summary-card"
              >
                <div class="card-header">
                  <h5>{{ item.cliente.nombres }} {{ item.cliente.apellidos }}</h5>
                  <span class="client-cedula">{{ item.cliente.cedula }}</span>
                </div>
                <div class="card-stats">
                  <div class="mini-stat">
                    <i class="fas fa-pig"></i>
                    {{ item.totalPorcinos }} porcinos
                  </div>
                  <div class="mini-stat">
                    <i class="fas fa-weight"></i>
                    {{ item.pesoTotal }} kg
                  </div>
                </div>
                <div class="card-actions">
                  <button
                    @click="buscarClienteDirecto(item.cliente.cedula)"
                    class="btn btn-sm btn-outline-primary"
                  >
                    <i class="fas fa-eye"></i>
                    Ver Detalle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { clienteService, getRazaNombre } from '@/services/apiService'
import { useGlobalStore } from '@/stores/globalStore'

export default {
  name: 'ReportesView',
  setup() {
    const globalStore = useGlobalStore()

    // Estado de búsqueda por cédula
    const cedulaBusqueda = ref('')
    const reporteCliente = ref(null)
    const errorBusqueda = ref('')
    const buscandoCliente = ref(false)
    const generandoPDF = ref(false)

    // Estado de reporte general
    const reporteGeneral = ref(null)
    const cargandoGeneral = ref(false)
    const filtroOrden = ref('nombre')

    // Computed properties
    const promedioEdad = computed(() => {
      if (!reporteCliente.value || reporteCliente.value.porcinos.length === 0) return 0
      const edades = reporteCliente.value.porcinos.map(p => p.edad)
      const promedio = edades.reduce((sum, edad) => sum + edad, 0) / edades.length
      return Math.round(promedio * 10) / 10 // Redondear a 1 decimal
    })

    const clientesOrdenados = computed(() => {
      if (!reporteGeneral.value) return []

      const clientes = [...reporteGeneral.value.reporte]

      switch (filtroOrden.value) {
        case 'nombre':
          return clientes.sort((a, b) =>
            `${a.cliente.nombres} ${a.cliente.apellidos}`.localeCompare(
              `${b.cliente.nombres} ${b.cliente.apellidos}`
            )
          )
        case 'porcinos':
          return clientes.sort((a, b) => b.totalPorcinos - a.totalPorcinos)
        case 'peso':
          return clientes.sort((a, b) => b.pesoTotal - a.pesoTotal)
        default:
          return clientes
      }
    })

    // Métodos de búsqueda por cédula
    const buscarPorCedula = async () => {
      if (!cedulaBusqueda.value.trim()) return

      buscandoCliente.value = true
      errorBusqueda.value = ''
      reporteCliente.value = null

      try {
        const response = await clienteService.reportePorCedula(cedulaBusqueda.value.trim())
        reporteCliente.value = response.data
        globalStore.handleSuccess('Reporte generado exitosamente')
      } catch (error) {
        errorBusqueda.value = error.message || 'Cliente no encontrado'
        console.error('Error al buscar cliente:', error)
      } finally {
        buscandoCliente.value = false
      }
    }

    const buscarClienteDirecto = async (cedula) => {
      cedulaBusqueda.value = cedula
      await buscarPorCedula()
    }

    const limpiarResultados = () => {
      reporteCliente.value = null
      errorBusqueda.value = ''
    }

    const descargarPDF = async (cedula) => {
      generandoPDF.value = true

      try {
        await clienteService.generarPDF(cedula)
        globalStore.handleSuccess('PDF descargado exitosamente')
      } catch (error) {
        globalStore.handleApiError(error, 'Error al generar PDF')
      } finally {
        generandoPDF.value = false
      }
    }

    // Métodos de reporte general
    const generarReporteGeneral = async () => {
      cargandoGeneral.value = true

      try {
        const response = await clienteService.reporteGeneral()
        reporteGeneral.value = response.data
        globalStore.handleSuccess('Reporte general generado exitosamente')
      } catch (error) {
        globalStore.handleApiError(error, 'Error al generar reporte general')
      } finally {
        cargandoGeneral.value = false
      }
    }

    // Métodos auxiliares
    const getAlimentacionNombre = (alimentacionId) => {
      if (!alimentacionId) return 'Sin alimentación'

      if (typeof alimentacionId === 'object' && alimentacionId.descripcion) {
        return alimentacionId.descripcion
      }

      return 'Alimentación no especificada'
    }

    // Lifecycle
    onMounted(() => {
      // Auto-generar reporte general al cargar la vista
      generarReporteGeneral()
    })

    return {
      // Estado búsqueda por cédula
      cedulaBusqueda,
      reporteCliente,
      errorBusqueda,
      buscandoCliente,
      generandoPDF,

      // Estado reporte general
      reporteGeneral,
      cargandoGeneral,
      filtroOrden,

      // Computed
      promedioEdad,
      clientesOrdenados,

      // Métodos
      buscarPorCedula,
      buscarClienteDirecto,
      limpiarResultados,
      descargarPDF,
      generarReporteGeneral,
      getRazaNombre,
      getAlimentacionNombre
    }
  }
}
</script>

<style scoped>
.reportes {
  max-width: 100%;
}

/* Header */
.view-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--white);
  border-radius: var(--border-radius);
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.view-header-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.view-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.view-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
}

/* Secciones */
.report-section {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-header {
  background: var(--gray-50);
  padding: 2rem;
  border-bottom: 1px solid var(--gray-200);
}

.section-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
}

.section-description {
  margin: 0;
  color: var(--gray-600);
  font-size: 1rem;
}

.section-content {
  padding: 2rem;
}

/* Formulario de búsqueda */
.search-form {
  margin-bottom: 2rem;
}

.search-group {
  max-width: 600px;
  margin: 0 auto;
}

.input-group {
  display: flex;
  align-items: stretch;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
}

.input-icon {
  background: var(--gray-100);
  padding: 1rem;
  color: var(--gray-500);
  border: 1px solid var(--gray-300);
  border-right: none;
}

.search-input {
  flex: 1;
  padding: 1rem;
  border: 1px solid var(--gray-300);
  border-left: none;
  border-right: none;
  font-size: 1rem;
  outline: none;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(46, 125, 94, 0.1);
}

.search-button {
  background: var(--primary-color);
  color: var(--white);
  border: 1px solid var(--primary-color);
  padding: 1rem 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-button:hover:not(:disabled) {
  background: #267049;
  transform: translateY(-1px);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Resultado de búsqueda */
.report-result {
  margin-top: 2rem;
}

.client-card {
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.client-header {
  background: var(--gray-50);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.client-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 2rem;
}

.client-info {
  flex: 1;
}

.client-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.client-info p {
  margin: 0 0 0.75rem 0;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.client-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.client-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-500);
  font-size: 0.875rem;
}

.client-stats {
  background: var(--white);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid var(--gray-200);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
}

/* Sección de porcinos */
.porcinos-section {
  padding: 2rem;
}

.porcinos-section h5 {
  margin: 0 0 1.5rem 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
}

.porcinos-table-container {
  overflow-x: auto;
}

.porcinos-table {
  width: 100%;
  border-collapse: collapse;
}

.porcinos-table th {
  background: var(--gray-50);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 2px solid var(--gray-200);
}

.porcinos-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-200);
  vertical-align: middle;
}

.id-cell {
  font-weight: 600;
  color: var(--primary-color);
}

.weight-cell {
  font-weight: 600;
  color: var(--success-color);
}

.raza-badge {
  background: var(--primary-color);
  color: var(--white);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
}

.raza-1 { background: #28a745; }
.raza-2 { background: #007bff; }
.raza-3 { background: #fd7e14; }

/* Estados vacíos y errores */
.no-porcinos,
.search-error {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--gray-500);
}

.no-porcinos i,
.search-error i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--gray-300);
}

.search-error {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
}

.search-error h4 {
  color: var(--danger-color);
  margin-bottom: 0.5rem;
}

/* Reporte general */
.general-actions {
  text-align: center;
  margin-bottom: 2rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.global-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--white);
  border-radius: var(--border-radius);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-left: 4px solid;
  box-shadow: var(--box-shadow);
}

.stat-card.primary {
  border-left-color: var(--primary-color);
}

.stat-card.success {
  border-left-color: var(--success-color);
}

.stat-card.warning {
  border-left-color: var(--warning-color);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--white);
}

.stat-card.primary .stat-icon {
  background: var(--primary-color);
}

.stat-card.success .stat-icon {
  background: var(--success-color);
}

.stat-card.warning .stat-icon {
  background: var(--warning-color);
}

.stat-content .stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-content .stat-label {
  color: var(--gray-600);
  font-weight: 500;
}

/* Resumen de clientes */
.clients-summary {
  background: var(--gray-50);
  border-radius: var(--border-radius);
  padding: 2rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.summary-header h4 {
  margin: 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  background: var(--white);
  color: var(--gray-700);
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.client-summary-card {
  background: var(--white);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  transition: transform 0.3s;
}

.client-summary-card:hover {
  transform: translateY(-2px);
}

.client-summary-card .card-header {
  margin-bottom: 1rem;
}

.client-summary-card h5 {
  margin: 0 0 0.25rem 0;
  color: var(--primary-color);
  font-size: 1.125rem;
}

.client-cedula {
  color: var(--gray-500);
  font-size: 0.875rem;
}

.card-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.card-actions {
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .view-header {
    padding: 2rem 1rem;
  }

  .view-header-content h2 {
    font-size: 2rem;
  }

  .section-header,
  .section-content {
    padding: 1rem;
  }

  .client-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .client-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .global-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
    gap: 1rem;
  }

  .summary-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .clients-grid {
    grid-template-columns: 1fr;
  }

  .porcinos-table {
    font-size: 0.875rem;
  }

  .input-group {
    flex-direction: column;
    border-radius: 0;
  }

  .input-icon,
  .search-input,
  .search-button {
    border-radius: var(--border-radius);
    border: 1px solid var(--gray-300);
  }
}
</style>
