'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, before, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

const mockFs = require('mock-fs')

const fs = require('fs')
const path = require('path')

const { temporaryFilePath } = require('../../config/server.config')

// Thing under test
const { GenerateTransactionFileService } = require('../../app/services')

describe('Generate Transaction File service', () => {
  let notifyFake

  const filename = 'test.txt'
  const filenameWithPath = path.join(temporaryFilePath, filename)

  beforeEach(async () => {
    // Create a fake function to stand in place of server.methods.notify
    notifyFake = Sinon.fake()

    // Create mock in-memory file system to avoid temp files being dropped in our filesystem
    mockFs({
      tmp: { }
    })
  })

  afterEach(async () => {
    Sinon.restore()
    mockFs.restore()
  })

  describe('When writing a file succeeds', () => {
    it('creates a file with expected content', async () => {
      await GenerateTransactionFileService.go(filename, notifyFake)

      const file = fs.readFileSync(filenameWithPath, 'utf-8')

      expect(file).to.equal('Hello world!')
    })

    it('returns the filename and path', async () => {
      const returnedFilenameWithPath = await GenerateTransactionFileService.go(filename, notifyFake)

      expect(returnedFilenameWithPath).to.equal(filenameWithPath)
    })
  })

  describe('When writing a file fails', () => {
    const error = new Error('TEST')

    before(async () => {
      Sinon
        .stub(GenerateTransactionFileService, '_writeToStream')
        .throws(error)
    })

    it('uses server.notify to log the error', async () => {
      const notifyData = {
        filename: filenameWithPath,
        error: error
      }

      await GenerateTransactionFileService.go(filename, notifyFake)

      expect(notifyFake.calledOnceWithExactly('Error writing file', notifyData)).to.equal(true)
    })
  })
})
