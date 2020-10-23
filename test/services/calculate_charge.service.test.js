'use strict'
// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { CalculateChargeService, RulesService } = require('../../app/services')

class Presenter {
  constructor (response) {
    this.response = { ...response }
  }
}

describe('Charge service', () => {
  let rulesStub

  beforeEach(async () => {
    rulesStub = Sinon.stub(RulesService, 'call').callsFake(async (data) => data)
  })

  afterEach(async () => {
    rulesStub.restore()
  })

  it('calls the rules service', async () => {
    const translator = { translator: true }

    await CalculateChargeService.call(translator, Presenter)

    expect(rulesStub.calledOnce).to.be.true()
  })

  it('returns a presenter containing the rules service response', async () => {
    const translator = { test: true }

    const charge = await CalculateChargeService.call(translator, Presenter)

    expect(charge).to.be.an.instanceOf(Presenter)
    expect(charge.response).to.equal(translator)
  })
})
