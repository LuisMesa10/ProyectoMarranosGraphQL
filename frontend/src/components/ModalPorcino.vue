<template>
  <div class="modal-overlay" @click="cerrarModal">
    <div class="modal-dialog modal-lg" @click.stop>
      <div class="modal-header">
        <h4 class="modal-title">
          <i class="fas fa-pig"></i>
          {{ porcino ? 'Editar Porcino' : 'Nuevo Porcino' }}
        </h4>
        <button @click="cerrarModal" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="guardarPorcino" class="modal-body">
        <div class="form-grid">
          <!-- Identificación -->
          <div class="form-group">
            <label class="form-label required">
              <i class="fas fa-tag"></i>
              Identificación
            </label>
            <input
              v-model="form.identificacion"
              type="text"
              class="form-control"
              :class="{ 'error': errors.identificacion }"
              placeholder="Código único del porcino"
              maxlength="20"
              required
            >
            <small v-if="errors.identificacion" class="error-message">{{ errors.identificacion }}</small>
          </div>

          <!-- Raza -->
          <div class="form-group">
            <label class="form-label required">
              <i class="fas fa-dna"></i>
              Raza
            </label>
            <select
              v-model="form.raza"
              class="form-control"
              :class="{ 'error': errors.raza }"
              required
            >
              <option value="">Seleccionar raza</option>
              <option value="1">Yorkshire</option>
              <option value="2">Hampshire</option>
              <option value="3">Duroc</option>
            </select>
            <small v-if="errors.raza" class="error-message">{{ errors.raza }}</small>
          </div>

          <!-- Edad -->
          <div class="form-group">
            <label class="form-label required">
              <i class="fas fa-calendar-alt"></i>
              Edad (meses)
            </label>
            <input
              v-model.number="form.edad"
              type="number"
              class="form-control"
              :class="{ 'error': errors.edad }"
              placeholder="Edad en meses"
              min="0"
              max="120"
              required
            >
            <small v-if="errors.edad" class="error-message">{{ errors.edad }}</small>
          </div>

          <!-- Peso -->
          <div class="form-group">
            <label class="form-label required">
              <i class="fas fa-weight"></i>
              Peso (kg)
            </label>
            <input
              v-model.number="form.peso"
              type="number"
              step="0.1"
              class="form-control"
              :class="{ 'error': errors.peso }"
              placeholder="Peso en kilogramos"
              min="0"
              max="1000"
              required
            >
            <small v-if="errors.peso" class="error-message">{{ errors.peso }}</small>
          </div>

          <!-- Alimentación -->
          <div class="form-group span-full">
            <label class="form-label required">
              <i class="fas fa-apple-alt"></i>
              Alimentación
            </label>
            <select
              v-model="form.alimentacionId"
              class="form-control"
              :class="{ 'error': errors.alimentacionId }"
              required
            >
              <option value="">Seleccionar alimentación</option>
              <option 
                v-for="alimentacion in alimentaciones" 
                :key="alimentacion._id || alimentacion.id"
                :value="alimentacion._id || alimentacion.id"
              >
                {{ alimentacion.descripcion }}
                <span v-if="alimentacion.dosis"> - {{ alimentacion.dosis }}</span>
              </option>
            </select>
            <small v-if="errors.alimentacionId" class="error-message">{{ errors.alimentacionId }}</small>
            <small v-if="alimentaciones.length === 0" class="warning-message">
              <i class="fas fa-exclamation-triangle"></i>
              No hay alimentaciones disponibles. Créala primero en la pestaña Alimentaciones.
            </small>
          </div>
        </div>

        <!-- Botones -->
        <div class="modal-footer">
          <button type="button" @click="cerrarModal" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button type="submit" :disabled="guardando || alimentaciones.length === 0" class="btn btn-primary">
            <i v-if="guardando" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'ModalPorcino',
  emits: ['guardar', 'cerrar'],
  props: {
    porcino: {
      type: Object,
      default: null
    },
    clienteId: {
      type: String,
      required: true
    },
    alimentaciones: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    // Estado del formulario
    const form = reactive({
      identificacion: '',
      raza: '',
      edad: null,
      peso: null,
      alimentacionId: ''
    })

    // Estado de validación
    const errors = reactive({
      identificacion: '',
      raza: '',
      edad: '',
      peso: '',
      alimentacionId: ''
    })

    // Estado de carga
    const guardando = ref(false)

    // Inicializar formulario
    const inicializarFormulario = () => {
      if (props.porcino) {
        // Modo edición - cargar datos existentes
        form.identificacion = props.porcino.identificacion || ''
        form.raza = props.porcino.raza ? String(props.porcino.raza) : ''
        form.edad = props.porcino.edad || null
        form.peso = props.porcino.peso || null
        form.alimentacionId = props.porcino.alimentacionId?._id || props.porcino.alimentacionId || ''
      } else {
        // Modo creación - limpiar formulario
        form.identificacion = ''
        form.raza = ''
        form.edad = null
        form.peso = null
        form.alimentacionId = ''
      }

      // Limpiar errores
      limpiarErrores()
    }

    // Limpiar errores
    const limpiarErrores = () => {
      errors.identificacion = ''
      errors.raza = ''
      errors.edad = ''
      errors.peso = ''
      errors.alimentacionId = ''
    }

    // Validar formulario
    const validarFormulario = () => {
      limpiarErrores()
      let esValido = true

      // Validar identificación
      if (!form.identificacion.trim()) {
        errors.identificacion = 'La identificación es obligatoria'
        esValido = false
      } else if (form.identificacion.trim().length < 2) {
        errors.identificacion = 'La identificación debe tener al menos 2 caracteres'
        esValido = false
      }

      // Validar raza
      if (!form.raza) {
        errors.raza = 'La raza es obligatoria'
        esValido = false
      }

      // Validar edad
      if (form.edad === null || form.edad === undefined || form.edad === '') {
        errors.edad = 'La edad es obligatoria'
        esValido = false
      } else if (form.edad < 0 || form.edad > 120) {
        errors.edad = 'La edad debe estar entre 0 y 120 meses'
        esValido = false
      }

      // Validar peso
      if (form.peso === null || form.peso === undefined || form.peso === '') {
        errors.peso = 'El peso es obligatorio'
        esValido = false
      } else if (form.peso <= 0 || form.peso > 1000) {
        errors.peso = 'El peso debe estar entre 0.1 y 1000 kg'
        esValido = false
      }

      // Validar alimentación
      if (!form.alimentacionId) {
        errors.alimentacionId = 'La alimentación es obligatoria'
        esValido = false
      }

      return esValido
    }

    // Guardar porcino
    const guardarPorcino = async () => {
      if (!validarFormulario()) {
        return
      }

      guardando.value = true

      try {
        // Preparar datos
        const porcinoData = {
          identificacion: form.identificacion.trim(),
          raza: parseInt(form.raza),
          edad: parseInt(form.edad),
          peso: parseFloat(form.peso),
          alimentacionId: form.alimentacionId,
          clienteId: props.clienteId
        }

        // Emitir evento al componente padre
        emit('guardar', porcinoData)
      } catch (error) {
        console.error('Error en guardarPorcino:', error)
      } finally {
        guardando.value = false
      }
    }

    // Cerrar modal
    const cerrarModal = () => {
      emit('cerrar')
    }

    // Manejar escape key
    const manejarEscape = (event) => {
      if (event.key === 'Escape') {
        cerrarModal()
      }
    }

    // Watchers
    watch(() => props.porcino, () => {
      inicializarFormulario()
    }, { immediate: true })

    // Lifecycle
    onMounted(() => {
      document.addEventListener('keydown', manejarEscape)
      inicializarFormulario()

      // Auto-focus en el primer input
      setTimeout(() => {
        const firstInput = document.querySelector('.modal-dialog input')
        if (firstInput) {
          firstInput.focus()
        }
      }, 100)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', manejarEscape)
    })

    return {
      form,
      errors,
      guardando,
      guardarPorcino,
      cerrarModal
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-dialog {
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-lg {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #2e7d5e;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-button:hover {
  background: #e9ecef;
  color: #2e7d5e;
}

.modal-body {
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  font-size: 0.875rem;
}

.form-label.required::after {
  content: '*';
  color: #dc3545;
  margin-left: 0.25rem;
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

.form-control.error {
  border-color: #dc3545;
}

.form-control.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  color: #dc3545;
  font-size: 0.8125rem;
}

.warning-message {
  display: block;
  margin-top: 0.25rem;
  color: #856404;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

select.form-control {
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  margin-top: 1rem;
}

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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
  transform: translateY(-1px);
}

/* Animaciones */
.modal-overlay {
  animation: fadeIn 0.3s ease-out;
}

.modal-dialog {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-dialog {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn {
    justify-content: center;
  }
}
</style>