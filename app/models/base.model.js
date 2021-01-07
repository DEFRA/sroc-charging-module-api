'use strict'

/**
 * @module BaseModel
 */

const { db } = require('../../db')
const { Model, snakeCaseMappers } = require('objection')
const BaseQueryBuilder = require('./base_query_builder')

// We only have to do this once in the app and then it will be set globally for Objection. As we are not using multiple
// databases we have no need to pass it into each query we build. And setting it here means all subclasses will inherit
// it. https://vincit.github.io/objection.js/api/model/static-methods.html#static-knex
Model.knex(db)

class BaseModel extends Model {
  /**
   * An objective property we override to enable snakeCaseMappers
   *
   * Objective supports using snake_case names in the database and camelCase in the code. By overriding the
   * `columnNameMappers()` static property we can tell Objective to use its snakeCaseMappers function.
   *
   * This means when we access a property on the model we can use camelCase even if the underlying database property
   * was snake_case. It also means we get camelCase object keys, handy when you need to return a db query result as is
   * in a response.
   *
   * Remember though that within the context of Objective queries, for example `MyModel.query().where()` we still need
   * to use the actual database names.
   *
   * @see {@link https://vincit.github.io/objection.js/recipes/snake-case-to-camel-case-conversion.html}
   */
  static get columnNameMappers () {
    return snakeCaseMappers()
  }

  /**
   * An objective property we override to tell it where to search for models for relationships
   *
   * When setting a relationship in a model we have to provide a reference to the related model. As we need to set the
   * relationship on both sides this leads to
   * {@link https://vincit.github.io/objection.js/guide/relations.html#require-loops|require-loops}. We can avoid this
   * by having the model tell Objection where to search for models for relationships. In the relationship declaration we
   * can then just use a string value
   *
   * ```
   *  // ...
   *  relation: Model.ManyToManyRelation,
        modelClass: 'authorised_system.model',
      // ...
      ```

      We don't want to do this in every model so set it in the `BaseModel` as Objection recommends.
   */
  static get modelPaths () {
    return [__dirname]
  }

  static get QueryBuilder () {
    return BaseQueryBuilder
  }
}

module.exports = BaseModel
