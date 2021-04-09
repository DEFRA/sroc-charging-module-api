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
const { DatabaseHelper, RegimeHelper } = require('../support/helpers')

const { BasePresenter } = require('../../app/presenters')

const { temporaryFilePath } = require('../../config/server.config')

const { CreateCustomerDetailsService } = require('../../app/services')

// Thing under test
const { GenerateCustomerFileService } = require('../../app/services')

describe('Generate Customer File service', () => {
  const fileReference = 'nalwc50003'
  const filename = fileReference.concat('.dat')
  const filenameWithPath = path.join(temporaryFilePath, filename)

  let regime

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
    await CreateCustomerDetailsService.go(payload, regime)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  it('creates a file with the correct content', async () => {
    const returnedFilenameWithPath = await GenerateCustomerFileService.go(
      regime.id,
      payload.region,
      filename,
      fileReference
    )

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const expectedContent = _expectedContent()

    expect(file).to.equal(expectedContent)
  })

  it('returns the filename and path', async () => {
    const returnedFilenameWithPath = await GenerateCustomerFileService.go(
      regime.id,
      payload.region,
      filename,
      fileReference
    )

    expect(returnedFilenameWithPath).to.equal(filenameWithPath)
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
