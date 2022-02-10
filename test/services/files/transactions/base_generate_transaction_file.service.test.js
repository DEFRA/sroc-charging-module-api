'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { BaseGenerateTransactionFileService } = require('../../../../app/services')

describe('Base Generate Transaction File service', () => {
  describe('When a class extends it', () => {
    const methodsToOverride = [
      '_bodyPresenter',
      '_select'
    ]

    for (const method of methodsToOverride) {
      it(`must override the '${method}()' method`, () => {
        const throws = () => {
          BaseGenerateTransactionFileService[method]()
        }

        expect(throws).to.throw(`Extending class must implement '${method}()'`)
      })
    }
  })
})
