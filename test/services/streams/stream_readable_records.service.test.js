// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import BillRunHelper from '../../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../../support/helpers/database.helper.js'
import GeneralHelper from '../../support/helpers/general.helper.js'
import StreamHelper from '../../support/helpers/stream.helper.js'
import TransactionHelper from '../../support/helpers/transaction.helper.js'

// Additional dependencies needed
import stream from 'stream'
import TransactionModel from '../../../app/models/transaction.model.js'

// Thing under test
import StreamReadableRecordsService from '../../../app/services/streams/stream_readable_records.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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
