exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('authorised_systems').del()
    .then(function () {
      // Inserts seed entries
      return knex('authorised_systems').insert([
        {
          id: '77oc8j0o19qc3ohcf82sq41s4a',
          name: 'wrls',
          status: 'active'
        }
      ])
    })
}
