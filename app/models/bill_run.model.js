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

  /**
   * Update the 'tally' fields of the bill run, for example, `debitLineCount` based on the transaction provided
   *
   * As we add transactions to a bill run we 'tally' details about them, for example, how many were debits, what the
   * total credit value is etc. This information is then used when a bill run is 'generated' to simplify and speed up
   * the process.
   *
   * Use this method to update a bill run (determined by the bill run ID in the `transaction` param) based on the
   * transaction.
   *
   * > Note - a similar process is done for invoices and licences though they have the additional task of determining
   * if a new invoice or licence record needs to be created first
   *
   * @param {module:TransactionTranslator} transaction translator representing the transaction that will seed the patch
   * query
   * @param {Object} [trx] Optional Objection database `transaction` object to be used in the patch query
   *
   * @returns {string} ID of the bill run that was updated
   */
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

  /**
   * Returns true if the bill run status is 'billed'
   */
  $billed () {
    return this.status === 'billed'
  }

  /**
   * Returns true if the bill run status is 'pending'
   */
  $pending () {
    return this.status === 'pending'
  }

  /**
   * Returns true if the bill run has a file reference
   */
  $billable () {
    return Boolean(this.fileReference)
  }

  /**
   * Returns the file number (ie. the last 5 chars of the file reference), or `null` if the bill run does not have one
   */
  $fileNumber () {
    return this.fileReference ? this.fileReference.slice(-5) : null
  }
}

module.exports = BillRunModel
