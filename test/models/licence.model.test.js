// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  InvoiceHelper,
  LicenceHelper
} = require('../support/helpers')

// Thing under test
const { LicenceModel } = require('../../app/models')

describe('Licence Model', () => {
  describe('the updateTally() class method', () => {
    let billRun
    let invoice
    const transaction = {
      lineAttr1: 'LICENCENO',
      chargeCredit: false,
      chargeValue: 100,
      subjectToMinimumCharge: false
    }

    beforeEach(async () => {
      await DatabaseHelper.clean()

      billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
      invoice = await InvoiceHelper.addInvoice(billRun.id, 'INV0000001', 2020, 0, 0, 1, 100)

      transaction.billRunId = billRun.id
      transaction.invoiceId = invoice.id
    })

    describe('when no licence exists', () => {
      it('creates a new licence record', async () => {
        const licenceId = await LicenceModel.updateTally(transaction)
        const newLicence = await LicenceModel.query().findById(licenceId)

        expect(newLicence.billRunId).to.equal(transaction.billRunId)
        expect(newLicence.invoiceId).to.equal(transaction.invoiceId)
        expect(newLicence.licenceNumber).to.equal(transaction.lineAttr1)
        expect(newLicence.debitLineCount).to.equal(1)
        expect(newLicence.debitLineValue).to.equal(transaction.chargeValue)
        expect(newLicence.subjectToMinimumChargeCount).to.equal(0)
      })
    })

    describe('when a licence already exists', () => {
      beforeEach(async () => {
        await LicenceHelper.addLicence(
          transaction.billRunId,
          transaction.lineAttr1,
          transaction.invoiceId,
          invoice.customerReference,
          invoice.financialYear,
          0,
          0,
          1,
          100
        )
      })

      it("updates the 'tally' fields for the matching licence", async () => {
        const licenceId = await LicenceModel.updateTally(transaction)
        const updatedLicence = await LicenceModel.query().findById(licenceId)

        expect(updatedLicence.billRunId).to.equal(transaction.billRunId)
        expect(updatedLicence.invoiceId).to.equal(transaction.invoiceId)
        expect(updatedLicence.licenceNumber).to.equal(transaction.lineAttr1)
        expect(updatedLicence.debitLineCount).to.equal(2)
        expect(updatedLicence.debitLineValue).to.equal(transaction.chargeValue * 2)
        expect(updatedLicence.subjectToMinimumChargeCount).to.equal(0)
      })
    })
  })

  describe('the $netTotal() method', () => {
    it("returns the result of 'debitLineValue' minus 'creditLineValue'", async () => {
      const instance = LicenceModel.fromJson({ debitLineValue: 10, creditLineValue: 5 })

      expect(instance.$netTotal()).to.equal(5)
    })
  })
})
