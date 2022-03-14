'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper')
const RegimeHelper = require('../support/helpers/regime.helper')
const CustomerModel = require('../../app/models/customer.model')

// Thing under test
const { CreateCustomerDetailsService } = require('../../app/services')

describe('Create Customer Details service', () => {
  let regime

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

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
  })

  describe('When a valid payload is supplied', () => {
    it('saves the payload to the customers table', async () => {
      const customerDetails = await CreateCustomerDetailsService.go(payload, regime)

      const result = await CustomerModel.query().findById(customerDetails.id)

      expect(result.regimeId).to.equal(regime.id)
      expect(result.region).to.equal(payload.region)
      expect(result.customerReference).to.equal(payload.customerReference)
      expect(result.customerName).to.equal(payload.customerName)
      expect(result.addressLine1).to.equal(payload.addressLine1)
      expect(result.addressLine2).to.equal(payload.addressLine2)
      expect(result.addressLine3).to.equal(payload.addressLine3)
      expect(result.addressLine4).to.equal(payload.addressLine4)
      expect(result.addressLine5).to.equal(payload.addressLine5)
      expect(result.addressLine6).to.equal(payload.addressLine6)
      expect(result.postcode).to.equal(payload.postcode)
    })

    it('overwrites a previous change for the customer', async () => {
      await CreateCustomerDetailsService.go(payload, regime)
      await CreateCustomerDetailsService.go({ ...payload, postcode: 'NEW_POSTCODE' }, regime)

      const result = await CustomerModel.query()

      expect(result.length).to.equal(1)
      expect(result[0].postcode).to.equal('NEW_POSTCODE')
    })

    it('sets to `null` anything not received', async () => {
      const partialPayload = payload
      delete partialPayload.addressLine2

      await CreateCustomerDetailsService.go(payload, regime)
      await CreateCustomerDetailsService.go(partialPayload, regime)

      const result = await CustomerModel.query()

      expect(result.length).to.equal(1)
      expect(result[0].addressLine2).to.equal(null)
    })
  })

  describe('When an invalid payload is supplied', () => {
    describe('because a mandatory field is missing', () => {
      it('throws an error', async () => {
        const err = await expect(CreateCustomerDetailsService.go({ INVALID_PAYLOAD: 'INVALID' }, regime)).to.reject()

        expect(err).to.be.an.error()
        const requiredMessages = err.output.payload.message.split('. ')

        expect(requiredMessages).to.only.contain([
          '"region" is required',
          '"customerReference" is required',
          '"customerName" is required',
          '"addressLine1" is required'
        ])
      })
    })
  })
})
