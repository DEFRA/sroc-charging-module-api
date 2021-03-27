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
const { StreamTransformCSVService } = require('../../../app/services')

describe('Stream Transform CSV service', () => {
  describe('When data is passed to it', () => {
    it('returns a stream', async () => {
      const result = StreamTransformCSVService.go()

      expect(result).to.be.an.instanceof(stream.Stream)
    })

    it('streams the correct data', async () => {
      const testData = ['first', '2', 'false']

      const transformStream = StreamTransformCSVService.go()
      // We use destructuring to pull the sole element of the array into result
      const [result] = await StreamHelper.testTransformStream(transformStream, testData)

      expect(result).to.equal('"first","2","false"\n')
    })
  })
})
