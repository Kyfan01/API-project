'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Event } = require('../models');

let options = { tableName: 'Events' };
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
    await Event.bulkCreate([
      {
        venueId: 1,
        groupId: 1,
        name: 'League Game',
        description: 'This is a league game',
        type: 'In Person',
        price: 1,
        startDate: '1/1/2025',
        endDate: '1/2/2025'
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'PokemonGo Battle',
        description: 'This is a pokemonGo battle',
        type: 'In Person',
        price: 2,
        startDate: '1/1/2025',
        endDate: '1/2/2025'
      },
      {
        venueId: 3,
        groupId: 3,
        name: 'Museum Visit',
        description: 'We visit museums together',
        type: 'In Person',
        price: 3,
        startDate: '1/1/2025',
        endDate: '1/2/2025'
      },
      {
        venueId: 4,
        groupId: 4,
        name: 'Dining',
        description: 'This is a social dining club',
        type: 'In Person',
        price: 4,
        startDate: '1/1/2025',
        endDate: '1/2/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/1/2025',
        endDate: '1/2/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up2',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/1/2025',
        endDate: '1/2/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up3',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/1/2025',
        endDate: '1/2/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up4',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/1/2025',
        endDate: '1/2/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up5',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/1/2025',
        endDate: '1/2/2025'
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
      venueId: {
        [Op.in]: [1, 2, 3, 4, 5]
      }
    }, {});
  }
};
