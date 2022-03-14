'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper')
const RegimeHelper = require('../../../support/helpers/regime.helper')

const { CustomerFileModel } = require('../../../../app/models')
const { CreateCustomerDetailsService } = require('../../../../app/services')

// Things we need to stub
const { NextCustomerFileReferenceService } = require('../../../../app/services')

// Thing under test
const { PrepareCustomerFileService } = require('../../../../app/services')

describe('Prepare Customer File service', () => {
  let regime

  const region = 'A'
  const payload = {
    customerName: 'CUSTOMER_NAME',
    addressLine1: 'ADDRESS_LINE_1',
    addressLine2: 'ADDRESS_LINE_2',
    addressLine3: 'ADDRESS_LINE_3',
    addressLine4: 'ADDRESS_LINE_4',
    addressLine5: 'ADDRESS_LINE_5',
    addressLine6: 'ADDRESS_LINE_6',
    postcode: 'POSTCODE'
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')

    await CreateCustomerDetailsService.go({ ...payload, region, customerReference: 'AA12345678' }, regime)
    await CreateCustomerDetailsService.go({ ...payload, region: 'W', customerReference: 'WA87654321' }, regime)

    Sinon.stub(NextCustomerFileReferenceService, 'go').callsFake((_, region) => `nal${region.toLowerCase()}c50001`)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When matching customer details exist', () => {
    it('creates a customer file record', async () => {
      await PrepareCustomerFileService.go(regime, region)

      const customerFile = await CustomerFileModel.query().where('region', region).first()

      expect(customerFile.regimeId).to.equal(regime.id)
      expect(customerFile.region).to.equal(region)
      expect(customerFile.fileReference).to.equal('nalac50001')
      expect(customerFile.status).to.equal('pending')
    })

    it('only creates a customer file record for the specified region', async () => {
      await PrepareCustomerFileService.go(regime, region)

      const customerFiles = await CustomerFileModel.query().where('region', region)

      expect(customerFiles.length).to.equal(1)
    })
  })

  describe('When no matching customer details exist', () => {
    it('does not create a customer file record', async () => {
      await PrepareCustomerFileService.go(regime, 'X')

      const customerFiles = await CustomerFileModel.query().where('region', 'X')

      expect(customerFiles).to.be.empty()
    })
  })
})
