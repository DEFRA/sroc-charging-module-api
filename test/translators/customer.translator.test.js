// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import GeneralHelper from '../support/helpers/general.helper.js'

// Additional dependencies needed
import { ValidationError } from 'joi'

// Thing under test
import CustomerTranslator from '../../app/translators/customer.translator.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

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
