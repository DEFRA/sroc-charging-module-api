'use strict'

/**
 * @module TransactionModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class TransactionModel extends BaseModel {
  static get tableName () {
    return 'transactions'
  }

  static get relationMappings () {
    return {
      authorisedSystem: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'authorised_system.model',
        join: {
          from: 'transactions.createdBy',
          to: 'authorisedSystems.id'
        }
      },
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill_run.model',
        join: {
          from: 'transactions.billRunId',
          to: 'billRuns.id'
        }
      },
      regime: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'regime.model',
        join: {
          from: 'transactions.regimeId',
          to: 'regimes.id'
        }
      },
      invoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'invoice.model',
        join: {
          from: 'transactions.invoiceId',
          to: 'invoices.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'transactions.licenceId',
          to: 'licences.id'
        }
      }
    }
  }

  /**
   * Modifiers allow us to reuse logic in queries, eg. to select all transactions which are not zero value:
   *
   * return TransactionModel.$query()
   *   .modify('hasChargeValue')
   */
  static get modifiers () {
    return {
      /**
       * hasChargeValue modifier selects transactions which have a charge value (ie. excludes zero-value transactions)
       */
      hasChargeValue (query) {
        query
          .whereNot('chargeValue', 0)
      }
    }
  }
}

module.exports = TransactionModel
