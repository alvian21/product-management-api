'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, alias FROM roles;`
    );

    const roleRows = roles[0];
    const adminRole = roleRows.find(r => r.alias === 'admin');
    const userRole = roleRows.find(r => r.alias === 'user');

    const bcrypt = require('bcrypt');
    const adminPassword = bcrypt.hashSync('admin1234', 10);
    const userPassword = bcrypt.hashSync('user1234', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: require('crypto').randomUUID(),
        fullName: 'Admin',
        email: 'admin@gmail.com',
        password: adminPassword,
        isActive: true,
        roleId: adminRole ? adminRole.id : null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('crypto').randomUUID(),
        fullName: 'User',
        email: 'user@gmail.com',
        password: userPassword,
        isActive: true,
        roleId: userRole ? userRole.id : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
