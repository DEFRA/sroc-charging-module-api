'use strict'

const config = require('../../config/authentication.config')

exports.seed = async function (knex) {
  await knex('authorised_systems').del()
  await knex('authorised_systems_regimes').del()

  const result = await knex('authorised_systems')
    .returning('id')
    .insert({
      client_id: config.adminClientId,
      name: 'admin',
      admin: true,
      status: 'active'
    })

  const adminUserId = result[0]

  // Get all regimes for their ID's
  const regimes = await knex.select().from('regimes')

  // Authorise the admin user for all regimes
  for (const regime of regimes) {
    await knex('authorised_systems_regimes').insert({
      authorised_system_id: adminUserId,
      regime_id: regime.id
    })
  }
}
