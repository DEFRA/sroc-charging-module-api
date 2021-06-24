const tableName = 'sequence_counters'
const regions = ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']

exports.seed = async function (knex) {
  // Clear existing table
  await knex(tableName).del()

  // Get all regime ids
  const regimes = await knex.select().from('regimes')

  // Create an entry for every region in every regime
  for (const regime of regimes) {
    for (const region of regions) {
      await knex(tableName).insert([{ regime_id: regime.id, region }])
    }
  }
}
