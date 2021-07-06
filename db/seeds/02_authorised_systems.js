import AuthenticationConfig from '../../config/authentication.config.js'

export async function seed (knex) {
  await knex('authorised_systems').del()
  await knex('authorised_systems_regimes').del()

  // Utilized by PostgreSQL, the returning method specifies which column should be returned by the insert method.
  // It always returns an array which is way we return it to `result` before then setting `adminUserId` to `result[0]`.
  // http://knexjs.org/#Builder-returning
  let result = await knex('authorised_systems')
    .returning('id')
    .insert({
      client_id: AuthenticationConfig.adminClientId,
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
  if (AuthenticationConfig.systemClientId) {
    otherClients.push({ clientId: AuthenticationConfig.systemClientId, name: 'system' })
  }
  if (AuthenticationConfig.testClientId) {
    otherClients.push({ clientId: AuthenticationConfig.testClientId, name: 'test' })
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
