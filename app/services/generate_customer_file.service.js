'use strict'

/**
 * @module GenerateCustomerFileService
 */

const { CustomerModel } = require('../models')
const TransformRecordsToFileService = require('./transform_records_to_file.service')
const {
  CustomerFileBodyPresenter,
  CustomerFileHeadPresenter,
  CustomerFileTailPresenter
} = require('../presenters')

class GenerateCustomerFileService {
  /**
   * Generates and writes a customer file for a region to a given filename in the temp folder.
   *
   * @param {string} regimeId Id of the regime to generate the customer file for.
   * @param {string} region The region to generate the customer file for.
   * @param {string} filename The name of the file to be generated.
   * @param {string} fileReference The file reference to be used in the head of the file.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (regimeId, region, filename, fileReference) {
    const query = this._query(regimeId, region)

    // Only data passed in as additionalData is available to the header
    const additionalData = { region, fileReference }

    return TransformRecordsToFileService.go(
      query,
      CustomerFileHeadPresenter,
      CustomerFileBodyPresenter,
      CustomerFileTailPresenter,
      filename,
      additionalData
    )
  }

  static _query (regimeId, region) {
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
      .where('regimeId', regimeId)
      .where('region', region)
  }
}

module.exports = GenerateCustomerFileService
