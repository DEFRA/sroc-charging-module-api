'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { ChargePresenter } = require('../../app/presenters')

describe('Charge presenter', () => {
  describe('returns chargeValue', () => {
    it('negative value when chargeCredit is true', async () => {
      const testData = { chargeValue: 100, chargeCredit: true }
      const testPresenter = new ChargePresenter(testData)
      const presentation = testPresenter.go()

      expect(presentation.chargeValue).to.equal(-100)
    })

    it('positive value when chargeCredit is false', async () => {
      const testData = { chargeValue: 100, chargeCredit: false }
      const testPresenter = new ChargePresenter(testData)
      const presentation = testPresenter.go()

      expect(presentation.chargeValue).to.equal(100)
    })
  })
})
