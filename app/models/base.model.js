'use strict'

/**
 * @module BaseModel
 */

const { Model } = require('objection')

const { db } = require('../../db/db')

// We only have to do this once in the app and then it will be set globally for Objection. As we are not using multiple
// databases we have no need to pass it into each query we build. And setting it here means all subclasses will inherit
// it. https://vincit.github.io/objection.js/api/model/static-methods.html#static-knex
Model.knex(db)

class BaseModel extends Model {
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
}

module.exports = BaseModel
