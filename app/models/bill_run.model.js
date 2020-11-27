'use strict'

/**
 * @module BillRunModel
 */

const BaseModel = require('./base.model')

class BillRunModel extends BaseModel {
  static get tableName () {
    return 'regimes'
  }
}

module.exports = BillRunModel
