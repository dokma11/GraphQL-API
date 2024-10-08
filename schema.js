export const types = `#graphql
    type User {
        id: ID!
        name: String!
        email: String!
    }

    type Query {
        users: [User]
    }

    type Mutation {
        addUser(name: String!, email: String!): User
        updateUser(id: ID!, name: String, email: String): User
        deleteUser(id: ID!): [User]
    }
`
