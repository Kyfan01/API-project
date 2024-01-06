'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Attendance } = require('../models');

let options = { tableName: 'Attendances' };
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commattending.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await Attendance.bulkCreate([
      {
        eventId: 1,
        userId: 4,
        status: 'attending'
      },
      {
        eventId: 2,
        userId: 5,
        status: 'attending'
      },
      {
        eventId: 3,
        userId: 6,
        status: 'attending'
      },
      {
        eventId: 4,
        userId: 7,
        status: 'attending'
      },
      {
        eventId: 5,
        userId: 8,
        status: 'host'
      },
      {
        eventId: 3,
        userId: 8,
        status: 'pending'
      },
      {
        eventId: 4,
        userId: 8,
        status: 'attending'
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert attending.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      eventId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
