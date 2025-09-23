<template>
  <div class="modal-overlay" @click="cerrarModal">
    <div class="modal-dialog" @click.stop>
      <div class="modal-header">
        <h4 class="modal-title">
          <i class="fas fa-apple-alt"></i>
          {{ alimentacion ? 'Editar Alimentación' : 'Nueva Alimentación' }}
        </h4>
        <button @click="cerrarModal" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="guardarAlimentacion" class="modal-body">
        <!-- Descripción -->
        <div class="form-group">
          <label class="form-label required">
            <i class="fas fa-tag"></i>
            Descripción
          </label>
          <input
            v-model="form.descripcion"
            type="text"
            class="form-control"
            :class="{ 'error': errors.descripcion }"
            placeholder="Nombre de la alimentación"
            maxlength="100"
            required
          >
          <small v-if="errors.descripcion" class="error-message">{{ errors.descripcion }}</small>
        </div>

        <!-- Dosis -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-prescription-bottle"></i>
            Dosis
          </label>
          <input
            v-model="form.dosis"
            type="text"
            class="form-control"
            :class="{ 'error': errors.dosis }"
            placeholder="Cantidad y frecuencia (opcional)"
            maxlength="50"
          >
          <small class="form-help">Ejemplo: "500g cada 8 horas", "2 tazas por día"</small>
          <small v-if="errors.dosis" class="error-message">{{ errors.dosis }}</small>
        </div>

        <!-- Botones -->
        <div class="modal-footer">
          <button type="button" @click="cerrarModal" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button type="submit" :disabled="guardando" class="btn btn-primary">
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
  name: 'ModalAlimentacion',
  emits: ['guardar', 'cerrar'],
  props: {
    alimentacion: {
      type: Object,
      default: null
    }
  },
  setup(props, { emit }) {
    // Estado del formulario
    const form = reactive({
      descripcion: '',
      dosis: ''
    })

    // Estado de validación
    const errors = reactive({
      descripcion: '',
      dosis: ''
    })

    // Estado de carga
    const guardando = ref(false)

    // Inicializar formulario
    const inicializarFormulario = () => {
      if (props.alimentacion) {
        // Modo edición - cargar datos existentes
        form.descripcion = props.alimentacion.descripcion || ''
        form.dosis = props.alimentacion.dosis || ''
      } else {
        // Modo creación - limpiar formulario
        form.descripcion = ''
        form.dosis = ''
      }

      // Limpiar errores
      limpiarErrores()
    }

    // Limpiar errores
    const limpiarErrores = () => {
      errors.descripcion = ''
      errors.dosis = ''
    }

    // Validar formulario
    const validarFormulario = () => {
      limpiarErrores()
      let esValido = true

      // Validar descripción
      if (!form.descripcion.trim()) {
        errors.descripcion = 'La descripción es obligatoria'
        esValido = false
      } else if (form.descripcion.trim().length < 3) {
        errors.descripcion = 'La descripción debe tener al menos 3 caracteres'
        esValido = false
      }

      // Validar dosis (opcional, pero si se ingresa debe tener formato válido)
      if (form.dosis.trim() && form.dosis.trim().length < 2) {
        errors.dosis = 'La dosis debe tener al menos 2 caracteres'
        esValido = false
      }

      return esValido
    }

    // Guardar alimentación
    const guardarAlimentacion = async () => {
      if (!validarFormulario()) {
        return
      }

      guardando.value = true

      try {
        // Preparar datos
        const alimentacionData = {
          descripcion: form.descripcion.trim(),
          dosis: form.dosis.trim() || undefined
        }

        // Emitir evento al componente padre
        emit('guardar', alimentacionData)
      } catch (error) {
        console.error('Error en guardarAlimentacion:', error)
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
    watch(() => props.alimentacion, () => {
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
      guardarAlimentacion,
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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.form-group {
  margin-bottom: 1.5rem;
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

.form-help {
  display: block;
  margin-top: 0.25rem;
  color: #6c757d;
  font-size: 0.8125rem;
  font-style: italic;
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  color: #dc3545;
  font-size: 0.8125rem;
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

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn {
    justify-content: center;
  }
}
</style>