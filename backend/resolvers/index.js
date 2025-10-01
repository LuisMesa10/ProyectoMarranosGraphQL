const Cliente = require('../models/cliente');
const Porcino = require('../models/porcino');
const Alimentacion = require('../models/alimentacion');

const resolvers = {
  // Queries - Para obtener datos
  Query: {
    // ===== CLIENTES =====
    clientes: async () => {
      try {
        const clientesRaw = await Cliente.find().sort({
          createdAt: -1
        });

        return clientesRaw.map(cliente => {
          const clienteObj = cliente.toObject();
          return {
            id: clienteObj._id.toString(),
            nombre: clienteObj.nombre || (clienteObj.nombres && clienteObj.apellidos ?
              `${clienteObj.nombres} ${clienteObj.apellidos}` :
              clienteObj.nombres || clienteObj.apellidos || 'Sin nombre'),
            telefono: clienteObj.telefono || '',
            email: clienteObj.email || '',
            direccion: clienteObj.direccion || '',
            ciudad: clienteObj.ciudad || '',
            cedula: clienteObj.cedula || '',
            nombres: clienteObj.nombres || '',
            apellidos: clienteObj.apellidos || '',
            createdAt: clienteObj.createdAt,
            updatedAt: clienteObj.updatedAt
          };
        });
      } catch (error) {
        console.error('Error en clientes query:', error.message);
        throw new Error('Error al obtener clientes: ' + error.message);
      }
    },

    cliente: async (_, {
      id
    }) => {
      try {
        const cliente = await Cliente.findById(id);
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }

        const clienteObj = cliente.toObject();
        return {
          id: clienteObj._id.toString(),
          nombre: clienteObj.nombre || (clienteObj.nombres && clienteObj.apellidos ?
            `${clienteObj.nombres} ${clienteObj.apellidos}` :
            clienteObj.nombres || clienteObj.apellidos || 'Sin nombre'),
          telefono: clienteObj.telefono || '',
          email: clienteObj.email || '',
          direccion: clienteObj.direccion || '',
          ciudad: clienteObj.ciudad || '',
          cedula: clienteObj.cedula || '',
          nombres: clienteObj.nombres || '',
          apellidos: clienteObj.apellidos || '',
          createdAt: clienteObj.createdAt,
          updatedAt: clienteObj.updatedAt
        };
      } catch (error) {
        console.error('Error en cliente query:', error.message);
        throw new Error('Error al obtener cliente: ' + error.message);
      }
    },

    clientesConPorcinos: async () => {
      try {
        const clientes = await Cliente.find();
        const clientesConPorcinos = [];

        for (let cliente of clientes) {
          const cantidadPorcinos = await Porcino.countDocuments({
            clienteId: cliente._id
          });
          if (cantidadPorcinos > 0) {
            const clienteObj = cliente.toObject();
            clientesConPorcinos.push({
              id: clienteObj._id.toString(),
              nombre: clienteObj.nombre || (clienteObj.nombres && clienteObj.apellidos ?
                `${clienteObj.nombres} ${clienteObj.apellidos}` :
                clienteObj.nombres || clienteObj.apellidos || 'Sin nombre'),
              telefono: clienteObj.telefono || '',
              email: clienteObj.email || '',
              ciudad: clienteObj.ciudad || '',
              cantidadPorcinos,
              createdAt: clienteObj.createdAt,
              updatedAt: clienteObj.updatedAt
            });
          }
        }

        return clientesConPorcinos;
      } catch (error) {
        console.error('Error en clientesConPorcinos query:', error.message);
        throw new Error('Error al obtener clientes con porcinos: ' + error.message);
      }
    },

    clientePorCedula: async (parent, {
      cedula
    }) => {
      return await Cliente.findOne({
        cedula
      });
    },


    // ===== PORCINOS =====
    porcinos: async () => {
      try {
        // NO hacer populate aquí, lo manejaremos en los resolvers específicos
        const porcinosRaw = await Porcino.find().sort({
          createdAt: -1
        });

        return porcinosRaw.map(porcino => {
          const porcinoObj = porcino.toObject();
          return {
            id: porcinoObj._id.toString(),
            identificacion: porcinoObj.identificacion,
            raza: porcinoObj.raza,
            edad: porcinoObj.edad,
            peso: porcinoObj.peso,
            clienteId: porcinoObj.clienteId ? porcinoObj.clienteId.toString() : null,
            alimentacionId: porcinoObj.alimentacionId ? porcinoObj.alimentacionId.toString() : null,
            createdAt: porcinoObj.createdAt,
            updatedAt: porcinoObj.updatedAt
          };
        });
      } catch (error) {
        console.error('Error en porcinos query:', error.message);
        throw new Error('Error al obtener porcinos: ' + error.message);
      }
    },

    porcino: async (_, {
      id
    }) => {
      try {
        const porcino = await Porcino.findById(id);

        if (!porcino) {
          throw new Error('Porcino no encontrado');
        }

        const porcinoObj = porcino.toObject();
        return {
          id: porcinoObj._id.toString(),
          identificacion: porcinoObj.identificacion,
          raza: porcinoObj.raza,
          edad: porcinoObj.edad,
          peso: porcinoObj.peso,
          clienteId: porcinoObj.clienteId ? porcinoObj.clienteId.toString() : null,
          alimentacionId: porcinoObj.alimentacionId ? porcinoObj.alimentacionId.toString() : null,
          createdAt: porcinoObj.createdAt,
          updatedAt: porcinoObj.updatedAt
        };
      } catch (error) {
        console.error('Error en porcino query:', error.message);
        throw new Error('Error al obtener porcino: ' + error.message);
      }
    },

    porcinosPorCliente: async (_, {
      clienteId
    }) => {
      try {
        const porcinosRaw = await Porcino.find({
          clienteId
        }).sort({
          createdAt: -1
        });

        return porcinosRaw.map(porcino => {
          const porcinoObj = porcino.toObject();
          return {
            id: porcinoObj._id.toString(),
            identificacion: porcinoObj.identificacion,
            raza: porcinoObj.raza,
            edad: porcinoObj.edad,
            peso: porcinoObj.peso,
            clienteId: porcinoObj.clienteId ? porcinoObj.clienteId.toString() : null,
            alimentacionId: porcinoObj.alimentacionId ? porcinoObj.alimentacionId.toString() : null,
            createdAt: porcinoObj.createdAt,
            updatedAt: porcinoObj.updatedAt
          };
        });
      } catch (error) {
        console.error('Error en porcinosPorCliente query:', error.message);
        throw new Error('Error al obtener porcinos por cliente: ' + error.message);
      }
    },

    porcinosPorRaza: async (_, {
      raza
    }) => {
      try {
        const porcinosRaw = await Porcino.find({
          raza
        }).sort({
          createdAt: -1
        });

        return porcinosRaw.map(porcino => {
          const porcinoObj = porcino.toObject();
          return {
            id: porcinoObj._id.toString(),
            identificacion: porcinoObj.identificacion,
            raza: porcinoObj.raza,
            edad: porcinoObj.edad,
            peso: porcinoObj.peso,
            clienteId: porcinoObj.clienteId ? porcinoObj.clienteId.toString() : null,
            alimentacionId: porcinoObj.alimentacionId ? porcinoObj.alimentacionId.toString() : null,
            createdAt: porcinoObj.createdAt,
            updatedAt: porcinoObj.updatedAt
          };
        });
      } catch (error) {
        console.error('Error en porcinosPorRaza query:', error.message);
        throw new Error('Error al obtener porcinos por raza: ' + error.message);
      }
    },

    // ===== ALIMENTACIÓN =====
    alimentaciones: async () => {
      try {
        const alimentacionesRaw = await Alimentacion.find().sort({
          createdAt: -1
        });

        return alimentacionesRaw.map(alimentacion => {
          const alimentacionObj = alimentacion.toObject();
          return {
            id: alimentacionObj._id.toString(),
            tipoComida: alimentacionObj.tipoComida || alimentacionObj.descripcion || 'Sin especificar',
            marca: alimentacionObj.marca || 'Sin especificar',
            cantidad: alimentacionObj.cantidad || 0,
            precio: alimentacionObj.precio || 0,
            descripcion: alimentacionObj.descripcion || alimentacionObj.tipoComida || '',
            dosis: alimentacionObj.dosis || '',
            createdAt: alimentacionObj.createdAt,
            updatedAt: alimentacionObj.updatedAt
          };
        });
      } catch (error) {
        console.error('Error en alimentaciones query:', error.message);
        throw new Error('Error al obtener alimentaciones: ' + error.message);
      }
    },

    alimentacion: async (_, {
      id
    }) => {
      try {
        const alimentacion = await Alimentacion.findById(id);
        if (!alimentacion) {
          throw new Error('Alimentación no encontrada');
        }

        const alimentacionObj = alimentacion.toObject();
        return {
          id: alimentacionObj._id.toString(),
          tipoComida: alimentacionObj.tipoComida || alimentacionObj.descripcion || 'Sin especificar',
          marca: alimentacionObj.marca || 'Sin especificar',
          cantidad: alimentacionObj.cantidad || 0,
          precio: alimentacionObj.precio || 0,
          descripcion: alimentacionObj.descripcion || alimentacionObj.tipoComida || '',
          dosis: alimentacionObj.dosis || '',
          createdAt: alimentacionObj.createdAt,
          updatedAt: alimentacionObj.updatedAt
        };
      } catch (error) {
        console.error('Error en alimentacion query:', error.message);
        throw new Error('Error al obtener alimentación: ' + error.message);
      }
    },
  },

  // Mutations - Para crear, actualizar y eliminar
  Mutation: {
    // ===== CLIENTES =====
    crearCliente: async (_, {
      input
    }) => {
      try {
        const clienteData = {
          ...input
        };

        if (clienteData.nombre && !clienteData.nombres && !clienteData.apellidos) {
          const partes = clienteData.nombre.split(' ');
          clienteData.nombres = partes[0] || '';
          clienteData.apellidos = partes.slice(1).join(' ') || '';
        }

        if (!clienteData.nombre && (clienteData.nombres || clienteData.apellidos)) {
          clienteData.nombre = `${clienteData.nombres || ''} ${clienteData.apellidos || ''}`.trim();
        }

        const nuevoCliente = new Cliente(clienteData);
        const clienteGuardado = await nuevoCliente.save();
        const clienteObj = clienteGuardado.toObject();

        return {
          id: clienteObj._id.toString(),
          nombre: clienteObj.nombre || `${clienteObj.nombres || ''} ${clienteObj.apellidos || ''}`.trim(),
          telefono: clienteObj.telefono || '',
          email: clienteObj.email || '',
          direccion: clienteObj.direccion || '',
          ciudad: clienteObj.ciudad || '',
          nombres: clienteObj.nombres || '',
          apellidos: clienteObj.apellidos || '',
          cedula: clienteObj.cedula || '',
          createdAt: clienteObj.createdAt,
          updatedAt: clienteObj.updatedAt
        };
      } catch (error) {
        console.error('Error en crearCliente mutation:', error.message);
        if (error.code === 11000) {
          throw new Error('Ya existe un cliente con estos datos');
        }
        throw new Error('Error al crear cliente: ' + error.message);
      }
    },

    actualizarCliente: async (_, {
      id,
      input
    }) => {
      try {
        const cliente = await Cliente.findByIdAndUpdate(
          id,
          input, {
            new: true,
            runValidators: true
          }
        );

        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }

        const clienteObj = cliente.toObject();
        return {
          id: clienteObj._id.toString(),
          nombre: clienteObj.nombre || `${clienteObj.nombres || ''} ${clienteObj.apellidos || ''}`.trim(),
          telefono: clienteObj.telefono || '',
          email: clienteObj.email || '',
          direccion: clienteObj.direccion || '',
          ciudad: clienteObj.ciudad || '',
          nombres: clienteObj.nombres || '',
          apellidos: clienteObj.apellidos || '',
          cedula: clienteObj.cedula || '',
          createdAt: clienteObj.createdAt,
          updatedAt: clienteObj.updatedAt
        };
      } catch (error) {
        console.error('Error en actualizarCliente mutation:', error.message);
        throw new Error('Error al actualizar cliente: ' + error.message);
      }
    },

    actualizarClientePorCedula: async (_, {
      cedula,
      input
    }) => {
      try {
        const cliente = await Cliente.findOneAndUpdate({
            cedula
          },
          input, {
            new: true,
            runValidators: true
          }
        );
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
        const clienteObj = cliente.toObject();
        return {
          id: clienteObj._id.toString(),
          nombre: clienteObj.nombre || `${clienteObj.nombres || ''} ${clienteObj.apellidos || ''}`.trim(),
          telefono: clienteObj.telefono || '',
          email: clienteObj.email || '',
          direccion: clienteObj.direccion || '',
          ciudad: clienteObj.ciudad || '',
          nombres: clienteObj.nombres || '',
          apellidos: clienteObj.apellidos || '',
          cedula: clienteObj.cedula || '',
          createdAt: clienteObj.createdAt,
          updatedAt: clienteObj.updatedAt
        };
      } catch (error) {
        console.error('Error en actualizarClientePorCedula mutation:', error.message);
        throw new Error('Error al actualizar cliente: ' + error.message);
      }
    },

    eliminarCliente: async (_, {
      id
    }) => {
      try {
        const cantidadPorcinos = await Porcino.countDocuments({
          clienteId: id
        });

        if (cantidadPorcinos > 0) {
          throw new Error(`No se puede eliminar el cliente porque tiene ${cantidadPorcinos} porcino(s) asociado(s)`);
        }

        const cliente = await Cliente.findByIdAndDelete(id);

        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }

        return true;
      } catch (error) {
        console.error('Error en eliminarCliente mutation:', error.message);
        throw new Error('Error al eliminar cliente: ' + error.message);
      }
    },

    actualizarClientePorCedula: async (_, {
      cedula,
      input
    }) => {
      try {
        const cliente = await Cliente.findOneAndUpdate({
            cedula
          },
          input, {
            new: true,
            runValidators: true
          }
        );
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
        const clienteObj = cliente.toObject();
        return {
          id: clienteObj._id.toString(),
          nombre: clienteObj.nombre || `${clienteObj.nombres || ''} ${clienteObj.apellidos || ''}`.trim(),
          telefono: clienteObj.telefono || '',
          email: clienteObj.email || '',
          direccion: clienteObj.direccion || '',
          ciudad: clienteObj.ciudad || '',
          nombres: clienteObj.nombres || '',
          apellidos: clienteObj.apellidos || '',
          cedula: clienteObj.cedula || '',
          createdAt: clienteObj.createdAt,
          updatedAt: clienteObj.updatedAt
        };
      } catch (error) {
        console.error('Error en actualizarClientePorCedula mutation:', error.message);
        throw new Error('Error al actualizar cliente: ' + error.message);
      }
    },


    // ===== PORCINOS =====
    crearPorcino: async (_, {
      input
    }) => {
      try {
        const cliente = await Cliente.findById(input.clienteId);
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }

        const alimentacion = await Alimentacion.findById(input.alimentacionId);
        if (!alimentacion) {
          throw new Error('Alimentación no encontrada');
        }

        const nuevoPorcino = new Porcino(input);
        const porcinoGuardado = await nuevoPorcino.save();
        const porcinoObj = porcinoGuardado.toObject();

        return {
          id: porcinoObj._id.toString(),
          identificacion: porcinoObj.identificacion,
          raza: porcinoObj.raza,
          edad: porcinoObj.edad,
          peso: porcinoObj.peso,
          clienteId: porcinoObj.clienteId.toString(),
          alimentacionId: porcinoObj.alimentacionId.toString(),
          createdAt: porcinoObj.createdAt,
          updatedAt: porcinoObj.updatedAt
        };
      } catch (error) {
        console.error('Error en crearPorcino mutation:', error.message);
        if (error.code === 11000) {
          throw new Error('Ya existe un porcino con esta identificación');
        }
        throw new Error('Error al crear porcino: ' + error.message);
      }
    },

    actualizarPorcino: async (_, {
      id,
      input
    }) => {
      try {
        if (input.alimentacionId) {
          const alimentacion = await Alimentacion.findById(input.alimentacionId);
          if (!alimentacion) {
            throw new Error('Alimentación no encontrada');
          }
        }

        const porcino = await Porcino.findByIdAndUpdate(
          id,
          input, {
            new: true,
            runValidators: true
          }
        );

        if (!porcino) {
          throw new Error('Porcino no encontrado');
        }

        const porcinoObj = porcino.toObject();
        return {
          id: porcinoObj._id.toString(),
          identificacion: porcinoObj.identificacion,
          raza: porcinoObj.raza,
          edad: porcinoObj.edad,
          peso: porcinoObj.peso,
          clienteId: porcinoObj.clienteId.toString(),
          alimentacionId: porcinoObj.alimentacionId.toString(),
          createdAt: porcinoObj.createdAt,
          updatedAt: porcinoObj.updatedAt
        };
      } catch (error) {
        console.error('Error en actualizarPorcino mutation:', error.message);
        throw new Error('Error al actualizar porcino: ' + error.message);
      }
    },

    eliminarPorcino: async (_, {
      id
    }) => {
      try {
        const porcino = await Porcino.findByIdAndDelete(id);

        if (!porcino) {
          throw new Error('Porcino no encontrado');
        }

        return true;
      } catch (error) {
        console.error('Error en eliminarPorcino mutation:', error.message);
        throw new Error('Error al eliminar porcino: ' + error.message);
      }
    },

    // ===== ALIMENTACIÓN =====
    crearAlimentacion: async (_, {
      input
    }) => {
      try {
        const alimentacionData = {
          ...input
        };

        if (alimentacionData.descripcion && !alimentacionData.tipoComida) {
          alimentacionData.tipoComida = alimentacionData.descripcion;
        }

        if (alimentacionData.tipoComida && !alimentacionData.descripcion) {
          alimentacionData.descripcion = alimentacionData.tipoComida;
        }

        if (!alimentacionData.marca && alimentacionData.tipoComida) {
          alimentacionData.marca = 'Sin especificar';
        }

        const nuevaAlimentacion = new Alimentacion(alimentacionData);
        const alimentacionGuardada = await nuevaAlimentacion.save();
        const alimentacionObj = alimentacionGuardada.toObject();

        return {
          id: alimentacionObj._id.toString(),
          tipoComida: alimentacionObj.tipoComida || alimentacionObj.descripcion || 'Sin especificar',
          marca: alimentacionObj.marca || 'Sin especificar',
          cantidad: alimentacionObj.cantidad || 0,
          precio: alimentacionObj.precio || 0,
          descripcion: alimentacionObj.descripcion || alimentacionObj.tipoComida || '',
          dosis: alimentacionObj.dosis || '',
          createdAt: alimentacionObj.createdAt,
          updatedAt: alimentacionObj.updatedAt
        };
      } catch (error) {
        console.error('Error en crearAlimentacion mutation:', error.message);
        throw new Error('Error al crear alimentación: ' + error.message);
      }
    },

    actualizarAlimentacion: async (_, {
      id,
      input
    }) => {
      try {
        const alimentacion = await Alimentacion.findByIdAndUpdate(
          id,
          input, {
            new: true,
            runValidators: true
          }
        );

        if (!alimentacion) {
          throw new Error('Alimentación no encontrada');
        }

        const alimentacionObj = alimentacion.toObject();
        return {
          id: alimentacionObj._id.toString(),
          tipoComida: alimentacionObj.tipoComida || alimentacionObj.descripcion || 'Sin especificar',
          marca: alimentacionObj.marca || 'Sin especificar',
          cantidad: alimentacionObj.cantidad || 0,
          precio: alimentacionObj.precio || 0,
          descripcion: alimentacionObj.descripcion || alimentacionObj.tipoComida || '',
          dosis: alimentacionObj.dosis || '',
          createdAt: alimentacionObj.createdAt,
          updatedAt: alimentacionObj.updatedAt
        };
      } catch (error) {
        console.error('Error en actualizarAlimentacion mutation:', error.message);
        throw new Error('Error al actualizar alimentación: ' + error.message);
      }
    },

    eliminarAlimentacion: async (_, {
      id
    }) => {
      try {
        const cantidadPorcinos = await Porcino.countDocuments({
          alimentacionId: id
        });

        if (cantidadPorcinos > 0) {
          throw new Error(`No se puede eliminar la alimentación porque está siendo usada por ${cantidadPorcinos} porcino(s)`);
        }

        const alimentacion = await Alimentacion.findByIdAndDelete(id);

        if (!alimentacion) {
          throw new Error('Alimentación no encontrada');
        }

        return true;
      } catch (error) {
        console.error('Error en eliminarAlimentacion mutation:', error.message);
        throw new Error('Error al eliminar alimentación: ' + error.message);
      }
    },
  },

  // ============ RESOLVERS DE CAMPOS - CRÍTICO PARA RELACIONES ============
  Cliente: {
    porcinos: async (cliente) => {
      try {
        const porcinosRaw = await Porcino.find({
          clienteId: cliente.id
        });

        return porcinosRaw.map(porcino => {
          const porcinoObj = porcino.toObject();
          return {
            id: porcinoObj._id.toString(),
            identificacion: porcinoObj.identificacion,
            raza: porcinoObj.raza,
            edad: porcinoObj.edad,
            peso: porcinoObj.peso,
            clienteId: porcinoObj.clienteId.toString(),
            alimentacionId: porcinoObj.alimentacionId ? porcinoObj.alimentacionId.toString() : null,
            createdAt: porcinoObj.createdAt,
            updatedAt: porcinoObj.updatedAt
          };
        });
      } catch (error) {
        console.error('Error en Cliente.porcinos resolver:', error.message);
        return [];
      }
    },

    cantidadPorcinos: async (cliente) => {
      try {
        return await Porcino.countDocuments({
          clienteId: cliente.id
        });
      } catch (error) {
        console.error('Error en Cliente.cantidadPorcinos resolver:', error.message);
        return 0;
      }
    },
  },

  // ============ RESOLVER CORREGIDO PARA PORCINO ============
  Porcino: {
    cliente: async (porcino) => {
      try {
        // CRÍTICO: Extraer ID correctamente
        let clienteId = porcino.clienteId;

        // Si clienteId es un objeto (populated), extraer el _id
        if (typeof clienteId === 'object' && clienteId !== null) {
          clienteId = clienteId._id || clienteId.id;
        }

        // Convertir a string si es necesario
        if (clienteId) {
          clienteId = clienteId.toString();
        }

        if (!clienteId) {
          console.log(`⚠️ Porcino ${porcino.identificacion} no tiene clienteId válido`);
          return null;
        }

        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
          console.log(`⚠️ Cliente ${clienteId} no encontrado para porcino ${porcino.identificacion}`);
          return null;
        }

        const clienteObj = cliente.toObject();
        return {
          id: clienteObj._id.toString(),
          nombre: clienteObj.nombre || `${clienteObj.nombres || ''} ${clienteObj.apellidos || ''}`.trim(),
          telefono: clienteObj.telefono || '',
          email: clienteObj.email || '',
          nombres: clienteObj.nombres || '',
          apellidos: clienteObj.apellidos || '',
          createdAt: clienteObj.createdAt,
          updatedAt: clienteObj.updatedAt
        };
      } catch (error) {
        console.error('Error en Porcino.cliente resolver:', error.message);
        return null;
      }
    },

    // ============ RESOLVER CRÍTICO CORREGIDO ============
    alimentacion: async (porcino) => {
      try {
        // CRÍTICO: Extraer ID correctamente
        let alimentacionId = porcino.alimentacionId;

        // Si alimentacionId es un objeto (populated), extraer el _id
        if (typeof alimentacionId === 'object' && alimentacionId !== null) {
          alimentacionId = alimentacionId._id || alimentacionId.id;
        }

        // Convertir a string si es necesario
        if (alimentacionId) {
          alimentacionId = alimentacionId.toString();
        }

        // Verificar que no sea string vacío
        if (!alimentacionId || alimentacionId === '' || alimentacionId === 'null' || alimentacionId === 'undefined') {
          console.log(`⚠️ Porcino ${porcino.identificacion} no tiene alimentacionId válido: "${alimentacionId}"`);
          return null;
        }

        const alimentacion = await Alimentacion.findById(alimentacionId);
        if (!alimentacion) {
          console.log(`⚠️ Alimentación ${alimentacionId} no encontrada para porcino ${porcino.identificacion}`);
          return null;
        }

        const alimentacionObj = alimentacion.toObject();
        return {
          id: alimentacionObj._id.toString(),
          tipoComida: alimentacionObj.tipoComida || alimentacionObj.descripcion || 'Sin especificar',
          marca: alimentacionObj.marca || 'Sin especificar',
          cantidad: alimentacionObj.cantidad || 0,
          precio: alimentacionObj.precio || 0,
          descripcion: alimentacionObj.descripcion || alimentacionObj.tipoComida || '',
          dosis: alimentacionObj.dosis || '',
          createdAt: alimentacionObj.createdAt,
          updatedAt: alimentacionObj.updatedAt
        };
      } catch (error) {
        console.error('Error en Porcino.alimentacion resolver:', error.message);
        console.error('  - Porcino ID:', porcino.id);
        console.error('  - AlimentacionId recibido:', porcino.alimentacionId);
        console.error('  - Tipo de alimentacionId:', typeof porcino.alimentacionId);
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
        const porcinosRaw = await Porcino.find({
          alimentacionId: alimentacion.id
        });

        return porcinosRaw.map(porcino => {
          const porcinoObj = porcino.toObject();
          return {
            id: porcinoObj._id.toString(),
            identificacion: porcinoObj.identificacion,
            raza: porcinoObj.raza,
            edad: porcinoObj.edad,
            peso: porcinoObj.peso,
            clienteId: porcinoObj.clienteId.toString(),
            alimentacionId: porcinoObj.alimentacionId.toString(),
            createdAt: porcinoObj.createdAt,
            updatedAt: porcinoObj.updatedAt
          };
        });
      } catch (error) {
        console.error('Error en Alimentacion.porcinos resolver:', error.message);
        return [];
      }
    },
  },
};

module.exports = resolvers;