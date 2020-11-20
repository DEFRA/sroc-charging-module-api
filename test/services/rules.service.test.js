'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Nock = require('nock')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { RulesServiceHelper } = require('../support/helpers')

// Thing under test
const { RulesService } = require('../../app/services')

// Wraps regime, financial year and charge params in a dummy presenter object for passing to rules service
const dummyPresenter = (regime, financialYear, chargeParams = {}) => ({ regime, financialYear, chargeParams })

describe('Rules service', () => {
  afterEach(async () => {
    Nock.cleanAll()
  })

  it('calls the rules service API', async () => {
    const wrls = RulesServiceHelper.allRulesData('wrls')
    Nock(RulesServiceHelper.url)
      .post(`/${wrls.application}/${wrls.ruleset}_2020_21`, wrls.request)
      .reply(200, wrls.response)
    const presenter = dummyPresenter('wrls', 2020, wrls.request)

    const result = await RulesService.go(presenter)

    expect(result.body).to.equal(wrls.response)
  })

  describe('calls different endpoints', () => {
    beforeEach(async () => {
      // Intercept all requests in this test suite as we just want to capture the urls
      Nock(RulesServiceHelper.url)
        .post(() => true)
        .reply(200)
        .persist()
    })

    it('for different regimes', async () => {
      const presenterWrls = dummyPresenter('wrls', 2020)
      const presenterCfd = dummyPresenter('cfd', 2020)

      const { requestUrl: requestUrlWrls } = await RulesService.go(presenterWrls)
      const { requestUrl: requestUrlCfd } = await RulesService.go(presenterCfd)

      expect(requestUrlWrls).to.not.equal(requestUrlCfd)
    })

    it('for different years', async () => {
      const presenter2019 = dummyPresenter('wrls', 2019)
      const presenter2020 = dummyPresenter('wrls', 2020)

      const { requestUrl: requestUrl2019 } = await RulesService.go(presenter2019)
      const { requestUrl: requestUrl2020 } = await RulesService.go(presenter2020)

      expect(requestUrl2019).to.not.equal(requestUrl2020)
    })
  })
})
