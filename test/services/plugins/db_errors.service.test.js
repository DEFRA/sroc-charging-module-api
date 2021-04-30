'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DBError, UniqueViolationError } = require('db-errors')

// Thing under test
const { DbErrorsService } = require('../../../app/services')

describe('Db Errors service', () => {
  describe('If the value passed in is a DB error', () => {
    describe('but its not a DB error we handle', () => {
      it("returns a '400' Boom error", () => {
        const args = {
          client: 'postgresql',
          nativeError: {
            detail: 'Database go bang'
          }
        }
        const result = DbErrorsService.go(new DBError(args))

        expect(result.isBoom).to.be.true()
        expect(result.output.statusCode).to.equal(400)
        expect(result.output.payload.message).to.equal(`DBError - ${args.nativeError.detail}`)
      })
    })

    describe("and it is a 'UniqueViolationError'", () => {
      describe('but not one we handle', () => {
        it("returns a '409' Boom error", () => {
          const args = {
            client: 'postgresql',
            constraint: 'shopping_item_id_customer_id_unique',
            nativeError: {
              detail: 'Already got one of those'
            }
          }
          const result = DbErrorsService.go(new UniqueViolationError(args))

          expect(result.isBoom).to.be.true()
          expect(result.output.statusCode).to.equal(409)
          expect(result.output.payload.message).to.equal(`UniqueViolationError - ${args.nativeError.detail}`)
        })
      })

      describe('specifically a duplicate client Id for the same regime', () => {
        it("returns a '409' Boom error with a tailored response", () => {
          const args = {
            client: 'postgresql',
            constraint: 'transactions_regime_id_client_id_unique',
            nativeError: {
              detail: 'Duplicate client Id for same regime'
            }
          }
          const data = {
            payload: {
              clientId: 'DOUBLEIMPACT'
            },
            params: {
              regimeId: 'wrls'
            }
          }

          const result = DbErrorsService.go(new UniqueViolationError(args), data)

          expect(result.isBoom).to.be.true()
          expect(result.output.statusCode).to.equal(409)
          expect(result.output.payload.message).to.equal(
            "A transaction with Client ID 'DOUBLEIMPACT' for Regime 'wrls' already exists."
          )
          expect(result.output.payload.clientId).to.equal('DOUBLEIMPACT')
        })
      })
    })
  })

  describe('If the value passed in is not a DB error', () => {
    it('just returns the value', () => {
      const notAnError = {
        foo: 'bar'
      }
      const result = DbErrorsService.go(notAnError)

      expect(result).to.equal(notAnError)
    })
  })
})
