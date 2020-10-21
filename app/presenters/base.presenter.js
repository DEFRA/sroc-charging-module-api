class BasePresenter {
  constructor (data) {
    this._data = data
  }

  call () {
    return this._presentations(this._data)
  }

  _presentations () {
    throw new Error('You need to specify _presentations in the child presenter')
  }

  _createStandardProperty (object, value, propertyName) {
    object[propertyName] = value
  }
}

module.exports = BasePresenter
