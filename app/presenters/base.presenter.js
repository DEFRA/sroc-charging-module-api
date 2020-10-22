class BasePresenter {
  constructor (data) {
    this._data = data
  }

  call () {
    return this._presentation(this._data)
  }

  _presentation () {
    throw new Error('You need to specify _presentation in the child presenter')
  }
}

module.exports = BasePresenter
