'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Venue } = require('../models');

let options = { tableName: 'Venues' };
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
    await Venue.bulkCreate([
      {
        groupId: 1,
        address: '1 League Lane',
        city: 'Brunswick',
        state: 'New Jersey',
        lat: 1,
        lng: 1
      },
      {
        groupId: 2,
        address: '2 Littleroot Lane',
        city: 'Niantic',
        state: 'California',
        lat: 2,
        lng: 2
      },
      {
        groupId: 3,
        address: '3 Hollywood Road',
        city: 'Los Angeles',
        state: 'California',
        lat: 3,
        lng: 3
      },
      {
        groupId: 4,
        address: '4 Food Avenue',
        city: 'Cambridge',
        state: 'Massachusetts',
        lat: 4,
        lng: 4
      },
      {
        groupId: 5,
        address: '5 Basketball Boulevard',
        city: 'Boston',
        state: 'Massachusetts',
        lat: 5,
        lng: 5
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
      groupId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
