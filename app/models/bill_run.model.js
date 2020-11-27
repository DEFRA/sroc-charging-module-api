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
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'authorised_system.model',
        join: {
          from: 'bill_runs.created_by',
          to: 'authorised_systems.id'
        }
      }
    }
  }
}

module.exports = BillRunModel
