'use strict'

const Boom = require('@hapi/boom')

class BaseTranslator {
  constructor (data) {
    // Validate data against this._schema and throw bad data error if validation fails
    const { error, value: validatedData } = this._validate(data)
    if (error) {
      throw Boom.badData(error)
    }

    // Assign validated data to _data and set it to be non-enumerable so it isn't visible outside of the translator
    Object.assign(this, { _data: validatedData })
    Object.defineProperty(this, '_data', { enumerable: false })

    // Create each getter in _translations. We do this within the constructor to keep Joi happy
    // TODO: We may not need to do this here now that validation is done on the presenter
    const translations = this._translations()
    for (const translator in translations) {
      this._createStandardGetter(this, translator, translations[translator])
    }
  }

  _validate (data) {
    return this._schema().validate(data, { abortEarly: false })
  }

  _schema () {
    throw new Error('You need to specify _schema in the child translator')
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
