'use strict'

/**
 * @module BillRunModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class BillRunModel extends BaseModel {
  static get tableName () {
    return 'billRuns'
  }

  static get relationMappings () {
    return {
      authorisedSystem: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'authorised_system.model',
        join: {
          from: 'billRuns.createdBy',
          to: 'authorisedSystems.id'
        }
      },
      invoices: {
        relation: Model.HasManyRelation,
        modelClass: 'invoice.model',
        join: {
          from: 'billRuns.id',
          to: 'invoices.billRunId'
        }
      },
      regime: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'regime.model',
        join: {
          from: 'billRuns.regimeId',
          to: 'regimes.id'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'billRuns.id',
          to: 'transactions.billRunId'
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

  /**
   * Returns true if the bill run summary is being generated
   */
  $generatingSummary () {
    return this.status === 'generating_summary'
  }
}

module.exports = BillRunModel
