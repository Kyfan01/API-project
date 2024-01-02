'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Membership } = require('../models');

let options = { tableName: 'Memberships' };
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await Membership.bulkCreate([
      {
        userId: 4,
        groupId: 1,
        status: 'enum here'
      },
      {
        userId: 5,
        groupId: 2,
        status: 'enum here'
      },
      {
        userId: 6,
        groupId: 3,
        status: 'enum here'
      },
      {
        userId: 7,
        groupId: 4,
        status: 'enum here'
      },
      {
        userId: 8,
        groupId: 5,
        status: 'enum here'
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: { [Op.in]: [4, 5, 6, 7, 8] }
    }, {});
  }
};
