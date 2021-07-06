// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import mock from 'mock-fs'

// Additional dependencies needed
import fs from 'fs'
import path from 'path'

// Thing under test
import DeleteFileService from '../../app/services/delete_file.service.js'

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Delete File service', () => {
  let filenameWithPath

  beforeEach(() => {
    filenameWithPath = path.join('testFolder', 'testFile')

    mock({
      testFolder: {
        testFile: 'test content'
      }
    })
  })

  afterEach(() => {
    mock.restore()
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
