/**
 * @module CustomerFileTailPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats data for the tail of a customer file.
 *
 * Note that data.index is added by StreamTransformUsingPresenter and is not part of the data originally read from the
 * source customer record.
 *
 * With reference to the existing v1 charging module customer file presenter:
 * https://github.com/DEFRA/charging-module-api/blob/main/app/schema/pre_sroc/wrls/customer_file_presenter.js
 */

class CustomerFileTailPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'T',
      col02: this._leftPadZeroes(data.index, 7),
      col03: this._numberOfLinesInFile(data.index)
    }
  }

  /**
   * Returns the number of lines in the file, which we calculate as the current row index + 1 (since index starts at 0)
   */
  _numberOfLinesInFile (index) {
    return index + 1
  }
}

module.exports = CustomerFileTailPresenter
