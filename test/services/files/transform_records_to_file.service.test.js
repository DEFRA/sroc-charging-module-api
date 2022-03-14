'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill_run.helper')
const DatabaseHelper = require('../../support/helpers/database.helper')
const GeneralHelper = require('../../support/helpers/general.helper')
const TransactionHelper = require('../../support/helpers/transaction.helper')

const { TransactionModel } = require('../../../app/models')

const fs = require('fs')
const path = require('path')

const { temporaryFilePath } = require('../../../config/server.config')

// Thing under test
const { TransformRecordsToFileService } = require('../../../app/services')

describe('Transform Records To File service', () => {
  let billRun
  let transaction
  let additionalData

  const filename = 'test.dat'

  // We use path.normalize to remove any double forward slashes that occur when assembling the path
  const filenameWithPath = path.normalize(path.format({ dir: temporaryFilePath, name: filename }))

  // Presenters used in the tests
  class headPresenter {
    constructor (data) {
      this.data = data
    }

    go () {
      return {
        col01: '---HEAD---',
        col02: this.data.headTest,
        col03: this.data.index
      }
    }
  }

  class bodyPresenter {
    constructor (data) {
      this.data = data
      this.row = 0
    }

    // Note the order, which ensures we also test that the order of items is sorted correctly as col01, col02, col03
    go () {
      return {
        col02: this.data.bodyTest,
        col01: this.data.id,
        col03: this.data.index
      }
    }
  }

  class tailPresenter {
    constructor (data) {
      this.data = data
    }

    go () {
      return {
        col01: '---TAIL---',
        col02: this.data.tailTest,
        col03: this.data.index
      }
    }
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    billRun.fileReference = filename

    additionalData = {
      headTest: 'HEAD_TEST',
      bodyTest: 'BODY_TEST',
      tailTest: 'TAIL_TEST'
    }

    transaction = await TransactionHelper.addTransaction(billRun.id)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When writing a file succeeds', () => {
    it('creates a file with expected content', async () => {
      const query = TransactionModel.query().select('*')

      await TransformRecordsToFileService.go(
        query,
        headPresenter,
        bodyPresenter,
        tailPresenter,
        filename,
        additionalData
      )

      const expectedResult = [
        '"---HEAD---","HEAD_TEST","0"\n',
        `"${transaction.id}","BODY_TEST","1"\n`,
        '"---TAIL---","TAIL_TEST","2"\n'
      ].join('')

      const file = fs.readFileSync(filenameWithPath, 'utf-8')

      expect(file).to.equal(expectedResult)
    })

    it('returns the filename and path', async () => {
      const query = TransactionModel.query().select('*')

      const returnedFilenameWithPath = await TransformRecordsToFileService.go(
        query,
        headPresenter,
        bodyPresenter,
        tailPresenter,
        filename,
        additionalData
      )

      expect(returnedFilenameWithPath).to.equal(filenameWithPath)
    })
  })
})
