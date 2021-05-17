'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { AdminSendTransactionFileService } = require('../../app/services')

describe('Admin Send Transaction File service', () => {
  describe('When the service is called', () => {
    it('returns `true`', async () => {
      const result = await AdminSendTransactionFileService.go()

      expect(result).to.be.true()
    })
  })
})
