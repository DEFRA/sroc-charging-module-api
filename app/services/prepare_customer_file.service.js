/**
 * @module PrepareCustomerFileService
 */

import CustomerFileModel from '../models/customer_file.model.js'
import CustomerModel from '../../app/models/customer.model.js'
import NextCustomerFileReferenceService from './next_customer_file_reference.service.js'

export default class PrepareCustomerFileService {
  /**
   * Check for matching unprocessed customer changes in the `customers` table and prepare the `customer_file` record
   *
   * An unprocessed customer change record is a record in the `customers` table that is not linked to a `customer_file`
   * record. When the customer change is created it is linked to a regime and region, so the service checks only for
   * unprocessed changes for the specified regime and region.
   *
   * If any are found it creates a new `customer_file` record, assigns it a new customer file reference, sets its status
   * to `pending`, and then links it to the matching customer change records in `customers`.
   *
   * @param {module:RegimeModel} regime The regime to check for customer changes
   * @param {string} region The region to customer changes
   */
  static async go (regime, region) {
    const fileNeeded = await this._checkIfFileNeeded(regime, region)
    if (fileNeeded) {
      await CustomerFileModel.transaction(async trx => {
        const fileReference = await this._fileReference(regime, region, trx)

        const customerFile = await this._createCustomerFile(regime.id, region, fileReference, trx)

        await this._updateCustomerChanges(customerFile, trx)
      })
    }
  }

  /**
   * Returns true if there are customer records for this regime and region, or false if there aren't
   */
  static async _checkIfFileNeeded (regime, region) {
    const customers = await CustomerModel.query()
      .select('id')
      .where('regimeId', regime.id)
      .andWhere('region', region)
      .andWhere('customerFileId', null)

    return customers.length !== 0
  }

  /**
   * Obtains the next file reference for the given regime and region
   */
  static async _fileReference (regime, region, trx) {
    return NextCustomerFileReferenceService.go(regime, region, trx)
  }

  /**
   * Creates and returns a record with `pending` status in the customer_file table
   */
  static async _createCustomerFile (regimeId, region, fileReference, trx) {
    return CustomerFileModel.query(trx).insert({
      regimeId,
      region,
      fileReference,
      status: 'pending'
    })
  }

  /**
   * Links the records to be included in the customer file by updating `customer_file_id` of the records to
   * `customerFile.id`.
   *
   * We've endeavoured to do all these customer changes in a transaction so it should never happen. But just to be sure
   * we only patch records where customerFileId is `null` to avoid overwriting existing entries.
   */
  static async _updateCustomerChanges (customerFile, trx) {
    await CustomerModel.query(trx)
      .patch({ customerFileId: customerFile.id })
      .where('regimeId', customerFile.regimeId)
      .where('region', customerFile.region)
      .where('customerFileId', null)
  }
}
