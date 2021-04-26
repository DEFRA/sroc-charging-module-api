'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, RegimeHelper } = require('../support/helpers')
const { CustomerModel, CustomerFileModel, ExportedCustomerModel } = require('../../app/models')
const { CreateCustomerDetailsService } = require('../../app/services')

// Thing under test
const { MoveCustomersToExportedTableService } = require('../../app/services')

describe('Move Customers To Exported Table service', () => {
  let regime
  let customerFile

  const payload = {
    region: 'A',
    customerReference: 'AB12345678',
    customerName: 'CUSTOMER_NAME',
    addressLine1: 'ADDRESS_LINE_1',
    addressLine2: 'ADDRESS_LINE_2',
    addressLine3: 'ADDRESS_LINE_3',
    addressLine4: 'ADDRESS_LINE_4',
    addressLine5: 'ADDRESS_LINE_5',
    addressLine6: 'ADDRESS_LINE_6',
    postcode: 'POSTCODE'
  }

  const fileReference = 'nalwc50003'

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    CreateCustomerDetailsService.go(payload, regime)

    customerFile = await CustomerFileModel.query().insert({
      regimeId: regime.id,
      region: payload.region,
      fileReference
    })
  })

  describe('When called', () => {
    it('populates the exported_customers table', async () => {
      await MoveCustomersToExportedTableService.go(regime, payload.region, customerFile.id)

      const result = await ExportedCustomerModel.query().first()

      expect(result.customerReference).to.equal(payload.customerReference)
      expect(result.customerFileId).to.equal(customerFile.id)
    })

    it('clears the customers table', async () => {
      await MoveCustomersToExportedTableService.go(regime, payload.region, customerFile.id)

      const result = await CustomerModel.query()

      expect(result).to.be.empty()
    })

    it('only handles customers of the specified regime and region', async () => {
      const wrongRegime = await RegimeHelper.addRegime('wrng', 'WRNG')
      await CreateCustomerDetailsService.go({ ...payload, customerReference: 'A_WRNG' }, wrongRegime)
      await CreateCustomerDetailsService.go({ ...payload, customerReference: 'W_WRLS', region: 'W' }, regime)

      await MoveCustomersToExportedTableService.go(regime, payload.region, customerFile.id)

      const customers = await CustomerModel.query()
      const customerReferences = customers.map(customer => customer.customerReference)
      expect(customerReferences).to.only.include(['A_WRNG', 'W_WRLS'])

      const exportedCustomers = await ExportedCustomerModel.query()
      const exportedCustomerReferences = exportedCustomers.map(customer => customer.customerReference)
      expect(exportedCustomerReferences).to.only.include(payload.customerReference)
    })
  })
})
