'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

const stream = require('stream')

// Test helpers
const BillRunHelper = require('../../support/helpers/bill_run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GeneralHelper = require('../../support/helpers/general.helper.js')
const StreamHelper = require('../../support/helpers/stream.helper.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')
const TransactionModel = require('../../../app/models/transaction.model.js')

// Thing under test
const StreamReadableRecordsService = require('../../../app/services/streams/stream_readable_records.service.js')

describe('Stream Readable Records service', () => {
  let billRun
  let transaction

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())

    transaction = await TransactionHelper.addTransaction(billRun.id)
  })

  describe('When a valid Objection query builder object specified', () => {
    it('returns a stream', async () => {
      const query = TransactionModel.query().select('*')

      const result = StreamReadableRecordsService.go(query)

      expect(result).to.be.an.instanceof(stream.Stream)
    })

    it('streams the correct data', async () => {
      const query = TransactionModel.query().select('*')

      const readableStream = StreamReadableRecordsService.go(query)
      // We use destructuring to pull the sole element of the array into result
      const [result] = await StreamHelper.testReadableStream(readableStream)

      expect(result.id).to.equal(transaction.id)
    })
  })

  describe('When a valid Knex query builder object specified', () => {
    it('returns a stream', async () => {
      const query = TransactionModel.knexQuery().select('*')

      const result = StreamReadableRecordsService.go(query)

      expect(result).to.be.an.instanceof(stream.Stream)
    })

    it('streams the correct data', async () => {
      const query = TransactionModel.knexQuery().select('*')

      const readableStream = StreamReadableRecordsService.go(query)
      const [result] = await StreamHelper.testReadableStream(readableStream)

      expect(result.id).to.equal(transaction.id)
    })
  })
})
