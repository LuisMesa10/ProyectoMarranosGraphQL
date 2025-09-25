
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Tipos de datos
  type Cliente {
    id: ID!
    nombre: String!
    telefono: String!
    email: String!
    direccion: String!
    ciudad: String!
    porcinos: [Porcino!]!
    cantidadPorcinos: Int
    createdAt: String!
    updatedAt: String!
  }

  type Porcino {
    id: ID!
    identificacion: String!
    raza: Int!
    razaNombre: String!
    edad: Int!
    peso: Float!
    cliente: Cliente!
    alimentacion: Alimentacion!
    clienteId: String!
    alimentacionId: String!
    createdAt: String!
    updatedAt: String!
  }

  type Alimentacion {
    id: ID!
    tipoComida: String!
    marca: String!
    cantidad: Float!
    precio: Float!
    porcinos: [Porcino!]!
    createdAt: String!
    updatedAt: String!
  }

  # Inputs para crear y actualizar
  input ClienteInput {
    nombre: String!
    telefono: String!
    email: String!
    direccion: String!
    ciudad: String!
  }

  input PorcinoInput {
    identificacion: String!
    raza: Int!
    edad: Int!
    peso: Float!
    clienteId: String!
    alimentacionId: String!
  }

  input AlimentacionInput {
    tipoComida: String!
    marca: String!
    cantidad: Float!
    precio: Float!
  }

  # Inputs para actualizar (campos opcionales)
  input ClienteUpdateInput {
    nombre: String
    telefono: String
    email: String
    direccion: String
    ciudad: String
  }

  input PorcinoUpdateInput {
    identificacion: String
    raza: Int
    edad: Int
    peso: Float
    alimentacionId: String
  }

  input AlimentacionUpdateInput {
    tipoComida: String
    marca: String
    cantidad: Float
    precio: Float
  }

  # Queries - Para leer datos
  type Query {
    # Clientes
    clientes: [Cliente!]!
    cliente(id: ID!): Cliente
    clientesConPorcinos: [Cliente!]!

    # Porcinos
    porcinos: [Porcino!]!
    porcino(id: ID!): Porcino
    porcinosPorCliente(clienteId: ID!): [Porcino!]!
    porcinosPorRaza(raza: Int!): [Porcino!]!

    # Alimentación
    alimentaciones: [Alimentacion!]!
    alimentacion(id: ID!): Alimentacion
  }

  # Mutations - Para crear, actualizar y eliminar datos
  type Mutation {
    # Clientes
    crearCliente(input: ClienteInput!): Cliente!
    actualizarCliente(id: ID!, input: ClienteUpdateInput!): Cliente!
    eliminarCliente(id: ID!): Boolean!

    # Porcinos
    crearPorcino(input: PorcinoInput!): Porcino!
    actualizarPorcino(id: ID!, input: PorcinoUpdateInput!): Porcino!
    eliminarPorcino(id: ID!): Boolean!

    # Alimentación
    crearAlimentacion(input: AlimentacionInput!): Alimentacion!
    actualizarAlimentacion(id: ID!, input: AlimentacionUpdateInput!): Alimentacion!
    eliminarAlimentacion(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
