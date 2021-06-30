/**
 * @module CustomerFileHeadPresenter
 */

import BasePresenter from './base.presenter.js'

/**
 * Formats data for the head of a customer file.
 *
 * Note that data.index and data.fileReference are added by StreamTransformUsingPresenter and are not part of the data
 * originally read from the source customer record.
 *
 * With reference to the existing v1 charging module customer file presenter:
 * https://github.com/DEFRA/charging-module-api/blob/main/app/schema/pre_sroc/wrls/customer_file_presenter.js
 */

export default class CustomerFileHeadPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'H',
      col02: this._leftPadZeroes(data.index, 7),
      col03: 'NAL',
      col04: data.region,
      col05: 'C',
      col06: this._fileNumber(data.fileReference),
      col07: this._formatDate(Date.now())
    }
  }

  /**
   * When given a file reference eg. 'nalwc50003', returns the file number part '50003'. The format we return it in
   * doesn't matter so we simply return a string without converting to an integer first.
   */
  _fileNumber (fileReference) {
    return fileReference.slice(-5)
  }
}
