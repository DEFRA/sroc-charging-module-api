'use strict'

const { Model } = require('objection')

class AuthorisedSystemModel extends Model {
  static get tableName () {
    return 'authorised_systems'
  }
}

module.exports = AuthorisedSystemModel
