// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'
import TransactionHelper from '../support/helpers/transaction.helper.js'

// Additional dependencies needed
import TransactionModel from '../../app/models/transaction.model.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Handling BigInts', () => {
  let authorisedSystem
  let regime
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
  })

  describe('Transactions', () => {
    let transaction

    beforeEach(async () => {
      transaction = await TransactionHelper.addTransaction(billRun.id, { regimeId: regime.id, chargeValue: 2547483647 })
    })

    describe('When a transaction is added', () => {
      it('handles a charge value greater than 2147483647', async () => {
        expect(transaction.id).to.exist()
      })
    })

    describe('When a transaction is selected', () => {
      it('the charge value is returned as an integer', async () => {
        const selectedTransaction = await TransactionModel.query().findById(transaction.id)

        expect(selectedTransaction.id).to.equal(transaction.id)
        expect(selectedTransaction.chargeValue).to.be.a.number()
        expect(selectedTransaction.chargeValue).to.equal(2547483647)
      })
    })
  })
})
