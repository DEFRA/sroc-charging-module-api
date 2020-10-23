'use strict'

/**
 * This plugin applies Google's Caja HTML Sanitizer on route query, payload, and params. It was added specifically to
 * protect us from issues such as XSS.
 *
 * {@link https://github.com/google/caja}
 * {@link https://github.com/genediazjr/disinfect}
 *
 * @module DisinfectPlugin
 */

const Disinfect = require('disinfect')

const DisinfectPlugin = {
  plugin: Disinfect,
  options: {
    disinfectQuery: true,
    disinfectParams: true,
    disinfectPayload: true
  }
}

module.exports = DisinfectPlugin
