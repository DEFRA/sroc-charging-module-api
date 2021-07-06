// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunGenerator from '../support/generators/bill_run.generator.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Additional dependencies needed
import BillRunModel from '../../app/models/bill_run.model.js'
import { DataError } from 'objection'
import InvoiceModel from '../../app/models/invoice.model.js'
import LicenceModel from '../../app/models/licence.model.js'
import TransactionModel from '../../app/models/transaction.model.js'

// Thing under test
import ShowTransactionService from '../../app/services/show_transaction.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Show Transaction service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there is a matching transaction', () => {
    let initialBillRun
    let creditTransaction
    let debitTransaction

    beforeEach(async () => {
      const regime = await RegimeHelper.addRegime('wrls', 'Water Resources')
      const authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system', [regime])
      initialBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

      const payload = {
        region: 'A',
        mix: [
          { type: 'mixed-credit', count: 1 }
        ]
      }
      await BillRunGenerator.go(payload, initialBillRun, authorisedSystem, regime)

      const { transactions } = await BillRunModel.query()
        .findById(initialBillRun.id)
        .withGraphFetched('transactions')

      creditTransaction = transactions.find(transaction => transaction.chargeCredit)
      debitTransaction = transactions.find(transaction => !transaction.chargeCredit)
    })

    it('returns a transaction', async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      expect(result instanceof TransactionModel).to.equal(true)
      expect(result.id).to.equal(creditTransaction.id)
    })

    it("returns a result that includes the related 'bill run'", async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      const billRun = await BillRunModel.query().findById(creditTransaction.billRunId)

      expect(result.billRun).to.equal(billRun)
    })

    it("returns a result that includes the related 'invoice'", async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      const invoice = await InvoiceModel.query().findById(creditTransaction.invoiceId)

      expect(result.invoice).to.equal({ ...invoice, transactionType: invoice.$transactionType() })
    })

    it("returns a result that includes the related 'licence'", async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      const licence = await LicenceModel.query().findById(creditTransaction.licenceId)

      expect(result.licence).to.equal(licence)
    })

    it('returns a positive signedChargeValue if the transaction is a debit', async () => {
      const result = await ShowTransactionService.go(debitTransaction.id)

      expect(Math.sign(result.signedChargeValue)).to.equal(1)
    })

    it('returns a negative signedChargeValue if the transaction is a credit', async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      expect(Math.sign(result.signedChargeValue)).to.equal(-1)
    })

    it("returns the 'transactionType' for the invoice", async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      expect(result.invoice.transactionType).to.equal('C')
    })
  })

  describe('When there is no matching transaction', () => {
    it('throws an error', async () => {
      const id = GeneralHelper.uuid4()
      const err = await expect(ShowTransactionService.go(id)).to.reject(Error, `No transaction found with id ${id}`)

      expect(err).to.be.an.error()
    })
  })

  describe('When an invalid UUID is used', () => {
    it('throws an error', async () => {
      const err = await expect(ShowTransactionService.go('123456789')).to.reject(DataError)

      expect(err).to.be.an.error()
    })
  })
})
