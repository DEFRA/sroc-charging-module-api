/**
 * @module BaseModel
 */

import { Model } from 'objection'

import { db } from '../../db/index.js'

// We only have to do this once in the app and then it will be set globally for Objection. As we are not using multiple
// databases we have no need to pass it into each query we build. And setting it here means all subclasses will inherit
// it. https://vincit.github.io/objection.js/api/model/static-methods.html#static-knex
Model.knex(db)

/**
 * Base class for all our {@link https://vincit.github.io/objection.js/|Objection} based models
 *
 * > Most of the time you want the same configuration for all models and a good pattern is to create a `BaseModel` class
 * > and inherit all your models from that. You can then add all shared configuration to `BaseModel`.
 * > {@link https://vincit.github.io/objection.js/api/model/#models}
 *
 * Having the `BaseModel` class gives us a place to import both Objection and our `db` config in one place and make the
 * one time call to `Model.knex()` even if the `BaseModel` itself does not currently do anything. Having all our models
 * extend from this base class does mean should the need arise we are all set up to implement that shared config.
 */
export default class BaseModel extends Model {
}
