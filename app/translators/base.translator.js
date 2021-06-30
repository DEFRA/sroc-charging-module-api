import Boom from '@hapi/boom'

export default class BaseTranslator {
  constructor (data) {
    // Validate data against this._schema and throw bad data error if validation fails
    const { error, value: validatedData } = this._validate(data)
    if (error) {
      throw Boom.badData(error)
    }

    // Translate the validated data to each property specified in this._translations
    const translatedData = this._translate(validatedData, this._translations())
    Object.assign(this, translatedData)

    // Assign validated data to _data and set it to be non-enumerable so it isn't visible outside of the translator.
    // For example, this allows us to pass a translator instance to Objection's `query().insert()` method as is rather
    // than defining each property to update. Without this Objection would see `_data` and try and include it in the
    // insert query
    Object.assign(this, { _data: validatedData })
    Object.defineProperty(this, '_data', { enumerable: false })
  }

  /**
   * The validated data untranslated
   *
   * This was originally added to support needing to pass a validated transaction create request to the
   * `CalculateChargeService` but with its original property names/. Doing it this way avoids needing another translator
   * to sit between the 2.
   *
   * @return {Object} The validated data passed into the translator but untranslated.
   */
  get validatedData () {
    return this._data
  }

  _validate (data) {
    return this._schema().validate(data, { abortEarly: false, allowUnknown: true })
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
