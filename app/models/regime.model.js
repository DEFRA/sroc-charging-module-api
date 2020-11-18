'use strict'

const BaseModel = require('./base.model')

class RegimeModel extends BaseModel {
  static get tableName () {
    return 'regimes'
  }
}

module.exports = RegimeModel
