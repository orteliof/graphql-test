const {gql, makeExecutableSchema} = require('apollo-server-express');
const {Role} = require('../models/role');

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
        duplicatedRoles:[Role]
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
                {_id: args.id},
                {$set: {name: args.name, permissions: {$each: args.permissions.sort()}}},
                {new: true},
                (err) => {
                    if (err) console.log(err);
                }
            )
        },
        deleteRole: (parent, args) => {
            const remRole = Role.findOneAndRemove({_id: args.id}).exec();
            if (!remRole) throw new Error('Error');
            return remRole;
        },
        addPermsToRol(parent, args) {
            return Role.findOneAndUpdate(
                {_id: args.id},
                {$addToSet: {permissions: {$each: args.permissions.sort()}}},
                (err) => {
                    if (err) console.log(err);
                }
            )
        },
        addPermsToRoles(parent, args) {
            Role.updateMany(
                {_id: {$in: args.ids}},
                {$addToSet: {permissions: {$each: args.permissions.sort()}}},
                (err) => {
                    if (err) console.log(err);
                }
            );
            return Role.find({_id: {$in: args.ids}});
        },
        deleteAllPermissionToRol(parent, args) {
            return Role.findOneAndUpdate(
                {_id: args.id},
                {$set: {permissions: []}},
                (err) => {
                    if (err) console.log(err);
                }
            )
        },
        deleteAllPermissionToRoles(parent, args) {
            Role.updateMany(
                {_id: {$in: args.ids}},
                {$set: {permissions: []}},
                (err) => {
                    if (err) console.log(err);
                }
            );
            return Role.find({_id: {$in: args.ids}});
        },
        duplicatedRoles(parent, args) {
            let cursor = Role.aggregate([
                {
                    $group: {
                        _id: {permissions: "$permissions"},
                        dups: {$addToSet: "$_id"},
                        count: {$sum: 1}
                    }
                },
                {
                    $match: {_id: {$ne: null}, count: {$gt: 1}}
                },
            ]);

            return cursor.exec().then(groups => {
                let arrayids = [];
                groups.forEach((group, index) => {
                    let ids = group.dups.map(id => id.toString());
                    arrayids = arrayids.concat(ids);
                });
                return arrayids;
            }).then(ids => {
                return Role.find({_id: {$in: ids}});
            });
        },
    }
};

module.exports = makeExecutableSchema({
    typeDefs: [typeDefs],
    resolvers
});