'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill_run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GeneralHelper = require('../../support/helpers/general.helper.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')

const TransactionModel = require('../../../app/models/transaction.model.js')

const fs = require('fs')
const path = require('path')

const { temporaryFilePath } = require('../../../config/server.config.js')

// Thing under test
const TransformTableToFileService = require('../../../app/services/files/transform_table_to_file.service.js')

describe('Transform Table To File service', () => {
  let billRun
  let transaction

  const filename = 'test.dat'

  // We use path.normalize to remove any double forward slashes that occur when assembling the path
  const filenameWithPath = path.normalize(path.format({ dir: temporaryFilePath, name: filename }))

  const columnNames = ['COL_A', 'COL_B', 'COL_C']

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    billRun.fileReference = filename

    transaction = await TransactionHelper.addTransaction(billRun.id)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When writing a file succeeds', () => {
    it('creates a file with expected content', async () => {
      const query = TransactionModel.query().select('id', 'region', 'customerReference')

      await TransformTableToFileService.go(
        query,
        columnNames,
        filename
      )

      const expectedResult = [
        '"COL_A","COL_B","COL_C"\n',
        `"${transaction.id}","${transaction.region}","${transaction.customerReference}"\n`
      ].join('')

      const file = await fs.readFileSync(filenameWithPath, 'utf-8')

      expect(file).to.equal(expectedResult)
    })

    it('returns the filename and path', async () => {
      const query = TransactionModel.query().select('id', 'region', 'customerReference')

      const returnedFilenameWithPath = await TransformTableToFileService.go(
        query,
        columnNames,
        filename
      )

      expect(returnedFilenameWithPath).to.equal(filenameWithPath)
    })
  })
})
