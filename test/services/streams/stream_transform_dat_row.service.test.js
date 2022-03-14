'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const stream = require('stream')

// Test helpers
const StreamHelper = require('../../support/helpers/stream.helper.js')

// Thing under test
const StreamTransformDatRowService = require('../../../app/services/streams/stream_transform_dat_row.service.js')

describe('Stream Transform Dat Row service', () => {
  describe('When data is passed to it', () => {
    it('returns a stream', async () => {
      const result = StreamTransformDatRowService.go()

      expect(result).to.be.an.instanceof(stream.Stream)
    })

    it('streams the correct data', async () => {
      const testData = ['first', 2, false]

      const transformStream = StreamTransformDatRowService.go()
      // We use destructuring to pull the sole element of the array into result
      const [result] = await StreamHelper.testTransformStream(transformStream, testData)

      expect(result).to.equal('"first","2","false"\n')
    })
  })
})
