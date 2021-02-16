'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { RulesServiceHelper } = require('../support/helpers')

const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const Got = require('got')

// Thing under test
const { RulesService } = require('../../app/services')

// Wraps regime, financial year and charge params in a dummy presenter object for passing to rules service
const dummyPresenter = (regime, financialYear, ruleset, chargeParams = {}) => {
  return {
    regime,
    financialYear,
    ruleset,
    chargeParams
  }
}

describe('Rules service', () => {
  describe('when calling the rule service succeeds', () => {
    before(async () => {
      // Use a spy to confirm what endpoint we try to call on the rules service
      Sinon.spy(Got, 'post')

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
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wrls', 'presroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wrls', 2020, 'presroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wrls', 'presroc')}_2020_21`)
          })
        })
      })

      describe("the ruleset is 'SROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wrls', 2019, 'sroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wrls', 'sroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wrls', 2020, 'sroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wrls', 'sroc')}_2020_21`)
          })
        })
      })
    })

    describe("if the regime is 'WML'", () => {
      describe("the ruleset is 'PRESROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wml', 2019, 'presroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wml', 'presroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wml', 2020, 'presroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wml', 'presroc')}_2020_21`)
          })
        })
      })

      describe("the ruleset is 'SROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wml', 2019, 'sroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wml', 'sroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('wml', 2020, 'sroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('wml', 'sroc')}_2020_21`)
          })
        })
      })
    })

    describe("if the regime is 'PAS'", () => {
      describe("the ruleset is 'PRESROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('pas', 2019, 'presroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('pas', 'presroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('pas', 2020, 'presroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('pas', 'presroc')}_2020_21`)
          })
        })
      })

      describe("the ruleset is 'SROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('pas', 2019, 'sroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('pas', 'sroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('pas', 2020, 'sroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('pas', 'sroc')}_2020_21`)
          })
        })
      })
    })

    describe("if the regime is 'CFD'", () => {
      describe("the ruleset is 'PRESROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('cfd', 2019, 'presroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('cfd', 'presroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('cfd', 2020, 'presroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('cfd', 'presroc')}_2020_21`)
          })
        })
      })

      describe("the ruleset is 'SROC'", () => {
        describe("and the year is '2019'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('cfd', 2019, 'sroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('cfd', 'sroc')}_2019_20`)
          })
        })

        describe("and the year is '2020'", () => {
          it('calls the correct endpoint', async () => {
            const presenter = dummyPresenter('cfd', 2020, 'sroc')
            await RulesService.go(presenter)

            expect(Got.post.calledOnce).to.be.true()
            expect(Got.post.getCall(0).args[0]).to.equal(`${RulesServiceHelper.path('cfd', 'sroc')}_2020_21`)
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
          .reply(500, response)
          .persist()
      })

      it('throws an error and presents the messages to the user', async () => {
        const presenter = dummyPresenter('wrls', 2019, 'presroc')

        const err = await expect(RulesService.go(presenter)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal('Rules service returned the following: ERROR1, ERROR2')
      })
    })

    describe('because an error was returned', () => {
      it.only('handles the error', async () => {
        Nock(RulesServiceHelper.url)
          .post(() => true)
          .replyWithError({
            code: 500,
            message: 'An error occurred during the execution of the ruleset. Make sure that the request is valid, and review the ruleset and execution object model if applicable.',
            details: "Error when extracting the ruleset parameter value from the request.\nUnexpected character ('\"' (code 34)): was expecting comma to separate Object entries\n at [Source: com.ibm.ws.webcontainer31.srt.SRTInputStream31@2688941c; line: 16, column: 7]\n",
            errorCode: 'GBRXH0504E'
          })
          .persist()

        const presenter = dummyPresenter('wrls', 2019, 'presroc')

        const err = await expect(RulesService.go(presenter)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.statusCode).to.equal(400)
        expect(err.output.payload.message).to.equal('Rules service error: AWOOGA')
      })
    })

    describe('because of a network error', () => {
      it('handles the error', async () => {
        Nock(RulesServiceHelper.url)
          .post(() => true)
          .replyWithError({ code: 'ECONNRESET' })
          .persist()

        const presenter = dummyPresenter('wrls', 2019, 'presroc')

        const err = await expect(RulesService.go(presenter)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.statusCode).to.equal(400)
        expect(err.output.payload.message).to.equal('Error communicating with the rules service: ECONNRESET')
      })
    })
  })
})
