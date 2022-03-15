'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const CustomerHelper = require('../../../support/helpers/customer.helper.js')
const GeneralHelper = require('../../../support/helpers/general.helper.js')
const CustomerFileModel = require('../../../../app/models/customer_file.model.js')
const { DataError } = require('objection')

// Thing under test
const ViewCustomerFileService = require('../../../../app/services/files/customers/view_customer_file.service.js')

describe('Show Customer File service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there is a matching customer file', () => {
    it('returns the details for it', async () => {
      const customerFile = await CustomerHelper.addCustomerFile()

      const result = await ViewCustomerFileService.go(customerFile.id)

      expect(result).to.be.an.instanceOf(CustomerFileModel)
      expect(result.id).to.equal(customerFile.id)
    })

    it('returns a result that includes a list of related exported customers', async () => {
      const customerFile = await CustomerHelper.addCustomerFile()
      await CustomerHelper.addExportedCustomer(customerFile, 'BB02BEEB')
      await CustomerHelper.addExportedCustomer(customerFile, 'CC02BEEB')

      const result = await ViewCustomerFileService.go(customerFile.id)

      expect(result.exportedCustomers.length).to.equal(2)
      expect(result.exportedCustomers[0].customerReference).to.equal('BB02BEEB')
    })
  })

  describe('When there is no matching customer file', () => {
    it('throws an error', async () => {
      const id = GeneralHelper.uuid4()
      const err = await expect(ViewCustomerFileService.go(id)).to.reject(Error, `No customer file found with id ${id}`)

      expect(err).to.be.an.error()
    })
  })

  describe('When an invalid UUID is used', () => {
    it('throws an error', async () => {
      const err = await expect(ViewCustomerFileService.go('123456789')).to.reject(DataError)

      expect(err).to.be.an.error()
    })
  })
})
