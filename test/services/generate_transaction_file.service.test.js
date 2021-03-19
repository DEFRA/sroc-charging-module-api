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
  const filename = 'test.txt'
  const filenameWithPath = path.join(temporaryFilePath, filename)

  beforeEach(async () => {
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
      await GenerateTransactionFileService.go(filename)

      const file = fs.readFileSync(filenameWithPath, 'utf-8')

      expect(file).to.equal('Hello world!')
    })

    it('returns the filename and path', async () => {
      const returnedFilenameWithPath = await GenerateTransactionFileService.go(filename)

      expect(returnedFilenameWithPath).to.equal(filenameWithPath)
    })
  })

  describe('When writing a file fails', () => {
    before(async () => {
      Sinon
        .stub(GenerateTransactionFileService, '_writeToStream')
        .throws('TEST')
    })

    it('throws an error', async () => {
      const err = await expect(GenerateTransactionFileService.go(filename)).to.reject()

      expect(err).to.be.an.error()
      expect(err.message).to.equal('TEST')
    })
  })
})
