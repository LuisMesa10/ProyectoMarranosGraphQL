
// src/apollo/mutations.js
import { gql } from '@apollo/client/core';

// ============= MUTATIONS (ESCRITURA) =============

// CLIENTES
export const CREAR_CLIENTE = gql`
  mutation CrearCliente($input: ClienteInput!) {
    crearCliente(input: $input) {
      id
      nombre
      nombres
      apellidos
      telefono
      email
      direccion
      ciudad
      cedula
      createdAt
    }
  }
`;

export const ACTUALIZAR_CLIENTE = gql`
  mutation ActualizarCliente($id: ID!, $input: ClienteUpdateInput!) {
    actualizarCliente(id: $id, input: $input) {
      id
      nombre
      nombres
      apellidos
      telefono
      email
      direccion
      ciudad
      cedula
      updatedAt
    }
  }
`;

export const ELIMINAR_CLIENTE = gql`
  mutation EliminarCliente($id: ID!) {
    eliminarCliente(id: $id)
  }
`;

// PORCINOS
export const CREAR_PORCINO = gql`
  mutation CrearPorcino($input: PorcinoInput!) {
    crearPorcino(input: $input) {
      id
      identificacion
      raza
      razaNombre
      edad
      peso
      cliente {
        id
        nombre
      }
      alimentacion {
        id
        tipoComida
      }
      createdAt
    }
  }
`;

export const ACTUALIZAR_PORCINO = gql`
  mutation ActualizarPorcino($id: ID!, $input: PorcinoUpdateInput!) {
    actualizarPorcino(id: $id, input: $input) {
      id
      identificacion
      raza
      razaNombre
      edad
      peso
      updatedAt
    }
  }
`;

export const ELIMINAR_PORCINO = gql`
  mutation EliminarPorcino($id: ID!) {
    eliminarPorcino(id: $id)
  }
`;

// ALIMENTACIÓN
export const CREAR_ALIMENTACION = gql`
  mutation CrearAlimentacion($input: AlimentacionInput!) {
    crearAlimentacion(input: $input) {
      id
      tipoComida
      marca
      cantidad
      precio
      descripcion
      dosis
      createdAt
    }
  }
`;

export const ACTUALIZAR_ALIMENTACION = gql`
  mutation ActualizarAlimentacion($id: ID!, $input: AlimentacionUpdateInput!) {
    actualizarAlimentacion(id: $id, input: $input) {
      id
      tipoComida
      marca
      cantidad
      precio
      descripcion
      dosis
      updatedAt
    }
  }
`;

export const ELIMINAR_ALIMENTACION = gql`
  mutation EliminarAlimentacion($id: ID!) {
    eliminarAlimentacion(id: $id)
  }
`;
