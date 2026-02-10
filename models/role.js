'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Role.belongsToMany(models.Permission, {
                through: models.RolePermission,
                foreignKey: 'roleId',
                otherKey: 'permissionId'
            });
            Role.hasMany(models.User, { foreignKey: 'roleId' });
        }
    }
    Role.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        alias: DataTypes.STRING,
        name: DataTypes.STRING,
        isActive: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Role',
        tableName: 'roles'
    });
    return Role;
};