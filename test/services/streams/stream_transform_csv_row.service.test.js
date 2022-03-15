'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const stream = require('stream')

// Test helpers
const StreamHelper = require('../../support/helpers/stream.helper.js')

// Things we need to stub
const ConvertToCSVService = require('../../../app/services/convert_to_csv.service.js')

// Thing under test
const StreamTransformCSVRowService = require('../../../app/services/streams/stream_transform_csv_row.service.js')

describe('Stream Transform CSV Row service', () => {
  let csvStub

  beforeEach(() => {
    csvStub = Sinon.stub(ConvertToCSVService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When data is passed to it', () => {
    it('returns a stream', async () => {
      const result = StreamTransformCSVRowService.go()

      expect(result).to.be.an.instanceof(stream.Stream)
    })

    it('passes data to ConvertToCSVService', async () => {
      const testData = ['test', 'data']

      const transformStream = StreamTransformCSVRowService.go()
      await StreamHelper.testTransformStream(transformStream, testData)

      expect(csvStub.calledOnce).to.be.true()
      expect(csvStub.firstCall.firstArg).to.equal(testData)
    })
  })
})
