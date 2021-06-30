/**
 * @module TransactionModel
 */

import AuthorisedSystemModel from './authorised_system.model.js'
import BaseModel from './base.model.js'
import BillRunModel from './bill_run.model.js'
import InvoiceModel from './invoice.model.js'
import LicenceModel from './licence.model.js'
import RegimeModel from './regime.model.js'

export default class TransactionModel extends BaseModel {
  static get tableName () {
    return 'transactions'
  }

  static get relationMappings () {
    return {
      authorisedSystem: {
        relation: this.BelongsToOneRelation,
        modelClass: AuthorisedSystemModel,
        join: {
          from: 'transactions.createdBy',
          to: 'authorisedSystems.id'
        }
      },
      billRun: {
        relation: this.BelongsToOneRelation,
        modelClass: BillRunModel,
        join: {
          from: 'transactions.billRunId',
          to: 'billRuns.id'
        }
      },
      invoice: {
        relation: this.BelongsToOneRelation,
        modelClass: InvoiceModel,
        join: {
          from: 'transactions.invoiceId',
          to: 'invoices.id'
        }
      },
      licence: {
        relation: this.BelongsToOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'transactions.licenceId',
          to: 'licences.id'
        }
      },
      regime: {
        relation: this.BelongsToOneRelation,
        modelClass: RegimeModel,
        join: {
          from: 'transactions.regimeId',
          to: 'regimes.id'
        }
      }
    }
  }
}
