'use strict'

/**
 * @module BaseQueryBuilder
 */

const { QueryBuilder } = require('objection')

class BaseQueryBuilder extends QueryBuilder {
  async findOrInsert (model) {
    let result = await this.where(model).first()

    if (!result) {
      result = await this.insert(model).returning('*')
    }

    return result
  }
}

module.exports = BaseQueryBuilder
