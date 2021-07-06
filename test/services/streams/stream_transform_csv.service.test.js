// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import StreamHelper from '../../support/helpers/stream.helper.js'

// Additional dependencies needed
import stream from 'stream'

// Thing under test
import StreamTransformCSVService from '../../../app/services/streams/stream_transform_csv.service.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

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
