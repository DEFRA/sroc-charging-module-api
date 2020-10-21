class BasePresenter {
  constructor (data) {
    const presentations = this._presentations()
    // Create each property defined in _presentations
    for (const property in presentations) {
      this._createStandardProperty(this, data[property], presentations[property])
    }
  }

  _presentations () {
    throw new Error('You need to specify _presentations in the child presenter')
  }

  _createStandardProperty (object, value, propertyName) {
    object[propertyName] = value
  }
}

module.exports = BasePresenter
