'use strict'

class BaseTranslator {
  constructor (data) {
    Object.assign(this, { _data: data })
    // Set _data to be non-enumerable so it isn't passed to model validation
    Object.defineProperty(this, '_data', { enumerable: false })

    const translations = this._translations()

    // Create each getter in _translations
    // We do this within the constructor to keep Joi happy
    for (const translator in translations) {
      this._createStandardGetter(this, translator, translations[translator])
    }
  }

  _translations () {
    throw new Error('You need to specify _translations in the child translator')
  }

  _createStandardGetter (object, dataName, getterName) {
    Object.defineProperty(object, getterName, {
      get () {
        return object._data[dataName]
      },
      // We make the getter enumerable so it's visible to Joi
      enumerable: true
    })
  }
}

module.exports = BaseTranslator
