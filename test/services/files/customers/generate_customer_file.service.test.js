'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

const fs = require('fs')
const path = require('path')

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const RegimeHelper = require('../../../support/helpers/regime.helper.js')

const BasePresenter = require('../../../../app/presenters/base.presenter.js')

const { temporaryFilePath } = require('../../../../config/server.config.js')

const CreateCustomerDetailsService = require('../../../../app/services/create_customer_details.service.js')

const CustomerFileModel = require('../../../../app/models/customer_file.model.js')
const CustomerModel = require('../../../../app/models/customer.model.js')

// Thing under test
const GenerateCustomerFileService = require('../../../../app/services/files/customers/generate_customer_file.service.js')

describe('Generate Customer File service', () => {
  const fileReference = 'nalwc50003'
  const filename = fileReference.concat('.dat')
  const filenameWithPath = path.join(temporaryFilePath, filename)

  let regime
  let customerFile

  const payload = {
    region: 'A',
    customerReference: 'AB12345678',
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
    const customer = await CreateCustomerDetailsService.go(payload, regime)

    customerFile = await CustomerFileModel.query().insert({
      regimeId: regime.id,
      region: payload.region,
      fileReference
    })

    // We need to set customer.customerFileId to ensure it is included in customerFile by GenerateCustomerFileService
    await customer.$query().patch({ customerFileId: customerFile.id })
  })

  afterEach(async () => {
    Sinon.restore()
  })

  it('creates a file with the correct content', async () => {
    const returnedFilenameWithPath = await GenerateCustomerFileService.go(customerFile)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const expectedContent = _expectedContent()

    expect(file).to.equal(expectedContent)
  })

  it('returns the filename and path', async () => {
    const returnedFilenameWithPath = await GenerateCustomerFileService.go(customerFile)

    expect(returnedFilenameWithPath).to.equal(filenameWithPath)
  })

  describe('when multiple customer details are present', () => {
    it('only includes customer changes intended for the customer file', async () => {
      // We add an additional customer change but don't set customerFileId for it
      await CreateCustomerDetailsService.go({ ...payload, customerReference: 'BB12345678' }, regime)

      const returnedFilenameWithPath = await GenerateCustomerFileService.go(customerFile)

      const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
      const expectedContent = _expectedContent()

      expect(file).to.equal(expectedContent)
    })

    it('creates a file sorted by customer reference', async () => {
      await CreateCustomerDetailsService.go({ ...payload, customerReference: 'CB12345678' }, regime)
      await CreateCustomerDetailsService.go({ ...payload, customerReference: 'BB12345678' }, regime)

      // Ensure customerFileId is set for all customer detils
      await CustomerModel.query().patch({ customerFileId: customerFile.id })

      const returnedFilenameWithPath = await GenerateCustomerFileService.go(customerFile)

      const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')

      const lines = file
      // Split the file into an array of lines
        .split('\n')
      // Each line is split into an array of items
        .map(line => line.split(','))
      // We filter out any lines which aren't data lines
        .filter(line => line[0] === '"D"')

      expect(lines[0][2]).to.equal('"AB12345678"')
      expect(lines[1][2]).to.equal('"BB12345678"')
      expect(lines[2][2]).to.equal('"CB12345678"')
    })
  })

  function _expectedContent () {
    // Get today's date using new Date() and convert it to the format we expect using BaseBresenter._formatDate()
    const presenter = new BasePresenter()
    const date = presenter._formatDate(new Date())

    const head = _contentLine([
      'H',
      '0000000',
      'NAL',
      payload.region,
      'C',
      '50003',
      date
    ])

    const body = _contentLine([
      'D',
      '0000001',
      payload.customerReference,
      payload.customerName,
      payload.addressLine1,
      payload.addressLine2,
      payload.addressLine3,
      payload.addressLine4,
      payload.addressLine5,
      payload.addressLine6,
      payload.postcode
    ])

    const tail = _contentLine([
      'T',
      '0000002',
      '3'
    ])

    return head.concat(body).concat(tail)
  }

  function _contentLine (contentArray) {
    return contentArray.map(item => `"${item}"`)
      .join(',')
      .concat('\n')
  }
})
