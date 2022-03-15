'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GeneralHelper = require('../support/helpers/general.helper.js')
const { ValidationError } = require('joi')

// Thing under test
const CustomerTranslator = require('../../app/translators/customer.translator.js')

describe('Customer translator', () => {
  const input = {
    regimeId: GeneralHelper.uuid4(),
    region: 'A',
    customerReference: 'CUSTOMERREF1',
    customerName: 'Grace Hopper',
    addressLine1: 'Belfort House',
    addressLine2: 'Unit 12A',
    addressLine3: 'Cobol Industrial Estate',
    addressLine4: 'Better Forgiveness',
    addressLine5: 'Askpermission',
    addressLine6: 'Somerset',
    postcode: 'SR7 6BL'
  }

  describe('Default values', () => {
    describe('when passed a lowercase customer reference', () => {
      it('converts it to uppercase', async () => {
        const customerReference = 'customerref1'
        const validInput = {
          ...input,
          customerReference
        }

        const result = new CustomerTranslator(validInput)

        expect(result).to.not.be.an.error()
        expect(result.customerReference).to.equal('CUSTOMERREF1')
      })
    })

    describe('when not passed address lines 2-6', () => {
      it('defaults to `null`', async () => {
        const validInput = input
        delete validInput.addressLine2
        delete validInput.addressLine3
        delete validInput.addressLine4
        delete validInput.addressLine5
        delete validInput.addressLine6

        const result = new CustomerTranslator(validInput)

        expect(result).to.not.be.an.error()
        expect(result.addressLine2).to.equal(null)
        expect(result.addressLine3).to.equal(null)
        expect(result.addressLine4).to.equal(null)
        expect(result.addressLine5).to.equal(null)
        expect(result.addressLine6).to.equal(null)
      })
    })

    describe('when not passed a postcode', () => {
      it('defaults to `.`', async () => {
        const validInput = input
        delete validInput.postcode

        const result = new CustomerTranslator(validInput)

        expect(result).to.not.be.an.error()
        expect(result.postcode).to.equal('.')
      })
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        const result = new CustomerTranslator(input)

        expect(result).to.not.be.an.error()
      })
    })

    describe('when the data is not valid', () => {
      describe('because the region is unrecognised', () => {
        it('throws an error', async () => {
          const invalidInput = {
            ...input,
            region: 'Z'
          }

          expect(() => new CustomerTranslator(invalidInput)).to.throw(ValidationError)
        })
      })
    })
  })
})
