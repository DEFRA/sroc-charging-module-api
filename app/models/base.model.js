/**
 * @module BaseModel
 */

import { Model } from 'objection'

import { db } from '../../db/index.js'

// We only have to do this once in the app and then it will be set globally for Objection. As we are not using multiple
// databases we have no need to pass it into each query we build. And setting it here means all subclasses will inherit
// it. https://vincit.github.io/objection.js/api/model/static-methods.html#static-knex
Model.knex(db)

export default class BaseModel extends Model {
}
