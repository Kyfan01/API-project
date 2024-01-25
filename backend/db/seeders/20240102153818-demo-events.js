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
        name: 'Boston Pick-up and lots and lots and lots and lots and lots and lots and lots and lots and lots and lots of characters 2nd earliest',
        description: 'This is a basketball game lots and lots and lots and lots and lots and lots and lots and lots and lots and lots and lots and lots and lots and lots of characters for testing',
        type: 'In Person',
        price: 5,
        startDate: '1/2/2025',
        endDate: '1/3/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up 3rd upcoming',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/3/2025',
        endDate: '1/4/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up 4th upcoming',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/4/2025',
        endDate: '1/5/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up earliest',
        description: 'This is a basketball game but date is earlier for sorting',
        type: 'In Person',
        price: 5,
        startDate: '1/1/2025',
        endDate: '1/1/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up 5th upcoming',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/5/2025',
        endDate: '1/6/2025'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up oldest in the past',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/2/2023',
        endDate: '1/3/2023'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up 2nd oldest in the past',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/3/2023',
        endDate: '1/4/2023'
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'Boston Pick-up 3rd oldest in the past',
        description: 'This is a basketball game',
        type: 'In Person',
        price: 5,
        startDate: '1/4/2023',
        endDate: '1/5/2023'
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
      groupId: {
        [Op.in]: [1, 2, 3, 4, 5]
      }
    }, {});
  }
};
