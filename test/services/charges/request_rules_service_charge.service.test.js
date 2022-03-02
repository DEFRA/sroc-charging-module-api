'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { RulesServiceHelper } = require('../../support/helpers')

const { presroc: chargeFixtures } = require('../../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const { RulesServiceConfig } = require('../../../config')

// As detailed in RequestRulesServiceChangeService, we cannot use require to bring in the got dependency as it no longer
// supports CJS as of v12. Since we want to import it at the top level so we can use a spy to monitor it, we therefore
// import it within an asyncronous IIFE.
let got;
(async () => {
  const Got = await import('got')
  got = Got.got
})()

// Thing under test
const { RequestRulesServiceCharge } = require('../../../app/services')

// Wraps regime, financial year and charge params in a dummy presenter object for passing to rules service
const dummyPresenter = (regime, financialYear, ruleset, chargeParams = {}) => {
  return {
    regime,
    financialYear,
    ruleset,
    chargeParams
  }
}

describe('Request Rules Service Charge service', () => {
  describe('when calling the rule service succeeds', () => {
    before(async () => {
      // Use a spy to confirm what endpoint we try to call on the rules service
      Sinon.spy(got, 'post')

      // Intercept all requests in this test suite as we don't actually want to call the service. We're just looking to
      // confirm we are calling the correct endpoints
      Nock(RulesServiceHelper.url)
        .post(() => true)
        .reply(200)
        .persist()
    })

    after(async () => {
      Sinon.restore()
      Nock.cleanAll()
    })

    afterEach(async () => {
      Sinon.resetHistory()
    })

    describe("if the regime is 'WRLS'", () => {
      describe("the ruleset is 'PRESROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wrls', 2019, 'presroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wrls', 'presroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wrls', 2020, 'presroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wrls', 'presroc')}_2020_21`)
          })
        })
      })

      describe("the ruleset is 'SROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wrls', 2019, 'sroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wrls', 'sroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wrls', 2020, 'sroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wrls', 'sroc')}_2020_21`)
          })
        })
      })
    })

    describe("if the regime is 'WML'", () => {
      describe("the ruleset is 'PRESROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wml', 2019, 'presroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wml', 'presroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wml', 2020, 'presroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wml', 'presroc')}_2020_21`)
          })
        })
      })

      describe("the ruleset is 'SROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wml', 2019, 'sroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wml', 'sroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wml', 2020, 'sroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wml', 'sroc')}_2020_21`)
          })
        })
      })
    })

    describe("if the regime is 'PAS'", () => {
      describe("the ruleset is 'PRESROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('pas', 2019, 'presroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('pas', 'presroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('pas', 2020, 'presroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('pas', 'presroc')}_2020_21`)
          })
        })
      })

      describe("the ruleset is 'SROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('pas', 2019, 'sroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('pas', 'sroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('pas', 2020, 'sroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('pas', 'sroc')}_2020_21`)
          })
        })
      })
    })

    describe("if the regime is 'CFD'", () => {
      describe("the ruleset is 'PRESROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('cfd', 2019, 'presroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('cfd', 'presroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('cfd', 2020, 'presroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('cfd', 'presroc')}_2020_21`)
          })
        })
      })

      describe("the ruleset is 'SROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('cfd', 2019, 'sroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('cfd', 'sroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('cfd', 2020, 'sroc')
            await RequestRulesServiceCharge.go(presenter)

            expect(got.post.calledOnce).to.be.true()
            expect(got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('cfd', 'sroc')}_2020_21`)
          })
        })
      })
    })
  })

  describe('when calling the rule service fails', () => {
    afterEach(async () => {
      Sinon.restore()
      Nock.cleanAll()
    })

    describe('because the service returned messages', () => {
      before(async () => {
        const response = {
          ...rulesServiceResponse,
          WRLSChargingResponse: {
            ...rulesServiceResponse.WRLSChargingResponse,
            messages: ['ERROR1', 'ERROR2']
          }
        }

        Nock(RulesServiceHelper.url)
          .post(() => true)
          .reply(200, response)
      })

      it('throws an error and presents the messages to the user', async () => {
        const presenter = dummyPresenter('wrls', 2019, 'presroc')

        const err = await expect(RequestRulesServiceCharge.go(presenter)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.statusCode).to.equal(422)
        expect(err.output.payload.message).to.equal('Rules service returned the following: ERROR1, ERROR2')
      })
    })

    describe('because an error was returned', () => {
      before(async () => {
        Nock(RulesServiceHelper.url)
          .post(() => true)
          .reply(500, () => {
            return {
              code: 500,
              message: 'ERROR_MESSAGE',
              details: 'ERROR_DETAILS',
              errorCode: 'ERROR_CODE'
            }
          })
      })

      it('returns a 400 error with the error message', async () => {
        const presenter = dummyPresenter('wrls', 2019, 'presroc')

        const err = await expect(RequestRulesServiceCharge.go(presenter)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.statusCode).to.equal(400)
        expect(err.output.payload.message).to.equal('Rules service error: ERROR_MESSAGE')
      })
    })

    describe('because an incorrect date was sent', () => {
      before(async () => {
        Nock(RulesServiceHelper.url)
          .post(() => true)
          .reply(404)
      })

      it('returns a 404 error and an appropriate message', async () => {
        Nock(RulesServiceHelper.url)
          .post(() => true)
          .reply(404)

        const presenter = dummyPresenter('wrls', 2019, 'presroc')

        const err = await expect(RequestRulesServiceCharge.go(presenter)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.statusCode).to.equal(422)
        expect(err.output.payload.message).to.equal('Ruleset not found, please check periodStart value.')
      })
    })

    describe('because of a network error:', () => {
      // We increase the timeout value for this test because got leaves ~1000ms between retry attempts
      describe('timeout error', { timeout: 5000 }, () => {
        before(async () => {
          // Set the timeout value to 50ms for these tests
          Sinon.replace(RulesServiceConfig, 'timeout', 50)
        })

        it('returns a 400 error with the error code', async () => {
          Nock(RulesServiceHelper.url)
            .post(() => true)
            .delay(100)
            .reply(200)
            .persist()

          const presenter = dummyPresenter('wrls', 2019, 'presroc')

          const err = await expect(RequestRulesServiceCharge.go(presenter)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.statusCode).to.equal(400)
          expect(err.output.payload.message).to.equal('Error communicating with the rules service: ETIMEDOUT')
        })

        it('retries before erroring', async () => {
          // The first response will time out, the second response will return OK
          Nock(RulesServiceHelper.url)
            .post(() => true)
            .delay(100)
            .reply(200)
            .post(() => true)
            .reply(200)

          const presenter = dummyPresenter('wrls', 2019, 'presroc')

          const result = await expect(RequestRulesServiceCharge.go(presenter)).to.not.reject()

          expect(result).to.not.be.an.error()
        })
      })

      describe('other network error', () => {
        before(async () => {
          Nock(RulesServiceHelper.url)
            .post(() => true)
            .replyWithError({ code: 'ECONNRESET' })
        })

        it('returns a 400 error with the error type', async () => {
          const presenter = dummyPresenter('wrls', 2019, 'presroc')

          const err = await expect(RequestRulesServiceCharge.go(presenter)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.statusCode).to.equal(400)
          expect(err.output.payload.message).to.equal('Error communicating with the rules service: ECONNRESET')
        })
      })
    })
  })
})
