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
const RulesService = require('../../app/services/rules.service')

// Wraps regime, financial year and charge params in a dummy translator object for passing to rules service
const dummyTranslator = (regime, financialYear, chargeParams = {}) => ({ regime, financialYear, chargeParams })

describe('Rules service', () => {
  afterEach(async () => {
    Nock.cleanAll()
  })

  it('calls the rules service API', async () => {
    const wrls = RulesServiceHelper.allRulesData('wrls')
    Nock(RulesServiceHelper.url)
      .post(`/${wrls.application}/${wrls.ruleset}_2020_21`, wrls.request)
      .reply(200, wrls.response)
    const translator = dummyTranslator('wrls', 2020, wrls.request)

    const result = await RulesService.call(translator)

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
      const translatorWrls = dummyTranslator('wrls', 2020)
      const translatorCfd = dummyTranslator('cfd', 2020)

      const { requestUrl: requestUrlWrls } = await RulesService.call(translatorWrls)
      const { requestUrl: requestUrlCfd } = await RulesService.call(translatorCfd)

      expect(requestUrlWrls).to.not.equal(requestUrlCfd)
    })

    it('for different years', async () => {
      const translator2019 = dummyTranslator('wrls', 2019)
      const translator2020 = dummyTranslator('wrls', 2020)

      const { requestUrl: requestUrl2019 } = await RulesService.call(translator2019)
      const { requestUrl: requestUrl2020 } = await RulesService.call(translator2020)

      expect(requestUrl2019).to.not.equal(requestUrl2020)
    })
  })
})
