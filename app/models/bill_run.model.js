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
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'bill_runs.id',
          to: 'transactions.bill_run_id'
        }
      }
    }
  }

  /**
   * Returns whether the bill run can be 'edited'
   *
   * Once a bill run has been 'sent', which means the transaction file is generated, it cannot be edited. This includes
   * adding or deleting transactions, or deleting the bill run altogether.
   *
   * After being 'sent' the bill run status may change to `billed` or `billing_not_required` but it still remains
   * uneditable.
   *
   * A bill run is also uneditable if it's in the middle of generating its summary. We can't allow changes which will
   * cause the generated result to be invalid.
   */
  $editable () {
    return ['initialised', 'summarised'].includes(this.status)
  }
}

module.exports = BillRunModel
