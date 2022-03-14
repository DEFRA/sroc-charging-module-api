'use strict'

const config = require('../../config/authentication.config.js')

exports.seed = async function (knex) {
  await knex('authorised_systems').del()
  await knex('authorised_systems_regimes').del()

  // Utilized by PostgreSQL, the returning method specifies which column should be returned by the insert method.
  // It always returns an array which is way we return it to `result` before then setting `adminUserId` to `result[0]`.
  // http://knexjs.org/#Builder-returning
  let result = await knex('authorised_systems')
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
  const otherClients = []
  if (config.systemClientId) {
    otherClients.push({ clientId: config.systemClientId, name: 'system' })
  }
  if (config.testClientId) {
    otherClients.push({ clientId: config.testClientId, name: 'test' })
  }

  for (const client of otherClients) {
    result = await knex('authorised_systems')
      .returning('id')
      .insert({
        client_id: client.clientId,
        name: client.name,
        admin: false,
        status: 'active'
      })
    const userId = result[0]
    const wrlsRegime = regimes.filter(regime => regime.slug === 'wrls')[0]
    await knex('authorised_systems_regimes').insert({
      authorised_system_id: userId,
      regime_id: wrlsRegime.id
    })
  }
}
