const { db } = require('../../db')
const { Model } = require('objection')

Model.knex(db)

class RegimeModel extends Model {
  static get tableName () {
    return 'regimes'
  }
}

module.exports = RegimeModel
