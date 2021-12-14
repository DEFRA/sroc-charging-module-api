'use strict'

/**
 * @module BillRunModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

const StaticLookupLib = require('../lib/static_lookup.lib')

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
   * We also reset it's summary information (`invoiceCount`, `creditNoteCount` etc) and put the status back to
   * `initialised` to reflect the fact a client system will need to regenerate the bill run so we can take into account
   * the changes made by the transaction.
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
      .patch(this._addResetPatch(patch))
      .returning('id')

    return id
  }

  /**
   * Add 'reset' details to a patch that is to be used to update the bill run
   *
   * When a transaction is added to a bill run, if the bill run has alrerady been generated we need to 'reset' it
   * because the transaction might have made changes that would invalidate the current information.
   *
   * This could be on top of existing changes being made, for example to the tally fields. As this is unique to bill
   * runs we have the logic here rather than in the `CreateTransactionTallyService`.
   *
   * @param {Object} [currentPatch] The current patch about to be applied. Default to an empty object for use cases
   * where all you want to do is reset the bill run, for example, when removing the last invoice on a generated bill
   * run
   *
   * @returns {Object} a new patch object based on the provided patch and what is needed to reset the bill run summary
   * information
   */
  static _addResetPatch (currentPatch = {}) {
    return {
      ...currentPatch,
      status: 'initialised',
      invoiceCount: 0,
      invoiceValue: 0,
      creditNoteCount: 0,
      creditNoteValue: 0
    }
  }

  /**
   * Returns whether the bill run can be 'edited'
   *
   * If a bill run has a status of `initialised` or `generated` it can be edited. This means transactions can be added,
   * invoices or licences deleted, or the bill run itself deleted.
   *
   * Once `approved` a bill run cannot be edited. This is different from `$patchable()` for example, which is concerned
   * with processing the bill run. Once `approved` we want to be able to `/send` a bill run but we don't want to allow
   * a transaction to be added.
   *
   * This also protects against trying to make changes when the bill run is being processed. So the interim `pending`
   * state is also not classed as 'editable'.
   */
  $editable () {
    return ['initialised', 'generated'].includes(this.status)
  }

  /**
   * Returns whether the bill run can be 'patched'
   *
   * Our PATCH endpoints are `/generate`, `/approve` and `/send` and a bill run can only respond to one of these
   * requests if it is in a suitable state.
   *
   * Once a bill run has been 'sent', which means the transaction file is generated, it cannot be further 'patched'.
   *
   * A bill run is also unpatchable if its status is `pending` which signifies that it's in the middle of something, for
   * example, generating its summary or sending the transaction file.
   */
  $patchable () {
    return ['initialised', 'generated', 'approved'].includes(this.status)
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
   * Returns true if the bill run status is 'sending'
   */
  $sending () {
    return this.status === 'sending'
  }

  /**
   * Returns true if the bill run has a file reference
   */
  $billable () {
    return Boolean(this.fileReference)
  }

  /**
   * Returns the deminimis limit of the bill run's ruleset
   */
  $deminimisLimit () {
    return StaticLookupLib.deminimisLimits[this.ruleset]
  }

  /**
   * Returns a query which will fetch all deminimis invoices on the bill run
   */
  $deminimisInvoices (trx = null) {
    return this.$relatedQuery('invoices', trx)
      .whereRaw('debit_line_value - credit_line_value > 0')
      .whereRaw('debit_line_value - credit_line_value < ?', this.$deminimisLimit())
      .modify('originalInvoice')
  }
}

module.exports = BillRunModel
