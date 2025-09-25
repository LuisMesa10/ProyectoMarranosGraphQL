
const Cliente = require('../models/cliente');
const Porcino = require('../models/porcino');
const Alimentacion = require('../models/alimentacion');

const resolvers = {
  // Queries - Para obtener datos
  Query: {
    // ===== CLIENTES =====
    clientes: async () => {
      try {
        return await Cliente.find().sort({ createdAt: -1 });
      } catch (error) {
        throw new Error(`Error al obtener clientes: ${error.message}`);
      }
    },

    cliente: async (_, { id }) => {
      try {
        const cliente = await Cliente.findById(id);
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
        return cliente;
      } catch (error) {
        throw new Error(`Error al obtener cliente: ${error.message}`);
      }
    },

    clientesConPorcinos: async () => {
      try {
        const clientes = await Cliente.find();
        const clientesConPorcinos = [];

        for (let cliente of clientes) {
          const cantidadPorcinos = await Porcino.countDocuments({ clienteId: cliente._id });
          if (cantidadPorcinos > 0) {
            clientesConPorcinos.push({
              ...cliente.toObject(),
              cantidadPorcinos
            });
          }
        }

        return clientesConPorcinos;
      } catch (error) {
        throw new Error(`Error al obtener clientes con porcinos: ${error.message}`);
      }
    },

    // ===== PORCINOS =====
    porcinos: async () => {
      try {
        return await Porcino.find()
          .populate('clienteId', 'nombre telefono')
          .populate('alimentacionId', 'tipoComida marca')
          .sort({ createdAt: -1 });
      } catch (error) {
        throw new Error(`Error al obtener porcinos: ${error.message}`);
      }
    },

    porcino: async (_, { id }) => {
      try {
        const porcino = await Porcino.findById(id)
          .populate('clienteId')
          .populate('alimentacionId');

        if (!porcino) {
          throw new Error('Porcino no encontrado');
        }
        return porcino;
      } catch (error) {
        throw new Error(`Error al obtener porcino: ${error.message}`);
      }
    },

    porcinosPorCliente: async (_, { clienteId }) => {
      try {
        return await Porcino.find({ clienteId })
          .populate('clienteId')
          .populate('alimentacionId')
          .sort({ createdAt: -1 });
      } catch (error) {
        throw new Error(`Error al obtener porcinos por cliente: ${error.message}`);
      }
    },

    porcinosPorRaza: async (_, { raza }) => {
      try {
        return await Porcino.find({ raza })
          .populate('clienteId', 'nombre')
          .populate('alimentacionId', 'tipoComida marca')
          .sort({ createdAt: -1 });
      } catch (error) {
        throw new Error(`Error al obtener porcinos por raza: ${error.message}`);
      }
    },

    // ===== ALIMENTACIÓN =====
    alimentaciones: async () => {
      try {
        return await Alimentacion.find().sort({ createdAt: -1 });
      } catch (error) {
        throw new Error(`Error al obtener alimentaciones: ${error.message}`);
      }
    },

    alimentacion: async (_, { id }) => {
      try {
        const alimentacion = await Alimentacion.findById(id);
        if (!alimentacion) {
          throw new Error('Alimentación no encontrada');
        }
        return alimentacion;
      } catch (error) {
        throw new Error(`Error al obtener alimentación: ${error.message}`);
      }
    },
  },

  // Mutations - Para crear, actualizar y eliminar
  Mutation: {
    // ===== CLIENTES =====
    crearCliente: async (_, { input }) => {
      try {
        const nuevoCliente = new Cliente(input);
        return await nuevoCliente.save();
      } catch (error) {
        if (error.code === 11000) {
          throw new Error('Ya existe un cliente con este email');
        }
        throw new Error(`Error al crear cliente: ${error.message}`);
      }
    },

    actualizarCliente: async (_, { id, input }) => {
      try {
        const cliente = await Cliente.findByIdAndUpdate(
          id, 
          input, 
          { new: true, runValidators: true }
        );

        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
        return cliente;
      } catch (error) {
        throw new Error(`Error al actualizar cliente: ${error.message}`);
      }
    },

    eliminarCliente: async (_, { id }) => {
      try {
        // Verificar si el cliente tiene porcinos asociados
        const cantidadPorcinos = await Porcino.countDocuments({ clienteId: id });

        if (cantidadPorcinos > 0) {
          throw new Error(`No se puede eliminar el cliente porque tiene ${cantidadPorcinos} porcino(s) asociado(s)`);
        }

        const cliente = await Cliente.findByIdAndDelete(id);

        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }

        return true;
      } catch (error) {
        throw new Error(`Error al eliminar cliente: ${error.message}`);
      }
    },

    // ===== PORCINOS =====
    crearPorcino: async (_, { input }) => {
      try {
        // Verificar que existan el cliente y la alimentación
        const cliente = await Cliente.findById(input.clienteId);
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }

        const alimentacion = await Alimentacion.findById(input.alimentacionId);
        if (!alimentacion) {
          throw new Error('Alimentación no encontrada');
        }

        const nuevoPorcino = new Porcino(input);
        return await nuevoPorcino.save();
      } catch (error) {
        if (error.code === 11000) {
          throw new Error('Ya existe un porcino con esta identificación');
        }
        throw new Error(`Error al crear porcino: ${error.message}`);
      }
    },

    actualizarPorcino: async (_, { id, input }) => {
      try {
        // Si se está actualizando la alimentación, verificar que existe
        if (input.alimentacionId) {
          const alimentacion = await Alimentacion.findById(input.alimentacionId);
          if (!alimentacion) {
            throw new Error('Alimentación no encontrada');
          }
        }

        const porcino = await Porcino.findByIdAndUpdate(
          id, 
          input, 
          { new: true, runValidators: true }
        );

        if (!porcino) {
          throw new Error('Porcino no encontrado');
        }
        return porcino;
      } catch (error) {
        throw new Error(`Error al actualizar porcino: ${error.message}`);
      }
    },

    eliminarPorcino: async (_, { id }) => {
      try {
        const porcino = await Porcino.findByIdAndDelete(id);

        if (!porcino) {
          throw new Error('Porcino no encontrado');
        }

        return true;
      } catch (error) {
        throw new Error(`Error al eliminar porcino: ${error.message}`);
      }
    },

    // ===== ALIMENTACIÓN =====
    crearAlimentacion: async (_, { input }) => {
      try {
        const nuevaAlimentacion = new Alimentacion(input);
        return await nuevaAlimentacion.save();
      } catch (error) {
        throw new Error(`Error al crear alimentación: ${error.message}`);
      }
    },

    actualizarAlimentacion: async (_, { id, input }) => {
      try {
        const alimentacion = await Alimentacion.findByIdAndUpdate(
          id, 
          input, 
          { new: true, runValidators: true }
        );

        if (!alimentacion) {
          throw new Error('Alimentación no encontrada');
        }
        return alimentacion;
      } catch (error) {
        throw new Error(`Error al actualizar alimentación: ${error.message}`);
      }
    },

    eliminarAlimentacion: async (_, { id }) => {
      try {
        // Verificar si la alimentación está siendo usada por porcinos
        const cantidadPorcinos = await Porcino.countDocuments({ alimentacionId: id });

        if (cantidadPorcinos > 0) {
          throw new Error(`No se puede eliminar la alimentación porque está siendo usada por ${cantidadPorcinos} porcino(s)`);
        }

        const alimentacion = await Alimentacion.findByIdAndDelete(id);

        if (!alimentacion) {
          throw new Error('Alimentación no encontrada');
        }

        return true;
      } catch (error) {
        throw new Error(`Error al eliminar alimentación: ${error.message}`);
      }
    },
  },

  // Resolvers de campos - Para manejar relaciones entre tipos
  Cliente: {
    porcinos: async (cliente) => {
      try {
        return await Porcino.find({ clienteId: cliente.id })
          .populate('alimentacionId');
      } catch (error) {
        return [];
      }
    },

    cantidadPorcinos: async (cliente) => {
      try {
        return await Porcino.countDocuments({ clienteId: cliente.id });
      } catch (error) {
        return 0;
      }
    },
  },

  Porcino: {
    cliente: async (porcino) => {
      try {
        return await Cliente.findById(porcino.clienteId);
      } catch (error) {
        return null;
      }
    },

    alimentacion: async (porcino) => {
      try {
        return await Alimentacion.findById(porcino.alimentacionId);
      } catch (error) {
        return null;
      }
    },

    razaNombre: (porcino) => {
      const razas = {
        1: 'York',
        2: 'Hampshire',
        3: 'Duroc'
      };
      return razas[porcino.raza] || 'Desconocida';
    },
  },

  Alimentacion: {
    porcinos: async (alimentacion) => {
      try {
        return await Porcino.find({ alimentacionId: alimentacion.id })
          .populate('clienteId');
      } catch (error) {
        return [];
      }
    },
  },
};

module.exports = resolvers;
