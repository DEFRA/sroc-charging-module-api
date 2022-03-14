'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper')
const RegimeHelper = require('../../../support/helpers/regime.helper')

const CustomerFileModel = require('../../../../app/models/customer_file.model')
const CustomerModel = require('../../../../app/models/customer.model')

const { CreateCustomerDetailsService } = require('../../../../app/services')
const { MoveCustomerDetailsToExportedTableService } = require('../../../../app/services')

// Things we need to stub
const { DeleteFileService } = require('../../../../app/services')
const { GenerateCustomerFileService } = require('../../../../app/services')
const { NextCustomerFileReferenceService } = require('../../../../app/services')
const { PrepareCustomerFileService } = require('../../../../app/services')
const { SendFileToS3Service } = require('../../../../app/services')

// Thing under test
const { SendCustomerFileService } = require('../../../../app/services')

describe('Send Customer File service', () => {
  let regime
  let notifierFake

  const payload = {
    customerName: 'CUSTOMER_NAME',
    addressLine1: 'ADDRESS_LINE_1',
    addressLine2: 'ADDRESS_LINE_2',
    addressLine3: 'ADDRESS_LINE_3',
    addressLine4: 'ADDRESS_LINE_4',
    addressLine5: 'ADDRESS_LINE_5',
    addressLine6: 'ADDRESS_LINE_6',
    postcode: 'POSTCODE'
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')

    // Create fake functions to stand in place of Notifier.omg() and Notifier.omfg()
    notifierFake = { omg: Sinon.fake(), omfg: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When the service is called', () => {
    let deleteStub
    let generateStub
    let sendStub
    let moveStub

    beforeEach(async () => {
      await CreateCustomerDetailsService.go({ ...payload, region: 'A', customerReference: 'AA12345678' }, regime)
      await CreateCustomerDetailsService.go({ ...payload, region: 'W', customerReference: 'WA87654321' }, regime)

      deleteStub = Sinon.stub(DeleteFileService, 'go')
      generateStub = Sinon.stub(GenerateCustomerFileService, 'go').callsFake(file => `${file.fileReference}.dat`)
      sendStub = Sinon.stub(SendFileToS3Service, 'go')
      moveStub = Sinon.stub(MoveCustomerDetailsToExportedTableService, 'go')
      Sinon.stub(NextCustomerFileReferenceService, 'go').callsFake((_, region) => `nal${region.toLowerCase()}c50001`)
    })

    describe('and a single region is specified', () => {
      describe('and a customer file is required', () => {
        beforeEach(async () => {
          await SendCustomerFileService.go(regime, ['A'], notifierFake)
        })

        it('generates a customer file', async () => {
          const [customerFile] = generateStub.getCall(0).args

          expect(generateStub.calledOnce).to.be.true()
          expect(customerFile).to.be.an.instanceOf(CustomerFileModel)
          expect(customerFile.region).to.equal('A')
        })

        it('sends the customer file', async () => {
          expect(sendStub.calledOnce).to.be.true()
          expect(sendStub.getCall(0).firstArg).to.equal('nalac50001.dat')
          expect(sendStub.getCall(0).args[1]).to.equal(`export/${regime.slug}/customer/nalac50001.dat`)
        })

        it('moves the customers to the exported customers table', async () => {
          const customerFile = await CustomerFileModel.query().first()

          const { args } = moveStub.getCall(0)
          expect(moveStub.calledOnce).to.be.true()
          expect(args[0].id).to.equal(regime.id)
          expect(args[1]).to.equal('A')
          expect(args[2]).to.equal(customerFile.id)
        })

        it('deletes the file', async () => {
          expect(deleteStub.calledOnce).to.equal(true)
        })

        describe("on the matching 'customer_files' record", () => {
          it("sets its status to 'exported' after exporting", async () => {
            const customerFile = await CustomerFileModel.query().first()

            expect(customerFile.status).to.equal('exported')
          })

          it("sets its 'exportedDate' field after exporting", async () => {
            const customerFile = await CustomerFileModel.query().first()
            const exportedDate = new Date(customerFile.exportedAt)

            expect(exportedDate).to.be.a.date()
            expect(compareDateToNow(exportedDate)).to.be.true()
          })
        })
      })

      describe("and a customer file isn't required", () => {
        beforeEach(async () => {
          await SendCustomerFileService.go(regime, ['X'], notifierFake)
        })

        it("doesn't try to generate a file", async () => {
          expect(generateStub.notCalled).to.be.true()
        })

        it("doesn't try to send the file", async () => {
          expect(sendStub.notCalled).to.be.true()
        })
      })
    })

    describe('and multiple regions are specified', () => {
      describe('and a customer file is required for each region', () => {
        beforeEach(async () => {
          await SendCustomerFileService.go(regime, ['A', 'W'], notifierFake)
        })

        it('generates a customer file', async () => {
          expect(generateStub.calledTwice).to.be.true()
          expect(generateStub.getCall(0).args[0]).to.be.an.instanceOf(CustomerFileModel)
          expect(generateStub.getCall(0).args[0].region).to.equal('A')
          expect(generateStub.getCall(1).args[0]).to.be.an.instanceOf(CustomerFileModel)
          expect(generateStub.getCall(1).args[0].region).to.equal('W')
        })

        it('sends the customer file', async () => {
          expect(sendStub.calledTwice).to.be.true()
          expect(sendStub.getCall(0).args[0]).to.equal('nalac50001.dat')
          expect(sendStub.getCall(0).args[1]).to.equal(`export/${regime.slug}/customer/nalac50001.dat`)
          expect(sendStub.getCall(1).args[0]).to.equal('nalwc50001.dat')
          expect(sendStub.getCall(1).args[1]).to.equal(`export/${regime.slug}/customer/nalwc50001.dat`)
        })

        it('moves the customers to the exported customers table', async () => {
          const customerFiles = await CustomerFileModel.query()

          const { args: firstArgs } = moveStub.getCall(0)
          const { args: secondArgs } = moveStub.getCall(1)
          expect(moveStub.calledTwice).to.be.true()
          expect(firstArgs[0].id).to.equal(regime.id)
          expect(firstArgs[1]).to.equal('A')
          expect(firstArgs[2]).to.equal(customerFiles[0].id)
          expect(secondArgs[0].id).to.equal(regime.id)
          expect(secondArgs[1]).to.equal('W')
          expect(secondArgs[2]).to.equal(customerFiles[1].id)
        })

        it('deletes the file', async () => {
          expect(deleteStub.calledTwice).to.equal(true)
        })

        describe("on the matching 'customer_files' records", () => {
          it("sets their status to 'exported' after exporting", async () => {
            const customerFiles = await CustomerFileModel.query()

            expect(customerFiles[0].status).to.equal('exported')
            expect(customerFiles[1].status).to.equal('exported')
          })

          it("sets their 'exportedDate' field after exporting", async () => {
            const customerFiles = await CustomerFileModel.query()
            const exportedDates = customerFiles.map(file => new Date(file.exportedAt))

            for (const date of exportedDates) {
              expect(date).to.be.a.date()
              expect(compareDateToNow(date)).to.be.true()
            }
          })
        })
      })

      describe('and a customer file is only required for some regions', () => {
        beforeEach(async () => {
          await SendCustomerFileService.go(regime, ['A', 'B', 'W'], notifierFake)
        })

        it('generates all required customer files', async () => {
          expect(generateStub.calledTwice).to.be.true()
          expect(generateStub.getCall(0).args[0]).to.be.an.instanceOf(CustomerFileModel)
          expect(generateStub.getCall(0).args[0].region).to.equal('A')
          expect(generateStub.getCall(1).args[0]).to.be.an.instanceOf(CustomerFileModel)
          expect(generateStub.getCall(1).args[0].region).to.equal('W')
        })

        it('sends all required customer files', async () => {
          expect(sendStub.calledTwice).to.be.true()
          expect(sendStub.getCall(0).args[0]).to.equal('nalac50001.dat')
          expect(sendStub.getCall(0).args[1]).to.equal(`export/${regime.slug}/customer/nalac50001.dat`)
          expect(sendStub.getCall(1).args[0]).to.equal('nalwc50001.dat')
          expect(sendStub.getCall(1).args[1]).to.equal(`export/${regime.slug}/customer/nalwc50001.dat`)
        })

        it('moves the customers to the exported customers table', async () => {
          const customerFiles = await CustomerFileModel.query()

          const { args: firstArgs } = moveStub.getCall(0)
          const { args: secondArgs } = moveStub.getCall(1)
          expect(moveStub.calledTwice).to.be.true()
          expect(firstArgs[0].id).to.equal(regime.id)
          expect(firstArgs[1]).to.equal('A')
          expect(firstArgs[2]).to.equal(customerFiles[0].id)
          expect(secondArgs[0].id).to.equal(regime.id)
          expect(secondArgs[1]).to.equal('W')
          expect(secondArgs[2]).to.equal(customerFiles[1].id)
        })

        it('deletes the file', async () => {
          expect(deleteStub.calledTwice).to.equal(true)
        })

        describe("on the matching 'customer_files' records", () => {
          it("sets their status to 'exported' after exporting", async () => {
            const customerFiles = await CustomerFileModel.query()

            expect(customerFiles[0].status).to.equal('exported')
            expect(customerFiles[1].status).to.equal('exported')
          })

          it("sets their 'exportedDate' field after exporting", async () => {
            const customerFiles = await CustomerFileModel.query()
            const exportedDates = customerFiles.map(file => new Date(file.exportedAt))

            for (const date of exportedDates) {
              expect(date).to.be.a.date()
              expect(compareDateToNow(date)).to.be.true()
            }
          })
        })
      })

      describe("and a customer file isn't required for any region", () => {
        beforeEach(async () => {
          await SendCustomerFileService.go(regime, ['X', 'Y'], notifierFake)
        })

        it("doesn't try to generate a file", async () => {
          expect(generateStub.notCalled).to.be.true()
        })

        it("doesn't try to send a file", async () => {
          expect(sendStub.notCalled).to.be.true()
        })
      })
    })

    describe("and a 'stuck' customer change exists", () => {
      describe('and a customer file is required', () => {
        let stuckCustomerFile

        beforeEach(async () => {
          stuckCustomerFile = await CustomerFileModel.query().insert({
            regimeId: regime.id,
            region: 'A',
            fileReference: 'STUCK'
          })

          const stuckCustomer = await CreateCustomerDetailsService.go({
            ...payload,
            region: 'A',
            customerReference: 'STUCK'
          }, regime)

          await stuckCustomer.$query().patch({ customerFileId: stuckCustomerFile.id })

          await SendCustomerFileService.go(regime, ['A'], notifierFake)
        })

        it("doesn't change its customer file id", async () => {
          const result = await CustomerModel.query().where('customerReference', 'STUCK').first()

          expect(result.customerFileId).to.equal(stuckCustomerFile.id)
        })
      })
    })
  })

  describe('When an error occurs', () => {
    beforeEach(async () => {
      await CreateCustomerDetailsService.go({ ...payload, region: 'A', customerReference: 'AA12345678' }, regime)

      Sinon.stub(NextCustomerFileReferenceService, 'go').callsFake((_, region) => `nal${region.toLowerCase()}c50001`)
    })

    describe('preparing the customer file and changes', () => {
      it('throws an error', async () => {
        Sinon.stub(PrepareCustomerFileService, 'go').throws()

        await SendCustomerFileService.go(regime, ['A'], notifierFake)

        expect(notifierFake.omfg.callCount).to.equal(1)
        expect(notifierFake.omfg.firstArg).to.equal(`Error preparing customer file for ${regime.slug} A`)
      })
    })

    describe('during the generate file and send to S3 process', () => {
      it('throws an error', async () => {
        Sinon.stub(GenerateCustomerFileService, 'go').throws()

        await SendCustomerFileService.go(regime, ['A'], notifierFake)

        expect(notifierFake.omfg.callCount).to.equal(1)
        expect(notifierFake.omfg.firstArg).to.equal(`Error sending customer file for ${regime.slug} A`)
      })
    })
  })

  /**
   * Compares a date/time object to the current date/time and returns true if they are within a second of each other.
   */
  function compareDateToNow (date) {
    return new Date() - date.getTime() < 1000
  }
})
