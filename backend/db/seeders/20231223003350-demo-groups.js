'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Group } = require('../models');

let options = { tableName: 'Groups' };
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commOnline.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    await Group.bulkCreate([
      {
        organizerId: 4,
        name: 'Leaguers',
        about: 'This is a league team',
        type: 'Online',
        private: true,
        city: 'Brunswick',
        state: 'New Jersey'
      },
      {
        organizerId: 5,
        name: 'PokemonGo',
        about: 'This is a pokemonGo social group',
        type: 'Online',
        private: false,
        city: 'Niantic',
        state: 'California'
      },
      {
        organizerId: 6,
        name: 'Museum Visitors',
        about: 'We visit museums together',
        type: 'Online',
        private: true,
        city: 'Los Angeles',
        state: 'California'
      },
      {
        organizerId: 7,
        name: 'Dining Club',
        about: 'This is a social dining club',
        type: 'Online',
        private: true,
        city: 'Cambridge',
        state: 'Massachusetts'
      },
      {
        organizerId: 8,
        name: 'Boston Ballers',
        about: 'This is a basketball team',
        type: 'Online',
        private: true,
        city: 'Boston',
        state: 'Massachusetts'
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert Online.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      organizerId: { [Op.in]: [4, 5, 6, 7, 8] }
    }, {});
  }
};
