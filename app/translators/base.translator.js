'use strict'

const Boom = require('@hapi/boom')

class BaseTranslator {
  constructor (data) {
    // Validate data against this._schema and throw bad data error if validation fails
    const { error, value: validatedData } = this._validate(data)
    if (error) {
      throw Boom.badData(error)
    }

    // Translate the validated data to each property specified in this._translations
    const translatedData = this._translate(validatedData, this._translations())
    Object.assign(this, translatedData)

    // Assign validated data to _data and set it to be non-enumerable so it isn't visible outside of the translator
    Object.assign(this, { _data: validatedData })
    Object.defineProperty(this, '_data', { enumerable: false })
  }

  _validate (data) {
    return this._schema().validate(data, { abortEarly: false })
  }

  _translate (data, translations) {
    const translatedData = {}

    for (const translator in translations) {
      const translatedPropertyName = translations[translator]
      const value = data[translator]
      translatedData[translatedPropertyName] = value
    }

    return translatedData
  }

  _schema () {
    throw new Error('You need to specify _schema in the child translator')
  }

  _translations () {
    throw new Error('You need to specify _translations in the child translator')
  }
}

module.exports = BaseTranslator
