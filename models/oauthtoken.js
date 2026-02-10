'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OAuthToken extends Model {
        static associate(models) {
            OAuthToken.belongsTo(models.OAuthClient, { foreignKey: 'clientId' });
            OAuthToken.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }
    OAuthToken.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        accessToken: DataTypes.TEXT,
        accessTokenExpiresAt: DataTypes.DATE,
        refreshToken: DataTypes.TEXT,
        refreshTokenExpiresAt: DataTypes.DATE,
        clientId: DataTypes.UUID,
        userId: DataTypes.UUID
    }, {
        sequelize,
        modelName: 'OAuthToken',
        tableName: 'oauthTokens'
    });
    return OAuthToken;
};
