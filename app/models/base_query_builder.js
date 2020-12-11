'use strict'

/**
 * @module BaseQueryBuilder
 */

const { QueryBuilder } = require('objection')

class BaseQueryBuilder extends QueryBuilder {
  async findOrInsert (model) {
    let result = await this.where(model).first()

    if (!result) {
      console.log('FINDORINSERT INSERTING')
      result = await this.insert(model).returning('*')
    }
    console.log(`FINDORINSERT ${result.id}`)
    return result
  }
}

module.exports = BaseQueryBuilder
