/**
 * @module TransactionModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

export default class TransactionModel extends BaseModel {
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
}
