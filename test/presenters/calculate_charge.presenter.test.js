// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Thing under test
import CalculateChargePresenter from '../../app/presenters/calculate_charge.presenter.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Charge presenter', () => {
  describe("when the request was marked as a 'credit'", () => {
    const data = {
      chargeValue: 100,
      chargeCredit: true
    }

    it("returns a negative 'chargeValue'", async () => {
      const testPresenter = new CalculateChargePresenter(data)
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
      const testPresenter = new CalculateChargePresenter(data)
      const result = testPresenter.go()

      expect(result.calculation.chargeValue).to.equal(100)
    })
  })
})
