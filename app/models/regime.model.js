'use strict'

const { Model } = require('objection')

class RegimeModel extends Model {
  static get tableName () {
    return 'regimes'
  }
}

module.exports = RegimeModel
