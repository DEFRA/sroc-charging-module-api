'use strict'

const config = require('../../config/authentication.config')

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('authorised_systems').del()
    .then(function () {
      // Inserts seed entries
      return knex('authorised_systems').insert([
        {
          id: config.adminClientId,
          name: 'admin',
          admin: true,
          status: 'active'
        }
      ])
    })
}
