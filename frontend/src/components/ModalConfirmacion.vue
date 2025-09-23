<template>
  <div class="modal-overlay" @click="cancelar">
    <div class="modal-dialog" @click.stop :class="'modal-' + tipo">
      <div class="modal-header">
        <h4 class="modal-title">
          <i :class="iconoTipo"></i>
          {{ titulo }}
        </h4>
      </div>

      <div class="modal-body">
        <p>{{ mensaje }}</p>
      </div>

      <div class="modal-footer">
        <button @click="cancelar" class="btn btn-secondary">
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        <button @click="confirmar" :class="botonClase">
          <i :class="iconoBoton"></i>
          {{ textoBoton }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'ModalConfirmacion',
  emits: ['confirmar', 'cancelar'],
  props: {
    titulo: {
      type: String,
      default: 'Confirmar Acción'
    },
    mensaje: {
      type: String,
      required: true
    },
    tipo: {
      type: String,
      default: 'warning', // warning, danger, info, success
      validator: (value) => ['warning', 'danger', 'info', 'success'].includes(value)
    }
  },
  setup(props, { emit }) {
    // Computed properties para diferentes tipos
    const iconoTipo = computed(() => {
      const iconos = {
        warning: 'fas fa-exclamation-triangle',
        danger: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle'
      }
      return iconos[props.tipo] || iconos.warning
    })

    const iconoBoton = computed(() => {
      const iconos = {
        warning: 'fas fa-exclamation-triangle',
        danger: 'fas fa-trash',
        info: 'fas fa-check',
        success: 'fas fa-check'
      }
      return iconos[props.tipo] || iconos.warning
    })

    const textoBoton = computed(() => {
      const textos = {
        warning: 'Continuar',
        danger: 'Eliminar',
        info: 'Confirmar',
        success: 'Aceptar'
      }
      return textos[props.tipo] || textos.warning
    })

    const botonClase = computed(() => {
      const clases = {
        warning: 'btn btn-warning',
        danger: 'btn btn-danger',
        info: 'btn btn-primary',
        success: 'btn btn-success'
      }
      return clases[props.tipo] || clases.warning
    })

    // Métodos
    const confirmar = () => {
      emit('confirmar')
    }

    const cancelar = () => {
      emit('cancelar')
    }

    // Manejar escape key
    const manejarEscape = (event) => {
      if (event.key === 'Escape') {
        cancelar()
      }
    }

    // Lifecycle
    onMounted(() => {
      document.addEventListener('keydown', manejarEscape)

      // Auto-focus en el botón de cancelar para seguridad
      setTimeout(() => {
        const cancelButton = document.querySelector('.btn-secondary')
        if (cancelButton) {
          cancelButton.focus()
        }
      }, 100)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', manejarEscape)
    })

    return {
      iconoTipo,
      iconoBoton,
      textoBoton,
      botonClase,
      confirmar,
      cancelar
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
  z-index: 1050;
  padding: 1rem;
}

.modal-dialog {
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  max-width: 400px;
  width: 100%;
  overflow: hidden;
}

.modal-warning {
  border-left: 4px solid #ffc107;
}

.modal-danger {
  border-left: 4px solid #dc3545;
}

.modal-info {
  border-left: 4px solid #0dcaf0;
}

.modal-success {
  border-left: 4px solid #198754;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
}

.modal-warning .modal-title {
  color: #664d03;
}

.modal-danger .modal-title {
  color: #842029;
}

.modal-info .modal-title {
  color: #055160;
}

.modal-success .modal-title {
  color: #0f5132;
}

.modal-body {
  padding: 2rem;
}

.modal-body p {
  margin: 0;
  color: #495057;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
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
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0b5ed7;
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

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #ffca2c;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #bb2d3b;
  transform: translateY(-1px);
}

.btn-success {
  background-color: #198754;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #157347;
  transform: translateY(-1px);
}

/* Animaciones */
.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.modal-dialog {
  animation: scaleIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
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