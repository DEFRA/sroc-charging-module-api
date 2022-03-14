'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CalculateChargePresrocPresenter = require('../../app/presenters/calculate_charge_presroc.presenter')

describe('Calculate Charge Presroc presenter', () => {
  describe("when the request was marked as a 'credit'", () => {
    const data = {
      chargeValue: 100,
      chargeCredit: true
    }

    it("returns a negative 'chargeValue'", async () => {
      const testPresenter = new CalculateChargePresrocPresenter(data)
      const result = testPresenter.go()

      expect(result.calculation.chargeValue).to.equal(-100)
    })
  })

  describe("when the request was not marked as a 'credit'", () => {
    const data = {
      chargeValue: 100,
      chargeCredit: false
    }

    it("returns a postive 'chargeValue'", async () => {
      const testPresenter = new CalculateChargePresrocPresenter(data)
      const result = testPresenter.go()

      expect(result.calculation.chargeValue).to.equal(100)
    })
  })
})
