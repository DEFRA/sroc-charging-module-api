// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const mockFs = require('mock-fs')

const path = require('path')

// Things we need to stub
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

// Thing under test
const { SendFileToS3Service } = require('../../app/services')

describe('Send File To S3 service', () => {
  let s3Stub
  let key

  const testFolder = '_testTmp'
  const testFile = 'test.dat'
  const filenameWithPath = path.join(testFolder, testFile)

  beforeEach(() => {
    // Stub the S3 client's send method, which is used to run the 'put object' command
    s3Stub = Sinon.stub(S3Client.prototype, 'send')

    // Define the key we'll 'upload' to. We use the 'test_folder' dir as this exists in our dev bucket so if we want to
    // double-check that files are indeed uploaded successfully, we can un-stub AWS and check the bucket contents
    key = `test_folder/${testFile}`

    // We want a mock filesystem that we can populate with our test file, however mock-fs doesn't allow us to overwrite
    // an existing path so we need to stub the temp file path with a non-existant path that we can then use with mock-fs
    Sinon.stub(SendFileToS3Service, '_temporaryFilePath').returns(testFolder)

    Sinon.stub(SendFileToS3Service, '_uploadBucket').returns('TEST_BUCKET')
    Sinon.stub(SendFileToS3Service, '_archiveBucket').returns('ARCHIVE_BUCKET')

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
      await SendFileToS3Service.go(filenameWithPath, key, false)

      // Test that the S3 client was called once
      expect(s3Stub.calledOnce).to.be.true()

      // Get the first call and test that it was called with PutObjectCommand
      const calledCommand = s3Stub.getCall(0).firstArg
      expect(calledCommand instanceof PutObjectCommand).to.be.true()

      // Test the bucket the file was sent to
      expect(calledCommand.input.Bucket).to.equal('TEST_BUCKET')
    })

    it("also uploads the file to the archive S3 bucket when copyToArchive is 'true'", async () => {
      await SendFileToS3Service.go(filenameWithPath, key, true)

      // Test that the S3 client was called twice
      expect(s3Stub.calledTwice).to.be.true()

      // Get the second call and test that it was called with PutObjectCommand
      const calledCommand = s3Stub.getCall(1).firstArg
      expect(calledCommand instanceof PutObjectCommand).to.be.true()

      // Test the bucket the file was sent to
      expect(calledCommand.input.Bucket).to.equal('ARCHIVE_BUCKET')
    })
  })

  describe('When an invalid file is specified', () => {
    it('throws an error', async () => {
      const fakeFile = 'FAKE_FILE'

      const err = await expect(SendFileToS3Service.go(fakeFile, key, false)).to.reject()

      expect(err).to.be.an.error()
      expect(err.message).to.equal(`ENOENT: no such file or directory, open '${fakeFile}'`)
    })
  })
})
