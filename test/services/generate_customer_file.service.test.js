// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import DatabaseHelper from '../support/helpers/database.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Things we need to stub

// Additional dependencies needed
import BasePresenter from '../../app/presenters/base.presenter.js'
import CreateCustomerDetailsService from '../../app/services/create_customer_details.service.js'
import CustomerFileModel from '../../app/models/customer_file.model.js'
import CustomerModel from '../../app/models/customer.model.js'
import fs from 'fs'
import path from 'path'
import ServerConfig from '../../config/server.config'

// Thing under test
import GenerateCustomerFileService from '../../app/services/generate_customer_file.service.js'

// Test framework setup
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Generate Customer File service', () => {
  const fileReference = 'nalwc50003'
  const filename = fileReference.concat('.dat')
  const filenameWithPath = path.join(ServerConfig.temporaryFilePath, filename)

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
