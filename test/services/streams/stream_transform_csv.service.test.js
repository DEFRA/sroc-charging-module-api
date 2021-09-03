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

describe.only('Stream Transform CSV service', () => {
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

    it('correctly formats objects', async () => {
      const testData = ['{"__DecisionID__":"52c1088f-41b7-4f26-a7db-cab9792dc1cb0","WRLSChargingResponse":{"chargeValue":215.28,"decisionPoints":{"sourceFactor":9,"seasonFactor":14.4,"lossFactor":14.4,"volumeFactor":1,"abatementAdjustment":215.28,"s127Agreement":215.28,"s130Agreement":215.28,"secondPartCharge":false,"waterUndertaker":false,"eiucFactor":0,"compensationCharge":false,"eiucSourceFactor":0,"sucFactor":215.28},"messages":[],"sucFactor":14.95,"volumeFactor":1,"sourceFactor":9,"seasonFactor":1.6,"lossFactor":1,"abatementAdjustment":"S126 x 1.0","s127Agreement":null,"s130Agreement":null,"eiucSourceFactor":0,"eiucFactor":0}}']

      const transformStream = StreamTransformCSVService.go()
      const [result] = await StreamHelper.testTransformStream(transformStream, testData)

      expect(result).to.equal('"{""__DecisionID__"":""52c1088f-41b7-4f26-a7db-cab9792dc1cb0"",""WRLSChargingResponse"":{""chargeValue"":215.28,""decisionPoints"":{""sourceFactor"":9,""seasonFactor"":14.4,""lossFactor"":14.4,""volumeFactor"":1,""abatementAdjustment"":215.28,""s127Agreement"":215.28,""s130Agreement"":215.28,""secondPartCharge"":false,""waterUndertaker"":false,""eiucFactor"":0,""compensationCharge"":false,""eiucSourceFactor"":0,""sucFactor"":215.28},""messages"":[],""sucFactor"":14.95,""volumeFactor"":1,""sourceFactor"":9,""seasonFactor"":1.6,""lossFactor"":1,""abatementAdjustment"":""S126 x 1.0"",""s127Agreement"":null,""s130Agreement"":null,""eiucSourceFactor"":0,""eiucFactor"":0}}"\n')
    })

    it('correctly handles strings with quotes', async () => {
      const testData = ['Some "Quotes" Here']

      const transformStream = StreamTransformCSVService.go()
      const [result] = await StreamHelper.testTransformStream(transformStream, testData)

      expect(result).to.equal('"Some ""Quotes"" Here"\n')
    })
  })
})
