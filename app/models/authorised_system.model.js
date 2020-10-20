const { db } = require('../../db')
const { Model } = require('objection')

Model.knex(db)

class AuthorisedSystemModel extends Model {
  static get tableName () {
    return 'authorised_systems'
  }
}

module.exports = AuthorisedSystemModel
