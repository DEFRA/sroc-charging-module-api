'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { ChargePresenter } = require('../../app/presenters')

describe('Charge presenter', () => {
  afterEach(async () => {
    Sinon.restore()
  })

  describe('returns chargeValue', () => {
    it('negative value when chargeCredit is true', async () => {
      const testData = { chargeValue: 100, chargeCredit: true }
      const testPresenter = new ChargePresenter(testData)
      const presentation = testPresenter.call()

      expect(presentation.chargeValue).to.equal(-100)
    })

    it('positive value when chargeCredit is false', async () => {
      const testData = { chargeValue: 100, chargeCredit: false }
      const testPresenter = new ChargePresenter(testData)
      const presentation = testPresenter.call()

      expect(presentation.chargeValue).to.equal(100)
    })
  })
})
