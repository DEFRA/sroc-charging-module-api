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
const { StreamTransformUsingPresenterService } = require('../../../app/services')

describe('Stream Transform CSV service', () => {
  class testPresenter {
    constructor (data) {
      this.data = data
    }

    // We put the elements in the "wrong" sequence so we can test that the stream sorts them into the correct order
    go () {
      return {
        col02: this.data.element02,
        col01: this.data.element01,
        col03: this.data.element03,
        col04: this.data.additionalElement,
        col05: this.data.index
      }
    }
  }

  const testData = {
    element01: 'A',
    element02: 2,
    element03: true
  }

  describe('When data is passed to it', () => {
    it('returns a stream', async () => {
      const result = StreamTransformUsingPresenterService.go(testPresenter)

      expect(result).to.be.an.instanceof(stream.Stream)
    })

    it('streams the correct data', async () => {
      const transformStream = StreamTransformUsingPresenterService.go(testPresenter)
      // We use destructuring to pull the sole element of the array into result
      const [result] = await StreamHelper.testTransformStream(transformStream, testData)

      // Note this tests not just the content but the order of the array
      expect(result[0]).to.equal(testData.element01)
      expect(result[1]).to.equal(testData.element02)
      expect(result[2]).to.equal(testData.element03)
    })

    it('accepts additional data', async () => {
      const transformStream = StreamTransformUsingPresenterService.go(testPresenter, { additionalElement: 'EXTRA' })
      const [result] = await StreamHelper.testTransformStream(transformStream, testData)

      expect(result[3]).to.equal('EXTRA')
    })

    it('passes in the index starting at 0', async () => {
      const transformStream = StreamTransformUsingPresenterService.go(testPresenter)
      const [result] = await StreamHelper.testTransformStream(transformStream, testData)

      expect(result[4]).to.equal(0)
    })

    it('increments the index', async () => {
      const transformStream = StreamTransformUsingPresenterService.go(testPresenter)
      const resultArray = await StreamHelper.testTransformStream(transformStream, testData, 3)

      expect(resultArray[0][4]).to.equal(0)
      expect(resultArray[1][4]).to.equal(1)
      expect(resultArray[2][4]).to.equal(2)
    })

    it('accepts different index start numbers', async () => {
      const transformStream = StreamTransformUsingPresenterService.go(testPresenter, null, 10)
      const resultArray = await StreamHelper.testTransformStream(transformStream, testData, 3)

      expect(resultArray[0][4]).to.equal(10)
      expect(resultArray[1][4]).to.equal(11)
      expect(resultArray[2][4]).to.equal(12)
    })
  })
})
