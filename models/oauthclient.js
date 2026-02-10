'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OAuthClient extends Model {
        static associate(models) {
            OAuthClient.hasMany(models.OAuthToken, { foreignKey: 'clientId' });
        }
    }
    OAuthClient.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        name: DataTypes.STRING,
        clientId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        clientSecret: DataTypes.STRING,
        redirectUris: DataTypes.STRING,
        grants: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'OAuthClient',
        tableName: 'oauthClients'
    });
    return OAuthClient;
};
