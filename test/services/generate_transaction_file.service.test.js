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
  const filename = 'test'

  // We use path.normalize to remove any double forward slashes that occur when assembling the path
  const filenameWithPath = path.normalize(
    path.format({
      dir: temporaryFilePath,
      name: filename,
      ext: '.dat'
    })
  )

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

      expect(file).to.equal('HELLO WORLD!')
    })

    it('returns the filename and path', async () => {
      const returnedFilenameWithPath = await GenerateTransactionFileService.go(filename)

      expect(returnedFilenameWithPath).to.equal(filenameWithPath)
    })
  })

  describe('When writing a file fails', () => {
    it('throws an error', async () => {
      const fakeFile = path.format({
        dir: 'FAKE_DIR',
        name: 'FAKE_FILE'
      })

      const err = await expect(GenerateTransactionFileService.go(fakeFile)).to.reject()

      expect(err).to.be.an.error()
      expect(err.message).to.include('ENOENT, no such file or directory')
    })
  })
})
