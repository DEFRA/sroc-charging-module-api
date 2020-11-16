'use strict'

exports.seed = async function (knex) {
  // Clear the authorised systems and regimes join table
  await knex('authorised_systems_regimes').del()

  // Creates a test system user
  await knex('authorised_systems').where('name', 'system').delete()

  let results = await knex('authorised_systems')
    .insert({ client_id: 'k7ehotrs1fqer7hoaslv7ilmr', name: 'system', admin: false, status: 'active' })
    .returning('*')
  const systemUser = results[0]

  results = await knex.select('id').from('regimes')

  for (let i = 0; i < results.length; i++) {
    await knex('authorised_systems_regimes').insert({
      authorised_system_id: systemUser.id,
      regime_id: results[i].id
    })
  }

  // Creates a replica WRLS user
  await knex('authorised_systems').where('name', 'wrls').delete()

  results = await knex('authorised_systems')
    .insert({ client_id: 'k7ehotrs1fqer7hoaslv7ilmr', name: 'wrls', admin: false, status: 'active' })
    .returning('*')
  const wrlsUser = results[0]

  results = await knex('regimes').where('slug', 'wrls')
  const wrlsRegime = results[0]

  await knex('authorised_systems_regimes').insert({
    authorised_system_id: wrlsUser.id,
    regime_id: wrlsRegime.id
  })
}
