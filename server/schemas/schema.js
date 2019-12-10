const {gql, makeExecutableSchema} = require('apollo-server-express');
const {Role} = require('../models/role');

const validatePermissions = (permissions) => {
    if (permissions) {
        for (let perm of permissions) {
            let perm_splitted = perm.split(':');
            if (perm_splitted.length !== 2) {
                return {
                    error: true, perm,
                    msg: `Error: Invalid permission, [${perm}] does not conform to the format: ENTITY: PERMISSION`
                };
            } else if (perm_splitted[0].length === 0) {
                return {
                    error: true, perm,
                    msg: `Error: Invalid permission, ENTITY part in [${perm}] is empty`
                };
            } else if (perm_splitted[1].length === 0) {
                return {
                    error: true, perm,
                    msg: `Error: Invalid permission, PERMISSION part in [${perm}] is empty`
                };
            } else if (perm_splitted[0] !== perm_splitted[0].toUpperCase()) {
                return {
                    error: true, perm,
                    msg: `Error: Invalid permission, ENTITY part in [${perm}] must have all uppercase letters`
                };
            } else if (perm_splitted[1] !== perm_splitted[1].toUpperCase()) {
                return {
                    error: true, perm,
                    msg: `Error: Invalid permission, PERMISSION part in [${perm}] must have all uppercase letters`
                };
            }
        }
        return permissions;
    }
    return []
};

const typeDefs = gql`
    type Role {
        id: ID!
        name: String!
        permissions: [String]
    }
    type Query {
        getRoles: [Role]
        getRole(id: ID!): Role
        getDuplicatedRoles:[Role]
    }
    type Mutation {
        addRole(name: String!, permissions:[String]): Role
        updateRole(id: ID!, name: String, permissions:[String]): Role
        deleteRole(id: ID!): Role
        addPermsToRole(id: ID!, permissions:[String]): Role
        addPermsToRoles(ids: [ID]!, permissions:[String]): [Role]
        deletePermissionsToRole(id: ID!, permissions:[String]): Role
        deletePermissionsToRoles(ids: [ID]!, permissions:[String]): [Role]
        deleteAllPermissionsToRole(id: ID!): Role
        deleteAllPermissionsToRoles(ids: [ID]!): [Role]
    }
`;

const resolvers = {
    Query: {
        getRoles(parent, args) {
            return Role.find({});
        },
        getRole(parent, args) {
            return Role.findById(args.id);
        },
        getDuplicatedRoles(parent, args) {
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
    },
    Mutation: {
        addRole: (parent, args) => {
            let permissions = validatePermissions(args.permissions);
            if (permissions.error) {
                return new Error(permissions.msg)
            }
            let roleModel = new Role({name: args.name, permissions: permissions});
            let newRole = roleModel.save();
            return (newRole) ? newRole : new Error('Database Error');
        },
        updateRole: (parent, args) => {
            if (!args.id) return;
            let permissions = validatePermissions(args.permissions);
            if (permissions.error) {
                return new Error(permissions.msg)
            }
            return Role.findOneAndUpdate(
                {_id: args.id},
                {$set: {name: args.name, permissions: {$each: permissions.sort()}}},
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
        addPermsToRole(parent, args) {
            let permissions = validatePermissions(args.permissions);
            if (permissions.error) {
                return new Error(permissions.msg)
            }
            return Role.findOneAndUpdate(
                {_id: args.id},
                {$addToSet: {permissions: {$each: permissions.sort()}}},
                (err) => {
                    if (err) console.log(err);
                }
            )
        },
        addPermsToRoles(parent, args) {
            let permissions = validatePermissions(args.permissions);
            if (permissions.error) {
                return new Error(permissions.msg)
            }
            Role.updateMany(
                {_id: {$in: args.ids}},
                {$addToSet: {permissions: {$each: permissions.sort()}}},
                (err) => {
                    if (err) console.log(err);
                }
            );
            return Role.find({_id: {$in: args.ids}});
        },
        deletePermissionsToRole(parent, args) {
            return Role.findOneAndUpdate(
                {_id: args.id},
                {$pullAll: {permissions: args.permissions}},
                (err) => {
                    if (err) console.log(err);
                }
            )
        },
        deletePermissionsToRoles(parent, args) {
            Role.updateMany(
                {_id: {$in: args.ids}},
                {$pullAll: {permissions: args.permissions}},
                (err) => {
                    if (err) console.log(err);
                }
            );
            return Role.find({_id: {$in: args.ids}});
        },
        deleteAllPermissionsToRole(parent, args) {
            return Role.findOneAndUpdate(
                {_id: args.id},
                {$set: {permissions: []}},
                (err) => {
                    if (err) console.log(err);
                }
            )
        },
        deleteAllPermissionsToRoles(parent, args) {
            Role.updateMany(
                {_id: {$in: args.ids}},
                {$set: {permissions: []}},
                (err) => {
                    if (err) console.log(err);
                }
            );
            return Role.find({_id: {$in: args.ids}});
        },
    }
};

module.exports = makeExecutableSchema({
    typeDefs: [typeDefs],
    resolvers
});