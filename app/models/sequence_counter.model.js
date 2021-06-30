/**
 * @module SequenceCounterModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import RegimeModel from './regime.model.js'

export default class SequenceCounterModel extends BaseModel {
  static get tableName () {
    return 'sequenceCounters'
  }

  static get relationMappings () {
    return {
      regime: {
        relation: Model.ManyToManyRelation,
        modelClass: RegimeModel,
        join: {
          from: 'sequenceCounters.regimeId',
          to: 'regime.id'
        }
      }
    }
  }
}
