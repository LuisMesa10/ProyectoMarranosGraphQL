import axios from 'axios'

// Configuración base de axios
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Interceptor para requests
API.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
API.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('[API Error]:', error.response?.data || error.message)

    // Manejar errores específicos
    if (error.response?.status === 404) {
      throw new Error('Recurso no encontrado')
    } else if (error.response?.status >= 500) {
      throw new Error('Error interno del servidor')
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else {
      throw new Error('Error de conexión con el servidor')
    }
  }
)

// Servicios de Cliente
export const clienteService = {
  // Obtener todos los clientes
  async obtenerClientes() {
    return await API.get('/clientes')
  },

  // Obtener cliente por ID
  async obtenerClientePorId(id) {
    return await API.get(`/clientes/${id}`)
  },

  // Crear cliente
  async crearCliente(clienteData) {
    return await API.post('/clientes', clienteData)
  },

  // Actualizar cliente
  async actualizarCliente(id, clienteData) {
    return await API.put(`/clientes/${id}`, clienteData)
  },

  // Eliminar cliente
  async eliminarCliente(id) {
    return await API.delete(`/clientes/${id}`)
  },

  // Reporte por cédula
  async reportePorCedula(cedula) {
    return await API.get(`/clientes/reporte/cedula/${cedula}`)
  },

  // Reporte general
  async reporteGeneral() {
    return await API.get('/clientes/reporte/general')
  },

  // Generar PDF
  async generarPDF(cedula) {
    const response = await axios.get(
      `${API.defaults.baseURL}/clientes/reporte/pdf/${cedula}`, {
        responseType: 'blob',
        timeout: 30000
      }
    )

    // Crear URL del blob para descarga
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte-cliente-${cedula}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return true
  }
}

// Servicios de Porcino
export const porcinoService = {
  // Obtener todos los porcinos (opcional: filtrar por clienteId)
  async obtenerPorcinos(clienteId = null) {
    const params = clienteId ? {
      clienteId
    } : {}
    return await API.get('/porcinos', {
      params
    })
  },

  // Obtener porcino por ID
  async obtenerPorcinoPorId(id) {
    return await API.get(`/porcinos/${id}`)
  },

  // Crear porcino
  async crearPorcino(porcinoData) {
    return await API.post('/porcinos', porcinoData)
  },

  // Actualizar porcino
  async actualizarPorcino(id, porcinoData) {
    return await API.put(`/porcinos/${id}`, porcinoData)
  },

  // Eliminar porcino
  async eliminarPorcino(id) {
    return await API.delete(`/porcinos/${id}`)
  },

  // Obtener porcinos por cliente
  async obtenerPorcinosPorCliente(clienteId) {
    return await API.get(`/porcinos/cliente/${clienteId}`)
  }
}

// Servicios de Alimentación
export const alimentacionService = {
  // Obtener todas las alimentaciones
  async obtenerAlimentaciones() {
    return await API.get('/alimentacion')
  },

  // Obtener alimentación por ID
  async obtenerAlimentacionPorId(id) {
    return await API.get(`/alimentacion/${id}`)
  },

  // Crear alimentación
  async crearAlimentacion(alimentacionData) {
    return await API.post('/alimentacion', alimentacionData)
  },

  // Actualizar alimentación
  async actualizarAlimentacion(id, alimentacionData) {
    return await API.put(`/alimentacion/${id}`, alimentacionData)
  },

  // Eliminar alimentación
  async eliminarAlimentacion(id) {
    return await API.delete(`/alimentacion/${id}`)
  }
}

// Servicio de utilidades
export const utilsService = {
  // Verificar conexión con el backend
  async verificarConexion() {
    try {
      await API.get('/clientes')
      return true
    } catch (error) {
      console.warn('[Connection Check]:', error.message) // ✅ USAR el error
      return false
    }
  },

  // Obtener estadísticas generales
  async obtenerEstadisticas() {
    // ✅ REMOVER try/catch innecesario - dejar que el error se propague
    const [clientes, porcinos, alimentaciones] = await Promise.all([
      API.get('/clientes'),
      API.get('/porcinos'),
      API.get('/alimentacion')
    ])

    return {
      totalClientes: clientes.data?.length || 0,
      totalPorcinos: porcinos.data?.length || 0,
      totalAlimentaciones: alimentaciones.data?.length || 0
    }
  }
}

// Utilidades para manejo de razas
export const RAZAS = {
  1: 'York',
  2: 'Hampshire',
  3: 'Duroc'
}

export const getRazaNombre = (razaId) => {
  return RAZAS[razaId] || 'Desconocida'
}

export const getRazasOptions = () => {
  return Object.entries(RAZAS).map(([id, nombre]) => ({
    value: parseInt(id),
    label: nombre
  }))
}

// Validaciones del frontend
export const validaciones = {
  cedula: (cedula) => {
    if (!cedula) return 'La cédula es obligatoria'
    if (!/^\d{6,10}$/.test(cedula)) return 'La cédula debe tener entre 6 y 10 dígitos'
    return null
  },

  nombres: (nombres) => {
    if (!nombres) return 'Los nombres son obligatorios'
    if (nombres.length < 2) return 'Los nombres deben tener al menos 2 caracteres'
    return null
  },

  apellidos: (apellidos) => {
    if (!apellidos) return 'Los apellidos son obligatorios'
    if (apellidos.length < 2) return 'Los apellidos deben tener al menos 2 caracteres'
    return null
  },

  telefono: (telefono) => {
    if (telefono && !/^[0-9\-+\s()]+$/.test(telefono)) {
      return 'El teléfono solo puede contener números, espacios y los símbolos +, -, ()'
    }
    return null
  },

  identificacionPorcino: (identificacion) => {
    if (!identificacion) return 'La identificación es obligatoria'
    if (identificacion.length < 2) return 'La identificación debe tener al menos 2 caracteres'
    return null
  },

  edad: (edad) => {
    const edadNum = parseInt(edad)
    if (!edad) return 'La edad es obligatoria'
    if (isNaN(edadNum) || edadNum < 0) return 'La edad debe ser un número positivo'
    if (edadNum > 120) return 'La edad no puede exceder 120 meses'
    return null
  },

  peso: (peso) => {
    const pesoNum = parseFloat(peso)
    if (!peso) return 'El peso es obligatorio'
    if (isNaN(pesoNum) || pesoNum <= 0) return 'El peso debe ser un número positivo'
    if (pesoNum > 500) return 'El peso no puede exceder 500 kg'
    return null
  },

  raza: (raza) => {
    const razaNum = parseInt(raza)
    if (!raza) return 'La raza es obligatoria'
    if (![1, 2, 3].includes(razaNum)) return 'Debe seleccionar una raza válida'
    return null
  },

  descripcionAlimentacion: (descripcion) => {
    if (!descripcion) return 'La descripción es obligatoria'
    if (descripcion.length < 3) return 'La descripción debe tener al menos 3 caracteres'
    if (descripcion.length > 200) return 'La descripción no puede exceder 200 caracteres'
    return null
  }
}

export default API
