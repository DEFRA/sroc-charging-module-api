/**
 * @module GenerateCustomerFileService
 */

import CustomerFileBodyPresenter from '../presenters/customer_file_body.presenter.js'
import CustomerFileHeadPresenter from '../presenters/customer_file_head.presenter.js'
import CustomerFileTailPresenter from '../presenters/customer_file_tail.presenter.js'
import CustomerModel from '../models/customer.model.js'
import TransformRecordsToFileService from './transform_records_to_file.service.js'

export default class GenerateCustomerFileService {
  /**
   * Generates and writes a customer file to a given filename in the temp folder.
   *
   * @param {module:CustomerFileModel} customerFile Instance of `CustomerFileModel` which a file will be generated for.
   * @returns {string} The path and filename of the generated file.
   */
  static async go ({ id, region, fileReference }) {
    const query = this._query(id)

    // Only data passed in as additionalData is available to the header
    const additionalData = { region, fileReference }

    return TransformRecordsToFileService.go(
      query,
      CustomerFileHeadPresenter,
      CustomerFileBodyPresenter,
      CustomerFileTailPresenter,
      this._filename(fileReference),
      additionalData
    )
  }

  static _query (customerFileId) {
    return CustomerModel.query()
      .select(
        'region',
        'customerReference',
        'customerName',
        'addressLine1',
        'addressLine2',
        'addressLine3',
        'addressLine4',
        'addressLine5',
        'addressLine6',
        'postcode'
      )
      .where('customerFileId', customerFileId)
      .orderBy('customerReference')
  }

  static _filename (fileReference) {
    return `${fileReference}.dat`
  }
}
