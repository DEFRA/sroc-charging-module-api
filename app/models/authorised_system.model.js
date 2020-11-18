'use strict'

const { Model } = require('objection')
const BaseModel = require('./base.model')

class AuthorisedSystemModel extends BaseModel {
  static get tableName () {
    return 'authorised_systems'
  }

  static get relationMappings () {
    return {
      regimes: {
        relation: Model.ManyToManyRelation,
        modelClass: 'regime.model',
        join: {
          from: 'authorised_systems.id',
          through: {
            // authorised_systems_regimes is a join table
            from: 'authorised_systems_regimes.authorised_system_id',
            to: 'authorised_systems_regimes.regime_id'
          },
          to: 'regimes.id'
        }
      }
    }
  }
}

module.exports = AuthorisedSystemModel
