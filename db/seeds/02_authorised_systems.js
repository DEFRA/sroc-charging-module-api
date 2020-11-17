'use strict'

const config = require('../../config/authentication.config')

exports.seed = async function (knex) {
  await knex('authorised_systems').del()

  await knex('authorised_systems').insert(
    {
      client_id: config.adminClientId,
      name: 'admin',
      admin: true,
      status: 'active'
    }
  )
}
