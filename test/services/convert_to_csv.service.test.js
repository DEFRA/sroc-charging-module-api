'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ConvertToCSVService = require('../../app/services/convert_to_csv.service')

describe('Convert To CSV service', () => {
  describe('When data is passed to it', () => {
    it('correctly formats strings', async () => {
      const testData = ['one', 'two', 'three']

      const result = ConvertToCSVService.go(testData)

      expect(result).to.equal('"one","two","three"\n')
    })

    it('correctly formats empty strings', async () => {
      const testData = ['not empty', '', 'not empty']

      const result = ConvertToCSVService.go(testData)

      expect(result).to.equal('"not empty",,"not empty"\n')
    })

    it('correctly formats numbers', async () => {
      const testData = [1, 2, 3]

      const result = ConvertToCSVService.go(testData)

      expect(result).to.equal('1,2,3\n')
    })

    it('correctly formats booleans', async () => {
      const testData = [true, false]

      const result = ConvertToCSVService.go(testData)

      expect(result).to.equal('true,false\n')
    })

    it('correctly formats null', async () => {
      const testData = ['not null', null, 'not null']

      const result = ConvertToCSVService.go(testData)

      expect(result).to.equal('"not null",,"not null"\n')
    })

    it('correctly formats objects', async () => {
      const testData = [{ __DecisionID__: '52c1088f-41b7-4f26-a7db-cab9792dc1cb0', WRLSChargingResponse: { chargeValue: 215.28, decisionPoints: { sourceFactor: 9, seasonFactor: 14.4, lossFactor: 14.4, volumeFactor: 1, abatementAdjustment: 215.28, s127Agreement: 215.28, s130Agreement: 215.28, secondPartCharge: false, waterUndertaker: false, eiucFactor: 0, compensationCharge: false, eiucSourceFactor: 0, sucFactor: 215.28 }, messages: [], sucFactor: 14.95, volumeFactor: 1, sourceFactor: 9, seasonFactor: 1.6, lossFactor: 1, abatementAdjustment: 'S126 x 1.0', s127Agreement: null, s130Agreement: null, eiucSourceFactor: 0, eiucFactor: 0 } }]

      const result = ConvertToCSVService.go(testData)

      expect(result).to.equal('"{""__DecisionID__"":""52c1088f-41b7-4f26-a7db-cab9792dc1cb0"",""WRLSChargingResponse"":{""chargeValue"":215.28,""decisionPoints"":{""sourceFactor"":9,""seasonFactor"":14.4,""lossFactor"":14.4,""volumeFactor"":1,""abatementAdjustment"":215.28,""s127Agreement"":215.28,""s130Agreement"":215.28,""secondPartCharge"":false,""waterUndertaker"":false,""eiucFactor"":0,""compensationCharge"":false,""eiucSourceFactor"":0,""sucFactor"":215.28},""messages"":[],""sucFactor"":14.95,""volumeFactor"":1,""sourceFactor"":9,""seasonFactor"":1.6,""lossFactor"":1,""abatementAdjustment"":""S126 x 1.0"",""s127Agreement"":null,""s130Agreement"":null,""eiucSourceFactor"":0,""eiucFactor"":0}}"\n')
    })

    it('correctly handles strings with quotes', async () => {
      const testData = ['Some "Quotes" Here', '"And here"']

      const result = ConvertToCSVService.go(testData)

      expect(result).to.equal('"Some ""Quotes"" Here","""And here"""\n')
    })

    it('correctly formats dates', async () => {
      const testDateAndTime = new Date()
      const testData = [testDateAndTime]

      const result = ConvertToCSVService.go(testData)

      // Note that we don't include quotes in our assertion as stringifying a date adds quotes already
      expect(result).to.equal(`${JSON.stringify(testDateAndTime)}\n`)
    })
  })
})
