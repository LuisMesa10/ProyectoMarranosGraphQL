
// src/composables/useClientes.js
import { ref, computed } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { 
  GET_CLIENTES, 
  GET_CLIENTE,
  GET_CLIENTES_CON_PORCINOS 
} from '@/apollo/queries';
import { 
  CREATE_CLIENTE, 
  UPDATE_CLIENTE, 
  DELETE_CLIENTE 
} from '@/apollo/mutations';

export function useClientes() {
  // Estado reactivo local
  const loading = ref(false);
  const error = ref(null);

  // ===== QUERIES =====

  // Obtener todos los clientes
  const { 
    result: clientesResult, 
    loading: clientesLoading,
    error: clientesError,
    refetch: refetchClientes
  } = useQuery(GET_CLIENTES);

  // Computed para obtener la lista de clientes
  const clientes = computed(() => clientesResult.value?.clientes ?? []);

  // Obtener clientes con porcinos
  const { 
    result: clientesConPorcinosResult,
    loading: clientesConPorcinosLoading,
    refetch: refetchClientesConPorcinos
  } = useQuery(GET_CLIENTES_CON_PORCINOS);

  const clientesConPorcinos = computed(() => 
    clientesConPorcinosResult.value?.clientesConPorcinos ?? []
  );

  // Función para obtener un cliente específico
  const obtenerCliente = (id) => {
    const { result, loading: clienteLoading, error: clienteError } = useQuery(
      GET_CLIENTE,
      { id },
      { 
        enabled: !!id, // Solo ejecutar si hay ID
        fetchPolicy: 'cache-first'
      }
    );

    return {
      cliente: computed(() => result.value?.cliente ?? null),
      loading: clienteLoading,
      error: clienteError
    };
  };

  // ===== MUTATIONS =====

  // Crear cliente
  const { mutate: crearClienteMutation } = useMutation(CREATE_CLIENTE, {
    // Actualizar caché después de crear
    update(cache, { data: { crearCliente } }) {
      // Leer la query existente del caché
      const existingClientes = cache.readQuery({ query: GET_CLIENTES });

      if (existingClientes) {
        // Escribir la nueva data en el caché
        cache.writeQuery({
          query: GET_CLIENTES,
          data: {
            clientes: [crearCliente, ...existingClientes.clientes]
          }
        });
      }
    }
  });

  // Actualizar cliente
  const { mutate: actualizarClienteMutation } = useMutation(UPDATE_CLIENTE);

  // Eliminar cliente
  const { mutate: eliminarClienteMutation } = useMutation(DELETE_CLIENTE, {
    // Actualizar caché después de eliminar
    update(cache, { data: { eliminarCliente } }, { variables }) {
      if (eliminarCliente) {
        // Remover del caché
        cache.evict({ id: cache.identify({ __typename: 'Cliente', id: variables.id }) });
        cache.gc(); // Limpiar referencias huérfanas
      }
    }
  });

  // ===== FUNCIONES DE CONVENIENCIA =====

  const crearCliente = async (clienteData) => {
    try {
      loading.value = true;
      error.value = null;

      const result = await crearClienteMutation({
        input: clienteData
      });

      return result.data.crearCliente;
    } catch (err) {
      error.value = err.message;
      console.error('Error al crear cliente:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const actualizarCliente = async (id, clienteData) => {
    try {
      loading.value = true;
      error.value = null;

      const result = await actualizarClienteMutation({
        id,
        input: clienteData
      });

      // Refetch para asegurar datos actualizados
      await refetchClientes();

      return result.data.actualizarCliente;
    } catch (err) {
      error.value = err.message;
      console.error('Error al actualizar cliente:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const eliminarCliente = async (id) => {
    try {
      loading.value = true;
      error.value = null;

      const result = await eliminarClienteMutation({ id });

      if (result.data.eliminarCliente) {
        // Refetch para asegurar datos actualizados
        await refetchClientes();
        await refetchClientesConPorcinos();
        return true;
      }

      return false;
    } catch (err) {
      error.value = err.message;
      console.error('Error al eliminar cliente:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Función de utilidad para buscar clientes
  const buscarClientes = (termino) => {
    return computed(() => {
      if (!termino) return clientes.value;

      const terminoLower = termino.toLowerCase();
      return clientes.value.filter(cliente => 
        cliente.nombre.toLowerCase().includes(terminoLower) ||
        cliente.email.toLowerCase().includes(terminoLower) ||
        cliente.telefono.includes(termino)
      );
    });
  };

  return {
    // Datos reactivos
    clientes,
    clientesConPorcinos,
    loading: computed(() => loading.value || clientesLoading.value || clientesConPorcinosLoading.value),
    error: computed(() => error.value || clientesError.value),

    // Funciones
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
    refetchClientes,
    refetchClientesConPorcinos
  };
}
