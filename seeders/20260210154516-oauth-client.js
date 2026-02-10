"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "oauthClients",
      [
        {
          id: Sequelize.literal("(UUID())"),
          name: "Test App",
          clientId: "test-app",
          clientSecret: "secret",
          grants: "password,refresh_token",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("oauthClients", null, {});
  },
};
