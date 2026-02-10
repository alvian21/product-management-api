'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, alias FROM roles;`
    );
    const permissions = await queryInterface.sequelize.query(
      `SELECT id, alias FROM permissions;`
    );

    const roleRows = roles[0];
    const permissionRows = permissions[0];

    const adminRole = roleRows.find(r => r.alias === 'admin');
    const userRole = roleRows.find(r => r.alias === 'user');

    const rolePermissions = [];

    if (adminRole) {
      permissionRows.forEach(p => {
        rolePermissions.push({
          id: require('crypto').randomUUID(),
          roleId: adminRole.id,
          permissionId: p.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }

    if (userRole) {
      permissionRows.filter(p => p.alias.startsWith('product.')).forEach(p => {
        rolePermissions.push({
          id: require('crypto').randomUUID(),
          roleId: userRole.id,
          permissionId: p.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }

    if (rolePermissions.length > 0) {
      await queryInterface.bulkInsert('rolePermissions', rolePermissions, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rolePermissions', null, {});
  }
};
