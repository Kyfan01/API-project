'use strict';

/** @type {import('sequelize-cli').Migration} */

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = { tableName: 'Users' };
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

    await User.bulkCreate([
      {
        email: 'yrag@user.io',
        username: 'yrag',
        hashedPassword: bcrypt.hashSync('pokemon'),
        firstName: 'Gary',
        lastName: 'Cheung'
      },
      {
        email: 'ledennis@user.io',
        username: 'LeDennis James',
        hashedPassword: bcrypt.hashSync('basketball'),
        firstName: 'Dennis',
        lastName: 'Ma'
      },
      {
        email: 'theshyII@user.io',
        username: 'The Shy II',
        hashedPassword: bcrypt.hashSync('league'),
        firstName: 'Tyler',
        lastName: 'Han'
      },
      {
        email: 'hungrycat@user.io',
        username: 'hungrycat',
        hashedPassword: bcrypt.hashSync('ilovecats'),
        firstName: 'Cathy',
        lastName: 'Wang'
      },
      {
        email: 'geekfreak@user.io',
        username: 'Kevin Fantetokounmpo',
        hashedPassword: bcrypt.hashSync('basketball'),
        firstName: 'Kevin',
        lastName: 'Fan'
      },
      {
        email: 'geekfreak2@user.io',
        username: 'Kevin2 Fantetokounmpo',
        hashedPassword: bcrypt.hashSync('basketball'),
        firstName: 'Kevin',
        lastName: 'Fan'
      },
      {
        email: 'geek3freak@user.io',
        username: 'Kevin3 Fantetokounmpo',
        hashedPassword: bcrypt.hashSync('basketball'),
        firstName: 'Kevin',
        lastName: 'Fan'
      },
      {
        email: 'geek4freak@user.io',
        username: 'Kevin5 Fantetokounmpo',
        hashedPassword: bcrypt.hashSync('basketball'),
        firstName: 'Kevin',
        lastName: 'Fan'
      }
    ], { validate: true });

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
      username: { [Op.in]: ['yrag', 'LeDennis James', 'The Shy II', 'hungrycat', 'Kevin Fantetokounmpo'] }
    }, {});
  }
};
