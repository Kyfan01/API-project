'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('User', 'firstName', {
      type: Sequelize.STRING,
    })

    await queryInterface.addColumn('User', 'lastName', {
      type: Sequelize.STRING,
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('User', 'firstName')
    await queryInterface.removeColumn('User', 'lastName')
  }
};
