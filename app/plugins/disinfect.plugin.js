/*
  This plugin applies Google's Caja HTML Sanitizer on route query, payload, and
  params. It was added specifically to protect us from issues such as XSS.

  https://github.com/google/caja
  https://github.com/genediazjr/disinfect
*/
const Disinfect = require('disinfect')

const disinfect = {
  plugin: Disinfect,
  options: {
    disinfectQuery: true,
    disinfectParams: true,
    disinfectPayload: true
  }
}

module.exports = disinfect
