'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { ValidationError } = require('joi')
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { TransactionSrocTranslator } = require('../../app/translators')

describe('Transaction Sroc translator', () => {
  const payload = {
    ruleset: 'sroc',
    region: 'A',
    customerReference: 'CUSTOMER_REF',
    licenceNumber: 'LICENCE_NUMBER',
    chargePeriod: 'CHARGE_PERIOD',
    areaCode: 'ARCA',
    lineDescription: 'LINE_DESCRIPTION',
    chargeCategoryDescription: 'CHARGE_CATEGORY_DESCRIPTION'
  }

  const data = (
    payload,
    billRunId = GeneralHelper.uuid4(),
    regimeId = GeneralHelper.uuid4(),
    authorisedSystemId = GeneralHelper.uuid4()) => {
    return {
      billRunId,
      regimeId,
      authorisedSystemId,
      ...payload
    }
  }

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        const result = new TransactionSrocTranslator(data(payload))

        expect(result).to.not.be.an.error()
      })

      describe('because region is lower case', () => {
        it('does not throw an error', async () => {
          const validPayload = {
            ...payload,
            region: 'a'
          }

          const result = new TransactionSrocTranslator(data(validPayload))

          expect(result).to.not.be.an.error()
        })
      })

      describe('because areaCode is lower case', () => {
        it('does not throw an error', async () => {
          const validPayload = {
            ...payload,
            areaCode: 'arca'
          }

          const result = new TransactionSrocTranslator(data(validPayload))

          expect(result).to.not.be.an.error()
        })
      })
    })

    describe('when the data is not valid', () => {
      describe('because ruleset', () => {
        describe('is not `sroc`', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              ruleset: 'presroc'
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              ruleset: undefined
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because region', () => {
        describe('is not a valid region', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              region: 'INVALID_REGION'
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload
            }
            delete invalidPayload.region

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because customerReference', () => {
        describe('is too long', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              customerReference: 'X'.repeat(13)
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              customerReference: undefined
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because licenceNumber', () => {
        describe('is too long', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              licenceNumber: 'X'.repeat(151)
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              licenceNumber: undefined
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because chargePeriod', () => {
        describe('is too long', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              chargePeriod: 'X'.repeat(151)
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              chargePeriod: undefined
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because areaCode', () => {
        describe('is not a valid area', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              areaCode: 'INVALID_AREA'
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              areaCode: undefined
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because lineDescription', () => {
        describe('is too long', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              lineDescription: 'X'.repeat(241)
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              lineDescription: undefined
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because chargeCategoryDescription', () => {
        describe('is too long', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              chargeCategoryDescription: 'X'.repeat(151)
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              chargeCategoryDescription: undefined
            }

            expect(() => new TransactionSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })
    })
  })
})
