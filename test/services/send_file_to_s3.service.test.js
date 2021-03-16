'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const mockFs = require('mock-fs')

// Things we need to stub
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

// Thing under test
const { SendFileToS3Service } = require('../../app/services')

describe('Send File To S3 service', () => {
  let notifyFake
  let s3Stub
  let key

  const testFolder = '_testTmp'
  const testFile = 'test.dat'

  beforeEach(() => {
    // Stub the S3 client's send method, which is used to run the 'put object' command
    s3Stub = Sinon.stub(S3Client.prototype, 'send')

    // Create a fake function to stand in place of server.methods.notify
    notifyFake = Sinon.fake()

    // Define the key we'll 'upload' to. We use the 'test_folder' dir as this exists in our dev bucket so if we want to
    // double-check that files are indeed uploaded successfully, we can un-stub AWS and check the bucket contents
    key = `test_folder/${testFile}`

    // We want a mock filesystem that we can populate with our test file, however mock-fs doesn't allow us to overwrite
    // an existing path so we need to stub the temp file path with a non-existant path that we can then use with mock-fs
    Sinon.stub(SendFileToS3Service, '_temporaryFilePath').returns(testFolder)

    mockFs({
      [testFolder]: {
        [testFile]: 'test content'
      }
    })
  })

  afterEach(() => {
    Sinon.restore()
    mockFs.restore()
  })

  describe('When a valid file is specified', () => {
    it('uploads the file to the S3 bucket', async () => {
      await SendFileToS3Service.go(testFile, key, notifyFake, false)

      // Test that the S3 client was called once, and that it was called with PutObjectCommand
      expect(s3Stub.calledOnce).to.be.true()
      const calledCommand = s3Stub.getCall(0).firstArg
      expect(calledCommand instanceof PutObjectCommand).to.be.true()
    })
  })
})
