'use strict'

const BaseModel = require('./base.model')

class AuthorisedSystemModel extends BaseModel {
  static get tableName () {
    return 'authorised_systems'
  }
}

module.exports = AuthorisedSystemModel
