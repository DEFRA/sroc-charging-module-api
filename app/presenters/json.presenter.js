'use strict'

/**
 * @module JsonPresenter
 */

const BasePresenter = require('./base.presenter.js')

/**
 * Takes the data object and returns a version ready to be used for a JSON response.
 *
 * This presenter was created so we could stick to our pattern of
 *
 * - `request` -> `translator` -> `model` -> `presenter` -> `response`
 *
 * At this time it does nothing to the data passed in and just returns it again.
 */
class JsonPresenter extends BasePresenter {
  _presentation (data) {
    return data
  }
}

module.exports = JsonPresenter
