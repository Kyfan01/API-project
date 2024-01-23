'use strict';

/** @type {import('sequelize-cli').Migration} */

const { GroupImage } = require('../models');

let options = { tableName: 'GroupImages' };
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
    await GroupImage.bulkCreate([
      {
        groupId: 1,
        url: 'https://images.squarespace-cdn.com/content/v1/62d09f54a49d6f1c78455cce/67b9ee0c-7ccf-4cfd-8581-c50d5f62384a/T1_Logo_Primary+Red.png',
        preview: true
      },
      {
        groupId: 2,
        url: 'https://warriorswire.usatoday.com/wp-content/uploads/sites/33/2022/10/USATSI_19233965-e1666030305542.jpg?w=1000&h=600&crop=1',
        preview: true
      },
      {
        groupId: 3,
        url: 'https://fadeawayworld.net/.image/c_limit%2Ccs_srgb%2Cq_auto:good%2Cw_860/MjAwNTg1NTg0NzgyMDkxMzcy/373257109_323966190050362_7615734263634948009_n.webp',
        preview: true
      },
      {
        groupId: 4,
        url: 'https://pbs.twimg.com/media/F0YGa90XgAEKsS1?format=jpg&name=900x900',
        preview: true
      },
      {
        groupId: 5,
        url: 'default'
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
