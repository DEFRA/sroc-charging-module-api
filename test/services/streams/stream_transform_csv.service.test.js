'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const stream = require('stream')

// Test helpers
const { StreamHelper } = require('../../support/helpers')

// Things we need to stub
const { ConvertToCSVService } = require('../../../app/services')

// Thing under test
const { StreamTransformCSVService } = require('../../../app/services')

describe('Stream Transform CSV service', () => {
  let csvStub

  beforeEach(() => {
    csvStub = Sinon.stub(ConvertToCSVService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When data is passed to it', () => {
    it('returns a stream', async () => {
      const result = StreamTransformCSVService.go()

      expect(result).to.be.an.instanceof(stream.Stream)
    })

    it('passes data to ConvertToCSVService', async () => {
      const testData = ['test', 'data']

      const transformStream = StreamTransformCSVService.go()
      await StreamHelper.testTransformStream(transformStream, testData)

      expect(csvStub.calledOnce).to.be.true()
      expect(csvStub.firstCall.firstArg).to.equal(testData)
    })
  })
})
