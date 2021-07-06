// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import TransactionHelper from '../support/helpers/transaction.helper.js'

// Additional dependencies needed
import fs from 'fs'
import path from 'path'
import ServerConfig from '../../config/server.config.js'
import TransactionModel from '../../app/models/transaction.model.js'

// Thing under test
import TransformRecordsToFileService from '../../app/services/transform_records_to_file.service.js'

// Test framework setup
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Transform Records To File service', () => {
  let billRun
  let transaction
  let additionalData

  const filename = 'test.dat'

  // We use path.normalize to remove any double forward slashes that occur when assembling the path
  const filenameWithPath = path.normalize(path.format({ dir: ServerConfig.temporaryFilePath, name: filename }))

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
