exports.seed = async function (knex) {
  await knex('regimes').del()

  await knex('regimes').insert([
    { slug: 'wml', name: 'Waste', pre_sroc_cutoff_date: '2018-04-01' },
    { slug: 'pas', name: 'Installations', pre_sroc_cutoff_date: '2018-04-01' },
    { slug: 'cfd', name: 'Water Quality', pre_sroc_cutoff_date: '2018-04-01' },
    { slug: 'wrls', name: 'Water Resources', pre_sroc_cutoff_date: '2020-04-01' }
  ])
}
