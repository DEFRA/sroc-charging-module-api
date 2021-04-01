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

const { temporaryFilePath } = require('../../config/server.config')

const { CreateCustomerDetailsService } = require('../../app/services')

// Thing under test
const { GenerateCustomerFileService } = require('../../app/services')

describe('Generate Customer File service', () => {
  const filename = 'test.txt'
  const filenameWithPath = path.join(temporaryFilePath, filename)

  let customer
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
    customer = await CreateCustomerDetailsService.go(payload, regime)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  it('creates a file with the correct content', async () => {
    const returnedFilenameWithPath = await GenerateCustomerFileService.go(payload.region, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const expectedContent = _expectedContent()

    expect(file).to.equal(expectedContent)
  })

  it('returns the filename and path', async () => {
    const returnedFilenameWithPath = await GenerateCustomerFileService.go(payload.region, filename)

    expect(returnedFilenameWithPath).to.equal(filenameWithPath)
  })

  function _expectedContent () {
    const head = ['"additionalData"'].join(',').concat('\n')
    const body = [`"${customer.id}"`, `"${payload.customerReference}"`].join(',').concat('\n')
    const tail = ['"additionalData"'].join(',').concat('\n')

    return head.concat(body).concat(tail)
  }
})
