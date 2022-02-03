'use strict'

/**
 * @module TransactionFileHeadPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats data for the head of a transaction file.
 *
 * Note that data.index is added by StreamTransformUsingPresenter and is not part of the data originally read from the
 * source transaction record.
 *
 * With reference to the existing v1 charging module transaction file presenter:
 * https://github.com/DEFRA/charging-module-api/blob/main/app/schema/pre_sroc/wrls/transaction_file_presenter.js
 */

class TransactionFileHeadPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'H',
      col02: this._leftPadZeroes(data.index, 7),
      col03: 'NAL',
      col04: data.region,
      col05: 'I',
      col06: this._fileNumber(data.fileReference),
      col07: data.billRunNumber,
      col08: this._formatDate(Date.now())
    }
  }

  /**
   * When given a presroc file reference eg. 'nalwi50003', returns the file number part '50003'.
   * When given an sroc file reference, eg. 'nalwi50003t', returns the file number part '50003T'.
   */
  _fileNumber (fileReference) {
    return fileReference
      .slice(5)
      .toUpperCase()
  }
}

module.exports = TransactionFileHeadPresenter
