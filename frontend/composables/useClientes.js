
// src/composables/useClientes.js
import { ref, reactive } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { GET_CLIENTES, GET_CLIENTE } from '../apollo/queries'
import { 
  CREAR_CLIENTE, 
  ACTUALIZAR_CLIENTE, 
  ELIMINAR_CLIENTE 
} from '../apollo/mutations'

export function useClientes() {
  // Estado reactivo
  const clientes = ref([])
  const cliente = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Query para obtener todos los clientes
  const {
    result: clientesResult,
    loading: clientesLoading,
    error: clientesError,
    refetch: refetchClientes
  } = useQuery(GET_CLIENTES, null, {
    fetchPolicy: 'cache-and-network'
  })

  // Mutation para crear cliente
  const { mutate: crearClienteMutation } = useMutation(CREAR_CLIENTE, {
    update: (cache, { data: { crearCliente } }) => {
      // Actualizar cache después de crear
      const data = cache.readQuery({ query: GET_CLIENTES })
      cache.writeQuery({
        query: GET_CLIENTES,
        data: {
          clientes: [...(data?.clientes || []), crearCliente]
        }
      })
    }
  })

  // Mutation para actualizar cliente
  const { mutate: actualizarClienteMutation } = useMutation(ACTUALIZAR_CLIENTE)

  // Mutation para eliminar cliente
  const { mutate: eliminarClienteMutation } = useMutation(ELIMINAR_CLIENTE, {
    update: (cache, { data: { eliminarCliente } }, { variables }) => {
      if (eliminarCliente) {
        // Remover del cache
        const data = cache.readQuery({ query: GET_CLIENTES })
        cache.writeQuery({
          query: GET_CLIENTES,
          data: {
            clientes: data?.clientes?.filter(c => c.id !== variables.id) || []
          }
        })
      }
    }
  })

  // Funciones helper
  const obtenerClientes = async () => {
    try {
      loading.value = true
      await refetchClientes()
      clientes.value = clientesResult.value?.clientes || []
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo clientes:', err)
    } finally {
      loading.value = false
    }
  }

  const obtenerCliente = async (id) => {
    try {
      loading.value = true
      const { result } = await useQuery(GET_CLIENTE, { id })
      cliente.value = result.value?.cliente
      return cliente.value
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo cliente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const crearCliente = async (clienteData) => {
    try {
      loading.value = true
      const result = await crearClienteMutation({
        input: clienteData
      })

      // Refrescar lista
      await refetchClientes()
      return result.data.crearCliente
    } catch (err) {
      error.value = err.message
      console.error('Error creando cliente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const actualizarCliente = async (id, clienteData) => {
    try {
      loading.value = true
      const result = await actualizarClienteMutation({
        id,
        input: clienteData
      })

      // Refrescar lista
      await refetchClientes()
      return result.data.actualizarCliente
    } catch (err) {
      error.value = err.message
      console.error('Error actualizando cliente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const eliminarCliente = async (id) => {
    try {
      loading.value = true
      const result = await eliminarClienteMutation({ id })

      if (result.data.eliminarCliente) {
        // Refrescar lista
        await refetchClientes()
        return true
      }
      return false
    } catch (err) {
      error.value = err.message
      console.error('Error eliminando cliente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    clientes: clientesResult,
    cliente,
    loading: clientesLoading,
    error: clientesError,

    // Funciones
    obtenerClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    refetchClientes
  }
}
