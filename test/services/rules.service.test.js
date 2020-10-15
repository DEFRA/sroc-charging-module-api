const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code
const Nock = require('nock')

const RulesService = require('../../app/services/rules.service')
const RulesServiceHelper = require('../support/helpers/rules.service.helper')

describe('Rules service', () => {
  afterEach(async () => {
    Nock.cleanAll()
  })

  it('calls the rules service API', async () => {
    const wrls = RulesServiceHelper.allRulesData('wrls')

    Nock(RulesServiceHelper.url)
      .post(`/${wrls.application}/${wrls.ruleset}_2020_21`, wrls.request)
      .reply(200, wrls.response)

    const result = await RulesService.call('wrls', 2020, wrls.request)

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
      const { requestUrl: requestUrlWrls } = await RulesService.call('wrls', 2020, {})
      const { requestUrl: requestUrlCfd } = await RulesService.call('cfd', 2020, {})

      expect(requestUrlWrls).to.not.equal(requestUrlCfd)
    })

    it('for different years', async () => {
      const { requestUrl: requestUrl2019 } = await RulesService.call('wrls', 2019, {})
      const { requestUrl: requestUrl2020 } = await RulesService.call('wrls', 2020, {})

      expect(requestUrl2019).to.not.equal(requestUrl2020)
    })
  })
})
