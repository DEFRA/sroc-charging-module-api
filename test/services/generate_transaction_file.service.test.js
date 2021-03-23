'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
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
    it('throws an error', async () => {
      const fakeFilenameWithPath = path.join('FAKE_DIR', filenameWithPath)

      const err = await expect(GenerateTransactionFileService.go(fakeFilenameWithPath)).to.reject()

      expect(err).to.be.an.error()
      // The service adds the temp file path to the filename we pass to it so this is the path we expect in the error
      const errorPath = path.join(temporaryFilePath, fakeFilenameWithPath)
      expect(err.message).to.equal(`ENOENT, no such file or directory '${errorPath}'`)
    })
  })
})
