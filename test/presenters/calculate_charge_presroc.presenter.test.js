'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CalculateChargePresrocPresenter = require('../../app/presenters/calculate_charge_presroc.presenter.js')

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

  describe('when a section 130 factor is present', () => {
    const data = {
      lineAttr9: 'S130 x 0.5'
    }

    it('returns the factor value', async () => {
      const testPresenter = new CalculateChargePresrocPresenter(data)
      const result = testPresenter.go()

      expect(result.calculation.section130Factor).to.equal(0.5)
    })
  })

  describe('when a section 127 factor is present', () => {
    const data = {
      lineAttr10: 'S127 x 0.5'
    }

    it('returns the factor value', async () => {
      const testPresenter = new CalculateChargePresrocPresenter(data)
      const result = testPresenter.go()

      expect(result.calculation.section127Factor).to.equal(0.5)
    })
  })

  describe('when a section 126 factor is present', () => {
    // Note that section 126 and 127 factors share a field, which is why this test for section 126 checks the value of
    // `section127Factor`
    const data = {
      lineAttr10: 'S126 x 0.5'
    }

    it('returns `null` for the factor value', async () => {
      const testPresenter = new CalculateChargePresrocPresenter(data)
      const result = testPresenter.go()

      expect(result.calculation.section127Factor).to.equal(null)
    })
  })
})
