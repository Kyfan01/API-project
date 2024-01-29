'use strict';

/** @type {import('sequelize-cli').Migration} */

const { EventImage } = require('../models');

let options = { tableName: 'EventImages' };
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
    await EventImage.bulkCreate([
      {
        eventId: 1,
        url: 'https://cdn.nba.com/manage/2024/01/2024-all-star-captains.jpg?w=735&h=413',
        preview: true
      },
      {
        eventId: 2,
        url: 'event2 url'
      },
      {
        eventId: 3,
        url: 'https://static.nike.com/a/images/f_auto/dpr_1.0,cs_srgb/w_1824,c_limit/08cc70ef-be31-48a7-b4e8-e23095d2342e/5-benefits-of-playing-basketball-according-to-experts.jpg',
        preview: true
      },
      {
        eventId: 4,
        url: 'event4 url'
      },
      {
        eventId: 5,
        url: 'https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbac2bfe0-2638-4d21-a44f-d51d5acd580f_1980x1320.jpeg',
        preview: true
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
      eventId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
