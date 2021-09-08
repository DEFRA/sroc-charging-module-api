'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const stream = require('stream')
const fs = require('fs')
const path = require('path')

// Test helpers
const { StreamHelper } = require('../../support/helpers')
const mockFs = require('mock-fs')

// Thing under test
const { StreamWritableFileService } = require('../../../app/services')

describe('Stream Writable File service', () => {
  let filenameWithPath

  beforeEach(async () => {
    // Create mock in-memory file system to avoid temp files being dropped in our filesystem
    filenameWithPath = path.join('testFolder', 'testFile')

    mockFs({
      testFolder: {
        testFile: 'test content'
      }
    })
  })

  afterEach(async () => {
    mockFs.restore()
  })

  describe('When a filename is specified', () => {
    it('returns a stream', async () => {
      const result = StreamWritableFileService.go(filenameWithPath)

      expect(result).to.be.an.instanceof(stream.Stream)
    })

    it('writes the correct data to the file', async () => {
      const testData = 'TEST_DATA'

      const writableStream = StreamWritableFileService.go(filenameWithPath)
      await StreamHelper.testWritableStream(writableStream, testData)

      const file = fs.readFileSync(filenameWithPath, 'utf-8')
      expect(file).to.equal(testData)
    })

    it('overwrites the file if `append` is not specified', async () => {
      const testData = 'TEST_DATA'

      // Note that we instantiate two streams and don't re-use the first as this reflects how we would use the stream,
      // ie. instantiating it each time we wish to write data to a file.
      const firstStream = StreamWritableFileService.go(filenameWithPath)
      await StreamHelper.testWritableStream(firstStream, 'WRONG_DATA')
      const secondStream = StreamWritableFileService.go(filenameWithPath)
      await StreamHelper.testWritableStream(secondStream, testData)

      const file = fs.readFileSync(filenameWithPath, 'utf-8')
      expect(file).to.equal(testData)
    })

    it('appends data to the file if `append` is `true`', async () => {
      const testData = 'TEST_DATA'

      const firstStream = StreamWritableFileService.go(filenameWithPath, false)
      await StreamHelper.testWritableStream(firstStream, testData)
      const secondStream = StreamWritableFileService.go(filenameWithPath, true)
      await StreamHelper.testWritableStream(secondStream, testData)

      const file = fs.readFileSync(filenameWithPath, 'utf-8')
      expect(file).to.equal(`${testData}${testData}`)
    })
  })
})
