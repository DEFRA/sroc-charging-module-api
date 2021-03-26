'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const stream = require('stream')

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  TransactionHelper
} = require('../../support/helpers')

const { TransactionModel } = require('../../../app/models')

// Thing under test
const { StreamReadableRecordsService } = require('../../../app/services')

describe.only('Stream Readable Records service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())

    await TransactionHelper.addTransaction(billRun.id)
  })

  afterEach(() => {
  })

  describe('When a valid query builder object specified', () => {
    it('returns a stream', async () => {
      const query = TransactionModel.query().select('*')

      const result = await StreamReadableRecordsService.go(query)

      expect(result).to.be.an.instanceof(stream.Stream)
    })
  })
})
