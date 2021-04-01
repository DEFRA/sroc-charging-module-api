'use strict'

/**
 * @module GenerateCustomerFileService
 */

const { CustomerModel } = require('../models')
const TransformRecordsToFileService = require('./transform_records_to_file.service')

class GenerateCustomerFileService {
  /**
   * Generates and writes a customer file for a region to a given filename in the temp folder.
   *
   * @param {string} region The region to generate the customer file for.
   * @param {string} filename The name of the file to be generated.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (region, filename) {
    const query = this._query(region)

    const additionalData = this._additionalData()

    return TransformRecordsToFileService.go(
      query,
      this._dummyHeadTailPresenter(),
      this._dummyBodyPresenter(),
      this._dummyHeadTailPresenter(),
      filename,
      additionalData
    )
  }

  static _query (region) {
    return CustomerModel.query()
      .select('*')
      .where('region', region)
  }

  static _additionalData () {
    return {
      additionalData: 'additionalData'
    }
  }

  static _dummyBodyPresenter () {
    return _dummyBodyPresenterClass
  }

  static _dummyHeadTailPresenter () {
    return _dummyHeadTailPresenterClass
  }
}

class _dummyBodyPresenterClass {
  constructor (data) {
    this.data = data
  }

  go () {
    return {
      col01: this.data.id,
      col02: this.data.customerReference
    }
  }
}

class _dummyHeadTailPresenterClass {
  constructor (data) {
    this.data = data
  }

  go () {
    return {
      col01: this.data.additionalData
    }
  }
}

module.exports = GenerateCustomerFileService
