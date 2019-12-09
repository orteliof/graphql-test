const { gql, makeExecutableSchema } = require('apollo-server-express');
const { Role } = require('../models/role');

const typeDefs = gql`
  type Role {
    id: ID!
    name: String!
    permissions: [String]
  }
  type Query {
    getRoles: [Role]
    getRole(id: ID!): Role
  }
  type Mutation {
    addRole(name: String!, permissions:[String]): Role
    updateRole(id: ID!, name: String, permissions:[String]): Role
    deleteRole(id: ID!): Role

    addPermsToRol(id: ID!, permissions:[String]): Role
    addPermsToRoles(ids: [ID]!, permissions:[String]): [Role]
    deleteAllPermissionToRol(id: ID!): Role
    deleteAllPermissionToRoles(ids: [ID]!): [Role]
    # duplicatedRoles():[Role]
  }
`;

const resolvers = {
    Query: {
        getRoles(parent, args) {
            return Role.find({});
        },
        getRole(parent, args) {
            return Role.findById(args.id);
        }
    },
    Mutation: {
        addRole: (parent, args) => {
            let roleModel = new Role(args);
            let newRole = roleModel.save();
            return (newRole) ? newRole : new Error('Error');
        },
        updateRole: (parent, args) => {
            if (!args.id) return;
            return Role.findOneAndUpdate(
                { _id: args.id },
                { $set: args },
                { new: true },
                (err) => { if (err) return next(err) }
            )
        },
        deleteRole: (parent, args) => {
            const remRole = Role.findOneAndRemove({ _id: args.id }).exec();
            if (!remRole) throw new Error('Error');
            return remRole;
        },
        addPermsToRol(parent, args) {
            return Role.findOneAndUpdate(
                { _id: args.id },
                { $addToSet: { permissions: { $each: args.permissions } } },
                (err) => { if (err) return next(err) }
            )
        },
        addPermsToRoles(parent, args) {
            Role.updateMany(
                { _id: { $in: args.ids } },
                { $addToSet: { permissions: { $each: args.permissions } } },
                (err) => { if (err) return next(err) }
            );
            return Role.find({ _id: { $in: args.ids } });
        },
        deleteAllPermissionToRol(parent, args) {
            return Role.findOneAndUpdate(
                { _id: args.id },
                { $set: { permissions: [] } },
                (err) => { if (err) return next(err) }
            )
        },
        deleteAllPermissionToRoles(parent, args) {
            Role.updateMany(
                { _id: { $in: args.ids } },
                { $set: { permissions: [] } },
                (err) => { if (err) return next(err) }
            );
            return Role.find({ _id: { $in: args.ids } });
        },
        // duplicatedRoles(parent, args) {
        //   return
        // },
    }
};

module.exports = makeExecutableSchema({
    typeDefs: [typeDefs],
    resolvers
});