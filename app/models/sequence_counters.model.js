'use strict'

/**
 * @module SequenceCountersModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class SequenceCountersModel extends BaseModel {
  static get tableName () {
    return 'sequence_counters'
  }

  static get relationMappings () {
    return {
      regime: {
        relation: Model.ManyToManyRelation,
        modelClass: 'regime.model',
        join: {
          from: 'sequence_counters.regime_id',
          to: 'regime.id'
        }
      }
    }
  }
}

module.exports = SequenceCountersModel
