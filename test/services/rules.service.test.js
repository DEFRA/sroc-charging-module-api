const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code
const nock = require('nock')

const RulesService = require('../../app/services/rules.service')
const RulesServiceHelper = require('../support/helpers/rules.service.helper')

describe('Rules service', () => {
  it('calls the service', async () => {
    const { WRLS } = RulesServiceHelper

    nock(RulesServiceHelper.url, { encodedQueryParams: true })
      .post(`/${WRLS.application}/${WRLS.ruleset}_2020_21`, WRLS.request)
      .reply(200, WRLS.response)

    const result = await RulesService.call('wrls', 2020, WRLS.request)

    expect(result.body).to.equal(WRLS.response)
  })
})
