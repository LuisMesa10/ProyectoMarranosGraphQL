
// src/apollo/queries.js
import { gql } from '@apollo/client/core';

// ============ QUERIES (LECTURA) ============

// CLIENTES
export const GET_CLIENTES = gql`
  query GetClientes {
    clientes {
      id
      nombre
      telefono
      email
      direccion
      ciudad
      cantidadPorcinos
      createdAt
      updatedAt
    }
  }
`;

export const GET_CLIENTE = gql`
  query GetCliente($id: ID!) {
    cliente(id: $id) {
      id
      nombre
      telefono
      email
      direccion
      ciudad
      cantidadPorcinos
      porcinos {
        id
        identificacion
        razaNombre
        edad
        peso
        alimentacion {
          tipoComida
          marca
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CLIENTES_CON_PORCINOS = gql`
  query GetClientesConPorcinos {
    clientesConPorcinos {
      id
      nombre
      telefono
      email
      ciudad
      cantidadPorcinos
    }
  }
`;

// PORCINOS
export const GET_PORCINOS = gql`
  query GetPorcinos {
    porcinos {
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
      updatedAt
    }
  }
`;

export const GET_PORCINO = gql`
  query GetPorcino($id: ID!) {
    porcino(id: $id) {
      id
      identificacion
      raza
      razaNombre
      edad
      peso
      cliente {
        id
        nombre
        telefono
        email
      }
      alimentacion {
        id
        tipoComida
        marca
        cantidad
        precio
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PORCINOS_POR_CLIENTE = gql`
  query GetPorcinosPorCliente($clienteId: ID!) {
    porcinosPorCliente(clienteId: $clienteId) {
      id
      identificacion
      razaNombre
      edad
      peso
      alimentacion {
        tipoComida
        marca
      }
      createdAt
    }
  }
`;

export const GET_PORCINOS_POR_RAZA = gql`
  query GetPorcinosPorRaza($raza: Int!) {
    porcinosPorRaza(raza: $raza) {
      id
      identificacion
      edad
      peso
      cliente {
        nombre
      }
      alimentacion {
        tipoComida
      }
    }
  }
`;

// ALIMENTACIÓN
export const GET_ALIMENTACIONES = gql`
  query GetAlimentaciones {
    alimentaciones {
      id
      tipoComida
      marca
      cantidad
      precio
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALIMENTACION = gql`
  query GetAlimentacion($id: ID!) {
    alimentacion(id: $id) {
      id
      tipoComida
      marca
      cantidad
      precio
      porcinos {
        id
        identificacion
        cliente {
          nombre
        }
      }
      createdAt
      updatedAt
    }
  }
`;
