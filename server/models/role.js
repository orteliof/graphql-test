const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema(
    {
        name: { type: String, required: true },
        permissions: { type: [String], uppercase: true }
    },
    {
        timestamps: true
    }
);

roleSchema.methods.getPermissions = function () {
    return this.permissions.map(perm => {
        let { entity, permission } = perm.split(':');
        return {
            entity,
            permission
        }
    })
};

let Role = mongoose.model('Role', roleSchema);

module.exports = { Role, roleSchema };