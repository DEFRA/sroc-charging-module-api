// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import StreamHelper from '../../support/helpers/stream.helper.js'

// Things we need to stub

// Additional dependencies needed
import stream from 'stream'

// Fixtures

// Thing under test
import StreamReadableDataService from '../../../app/services/streams/stream_readable_data.service.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

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
