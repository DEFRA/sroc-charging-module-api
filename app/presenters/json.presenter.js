'use strict'

const BasePresenter = require('./base.presenter')

/**
 * Takes the data object and returns a version ready to be used for a JSON response.
 *
 * This presenter was created so we could stick to our pattern of
 *
 * `request` -> `translator` -> `model` -> `presenter` -> `response`
 *
 * @module JsonPresenter
 */
class JsonPresenter extends BasePresenter {
  _presentation (data) {
    return data
  }
}

module.exports = JsonPresenter
