
// src/apollo/mutations.js
import { gql } from '@apollo/client/core';

// ============ MUTATIONS (ESCRITURA) ============

// CLIENTES
export const CREATE_CLIENTE = gql`
  mutation CreateCliente($input: ClienteInput!) {
    crearCliente(input: $input) {
      id
      nombre
      telefono
      email
      direccion
      ciudad
      createdAt
    }
  }
`;

export const UPDATE_CLIENTE = gql`
  mutation UpdateCliente($id: ID!, $input: ClienteUpdateInput!) {
    actualizarCliente(id: $id, input: $input) {
      id
      nombre
      telefono
      email
      direccion
      ciudad
      updatedAt
    }
  }
`;

export const DELETE_CLIENTE = gql`
  mutation DeleteCliente($id: ID!) {
    eliminarCliente(id: $id)
  }
`;

// PORCINOS
export const CREATE_PORCINO = gql`
  mutation CreatePorcino($input: PorcinoInput!) {
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
        marca
      }
      createdAt
    }
  }
`;

export const UPDATE_PORCINO = gql`
  mutation UpdatePorcino($id: ID!, $input: PorcinoUpdateInput!) {
    actualizarPorcino(id: $id, input: $input) {
      id
      identificacion
      raza
      razaNombre
      edad
      peso
      alimentacion {
        id
        tipoComida
        marca
      }
      updatedAt
    }
  }
`;

export const DELETE_PORCINO = gql`
  mutation DeletePorcino($id: ID!) {
    eliminarPorcino(id: $id)
  }
`;

// ALIMENTACIÓN
export const CREATE_ALIMENTACION = gql`
  mutation CreateAlimentacion($input: AlimentacionInput!) {
    crearAlimentacion(input: $input) {
      id
      tipoComida
      marca
      cantidad
      precio
      createdAt
    }
  }
`;

export const UPDATE_ALIMENTACION = gql`
  mutation UpdateAlimentacion($id: ID!, $input: AlimentacionUpdateInput!) {
    actualizarAlimentacion(id: $id, input: $input) {
      id
      tipoComida
      marca
      cantidad
      precio
      updatedAt
    }
  }
`;

export const DELETE_ALIMENTACION = gql`
  mutation DeleteAlimentacion($id: ID!) {
    eliminarAlimentacion(id: $id)
  }
`;
