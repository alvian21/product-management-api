'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        id: require('crypto').randomUUID(),
        alias: 'admin',
        name: 'Administrator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('crypto').randomUUID(),
        alias: 'user',
        name: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
