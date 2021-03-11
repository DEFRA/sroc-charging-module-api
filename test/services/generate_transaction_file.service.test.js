'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

const mockFs = require('mock-fs')

const fs = require('fs')
const path = require('path')

const { temporaryFilePath } = require('../../config/server.config')

// Thing under test
const { GenerateTransactionFileService } = require('../../app/services')

describe('Generate Transaction File service', () => {
  const filename = 'test.txt'
  const filenameWithPath = path.join(temporaryFilePath, filename)

  beforeEach(async () => {
    // Create mock in-memory file system to avoid temp files being dropped in our filesystem
    mockFs({
      tmp: { }
    })
  })

  afterEach(async () => {
    mockFs.restore()
  })

  it('creates a file with expected content', async () => {
    await GenerateTransactionFileService.go(filename)

    const file = fs.readFileSync(filenameWithPath, 'utf-8')

    expect(file).to.equal('Hello world!')
  })
})
