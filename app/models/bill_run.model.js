'use strict'

/**
 * @module BillRunModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class BillRunModel extends BaseModel {
  static get tableName () {
    return 'bill_runs'
  }

  static get relationMappings () {
    return {
      authorisedSystem: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'authorised_system.model',
        join: {
          from: 'bill_runs.created_by',
          to: 'authorised_systems.id'
        }
      },
      regime: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'regime.model',
        join: {
          from: 'bill_runs.regime_id',
          to: 'regimes.id'
        }
      }
    }
  }
}

module.exports = BillRunModel
