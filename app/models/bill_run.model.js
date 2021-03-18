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
      licences: {
        relation: Model.HasManyRelation,
        modelClass: 'licence.model',
        join: {
          from: 'billRuns.id',
          to: 'licences.billRunId'
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
   * Modifiers allow us to reuse logic in queries, eg. to select all bill runs which are empty:
   *
   * return billRun.$query()
   *   .modify('empty')
   */
  static get modifiers () {
    return {
      /**
       * empty modifier selects all bill runs which are empty.
       */
      empty (query) {
        query
          .where('creditLineCount', 0)
          .where('debitLineCount', 0)
          .where('zeroLineCount', 0)
      }
    }
  }

  static async patchTally (transaction, trx) {
    const { CreateTransactionTallyService } = require('../services')

    const { patch } = CreateTransactionTallyService.go(transaction, this.tableName)

    const { id } = await BillRunModel.query(trx)
      .findById(transaction.billRunId)
      .patch(patch)
      .returning('id')

    return id
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
    return ['initialised', 'generated', 'approved'].includes(this.status)
  }

  /**
   * Returns true if the bill run summary is being generated
   */
  $generating () {
    return this.status === 'generating'
  }

  /**
   * Returns true if the bill run status is being 'generated'
   */
  $generated () {
    return this.status === 'generated'
  }

  /**
   * Returns true if the bill run status is 'approved'
   */
  $approved () {
    return this.status === 'approved'
  }

  /**
   * Returns true if no transactions have been added to this bill run
   */
  $empty () {
    return (this.creditLineCount === 0 && this.debitLineCount === 0 && this.zeroLineCount === 0)
  }

  $billed () {
    return this.status === 'billed'
  }
}

module.exports = BillRunModel
