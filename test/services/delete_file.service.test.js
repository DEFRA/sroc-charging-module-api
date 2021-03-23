'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const mockFs = require('mock-fs')

const fs = require('fs')
const path = require('path')

// Thing under test
const { DeleteFileService } = require('../../app/services')

describe('Delete File service', () => {
  let filenameWithPath

  beforeEach(() => {
    filenameWithPath = path.join('testFolder', 'testFile')

    mockFs({
      testFolder: {
        testFile: 'test content'
      }
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  describe('When a valid file is specified', () => {
    it('deletes the file', async () => {
      await DeleteFileService.go(filenameWithPath)

      const fileExists = fs.existsSync(filenameWithPath)
      expect(fileExists).to.be.false()
    })
  })

  describe('When an error occurs', () => {
    it('throws an error', async () => {
      const fakeFile = 'FAKE_FILE'

      const err = await expect(DeleteFileService.go(fakeFile)).to.reject()

      expect(err).to.be.an.error()
      expect(err.message).to.equal(`ENOENT: no such file or directory, unlink '${fakeFile}'`)
    })
  })
})
