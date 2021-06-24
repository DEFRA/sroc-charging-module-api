/**
 * @module SequenceCounterModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class SequenceCounterModel extends BaseModel {
  static get tableName () {
    return 'sequenceCounters'
  }

  static get relationMappings () {
    return {
      regime: {
        relation: Model.ManyToManyRelation,
        modelClass: 'regime.model',
        join: {
          from: 'sequenceCounters.regimeId',
          to: 'regime.id'
        }
      }
    }
  }
}

module.exports = SequenceCounterModel
