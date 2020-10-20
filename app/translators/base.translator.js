class BaseTranslator {
  constructor (data) {
    Object.assign(this, { _data: data })
    // Set _data to be non-enumerable so it isn't passed to model validation
    Object.defineProperty(this, '_data', { enumerable: false })

    // Create each getter in _translations
    // We do this within the constructor to keep Joi happy
    for (const translator in this._translations) {
      createStandardGetter(this, translator, this._translations[translator])
    }
  }

  get _translations () {
    throw new Error('You need to specify _translations in the child translator')
  }
}

function createStandardGetter (object, dataName, getterName) {
  Object.defineProperty(object, getterName, {
    get () {
      return object._data[dataName]
    },
    // We make the getter enumerable so it's visible to Joi
    enumerable: true
  })
}

module.exports = BaseTranslator
