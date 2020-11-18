'use strict'

const BaseModel = require('./base.model')

class RegimeModel extends BaseModel {
  static get tableName () {
    return 'regimes'
  }

  static get relationMappings () {
    return {
      authorisedSystems: {
        relation: Model.ManyToManyRelation,
        modelClass: 'authorised_system.model',
        join: {
          from: 'regimes.id',
          through: {
            // authorised_systems_regimes is a join table
            from: 'authorised_systems_regimes.regime_id',
            to: 'authorised_systems_regimes.authorised_system_id'
          },
          to: 'authorised_systems.id'
        }
      }
    }
  }
}

module.exports = RegimeModel
