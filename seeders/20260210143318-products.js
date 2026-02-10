'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@gmail.com';`
    );

    const userRows = users[0];
    const adminId = userRows.length > 0 ? userRows[0].id : null;

    if (!adminId) {
      console.log('Warning: admin@gmail.com not found, product seeder might fail FK constraint or use null.');
    }

    await queryInterface.bulkInsert('products', [
      {
        id: require('crypto').randomUUID(),
        sku: 'LAPTOP-001',
        name: 'Lenovo Legion 14',
        description: 'RTX 4050',
        price: 32000000,
        stock: 10,
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('crypto').randomUUID(),
        sku: 'MOUSE-001',
        name: 'Logitech Master 3S',
        description: 'Mouse Wireless',
        price: 1500000,
        stock: 50,
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
