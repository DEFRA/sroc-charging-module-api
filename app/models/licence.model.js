'use strict'

/**
 * @module LicenceModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class LicenceModel extends BaseModel {
  static get tableName () {
    return 'licences'
  }

  static get relationMappings () {
    return {
      invoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'invoice.model',
        join: {
          from: 'licences.invoice_id',
          to: 'invoices.id'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'licences.id',
          to: 'transactions.licence_id'
        }
      }
    }
  }
}

module.exports = LicenceModel
