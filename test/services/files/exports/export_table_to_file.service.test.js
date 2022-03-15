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
const GeneralHelper = require('../../../support/helpers/general.helper.js')
const RegimeHelper = require('../../../support/helpers/regime.helper.js')

const { temporaryFilePath } = require('../../../../config/server.config.js')

const CreateCustomerDetailsService = require('../../../../app/services/create_customer_details.service.js')

const CustomerFileModel = require('../../../../app/models/customer_file.model.js')
const CustomerModel = require('../../../../app/models/customer.model.js')

// Thing under test
const ExportTableToFileService = require('../../../../app/services/files/exports/export_table_to_file.service.js')

describe('Export Table To File service', () => {
  const table = 'customers'
  const filename = table.concat('.csv')
  const filenameWithPath = path.join(temporaryFilePath, filename)

  let regime
  let customer
  let customerRecord

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
    customer = await CreateCustomerDetailsService.go(payload, regime)

    // We insert a customer file record so that customerFileId is set
    const { id: customerFileId } = await CustomerFileModel.query().insert({
      regimeId: regime.id,
      region: payload.region,
      fileReference: table
    })
    await customer.$query().patch({ customerFileId })

    // We separately pull out the customer record so we can compare the exported file against the exact db contents
    customerRecord = await CustomerModel.query().findById(customer.id)

    // Date fields are converted when exporting to a different format so update the record to the expected format
    customerRecord.createdAt = GeneralHelper.formatDate(customerRecord.createdAt)
    customerRecord.updatedAt = GeneralHelper.formatDate(customerRecord.updatedAt)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  it('creates a file with the correct content', async () => {
    const returnedFilenameWithPath = await ExportTableToFileService.go(table)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const expectedContent = _expectedContent()

    expect(file).to.equal(expectedContent)
  })

  it('returns the filename and path', async () => {
    const returnedFilenameWithPath = await ExportTableToFileService.go('customers')

    expect(returnedFilenameWithPath).to.equal(filenameWithPath)
  })

  function _expectedContent () {
    // The head line of the file is comprised of the customerRecord object keys in CSV form
    const head = _contentLine(Object.keys(customerRecord))

    // The body line of the file is comprised of the customerRecord object values in CSV form
    const body = _contentLine(Object.values(customerRecord))

    return head.concat(body)
  }

  function _contentLine (contentArray) {
    return contentArray.map(item => `"${item}"`)
      .join(',')
      .concat('\n')
  }
})
