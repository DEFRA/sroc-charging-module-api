// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import InvoiceHelper from '../support/helpers/invoice.helper.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Thing under test
import ValidateBillRunLicenceService from '../../app/services/validate_bill_run_licence.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Validate Bill Run Licence service', () => {
  let regime
  let authorisedSystem
  let billRun
  let invoice
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER REFERENCE', 2020)
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.addLicence(billRun.id, 'LICENCE', invoice.id)
    })

    describe('and a valid licence ID', () => {
      it('returns `true`', async () => {
        const result = await ValidateBillRunLicenceService.go(billRun.id, licence)

        expect(result).to.be.true()
      })
    })

    describe('and an invalid licence ID', () => {
      describe('because it is not linked to the bill run', () => {
        let otherBillRun

        beforeEach(async () => {
          otherBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
        })

        it('throws an error', async () => {
          const err = await expect(ValidateBillRunLicenceService.go(otherBillRun.id, licence)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Licence ${licence.id} is not linked to bill run ${otherBillRun.id}.`
          )
        })
      })

      describe('because it belongs to a rebilling invoice', () => {
        let rebillingLicence

        beforeEach(async () => {
          invoice = await InvoiceHelper.addInvoice(
            billRun.id, 'CUSTOMER REFERENCE', 2021, 0, 0, 1, 5000, 0, 1, 0, 5000, GeneralHelper.uuid4(), 'R'
          )
          rebillingLicence = await LicenceHelper.addLicence(billRun.id, 'LICENCE', invoice.id)
        })

        it('throws an error', async () => {
          const err = await expect(ValidateBillRunLicenceService.go(billRun.id, rebillingLicence)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Invoice ${invoice.id} was created as part of a rebilling request.`
          )
        })
      })
    })
  })
})
