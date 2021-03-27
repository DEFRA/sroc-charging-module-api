'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const stream = require('stream')

// Test helpers
const { StreamHelper } = require('../../support/helpers')

// Thing under test
const { StreamReadableDataService } = require('../../../app/services')

describe('Stream Readable Data service', () => {
  describe('When data is passed to it', () => {
    it('returns a stream', async () => {
      const testData = 'TEST'

      const result = StreamReadableDataService.go(testData)

      expect(result).to.be.an.instanceof(stream.Stream)
    })

    it('streams the correct data', async () => {
      const testData = 'TEST'

      const readableStream = StreamReadableDataService.go(testData)
      // We use destructuring to pull the sole element of the array into result
      const [result] = await StreamHelper.testReadableStream(readableStream)

      expect(result).to.equal(testData)
    })
  })
})
