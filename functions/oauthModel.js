"use strict";

const bcrypt = require("bcrypt");
const models = require("../models");
const User = models.User;
const OAuthClient = models.OAuthClient;
const OAuthToken = models.OAuthToken;

module.exports = {
  getClient: async (clientId, clientSecret) => {
    const where = { clientId };
    if (clientSecret) {
      where.clientSecret = clientSecret;
    }
    const client = await OAuthClient.findOne({ where });
    if (!client) return null;

    return {
      id: client.id,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      grants: client.grants.split(","),
      redirectUris: client.redirectUris ? client.redirectUris.split(",") : [],
    };
  },

  saveToken: async (token, client, user) => {
    const savedToken = await OAuthToken.create({
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      clientId: client.id,
      userId: user.id,
    });

    return {
      accessToken: savedToken.accessToken,
      accessTokenExpiresAt: savedToken.accessTokenExpiresAt,
      refreshToken: savedToken.refreshToken,
      refreshTokenExpiresAt: savedToken.refreshTokenExpiresAt,
      client: client,
      user: user,
    };
  },

  getAccessToken: async (accessToken) => {
    const token = await OAuthToken.findOne({
      where: { accessToken },
      include: [
        { model: OAuthClient, as: "OAuthClient" },
        { model: User, as: "User" },
      ],
    });

    if (!token) return null;

    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      client: token.OAuthClient ? token.OAuthClient.get({ plain: true }) : null,
      user: token.User ? token.User.get({ plain: true }) : null,
    };
  },

  getUser: async (email, password) => {
    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) return null;

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return null;

    return user;
  },

  getRefreshToken: async (refreshToken) => {
    const token = await OAuthToken.findOne({
      where: { refreshToken },
      include: [OAuthClient, User],
    });

    if (!token) return null;

    return {
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      client: token.OAuthClient ? token.OAuthClient.get({ plain: true }) : null,
      user: token.User ? token.User.get({ plain: true }) : null,
    };
  },

  revokeToken: async (token) => {
    const result = await OAuthToken.destroy({
      where: { refreshToken: token.refreshToken },
    });
    return result > 0;
  },
};
