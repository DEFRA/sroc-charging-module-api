'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { DeprecatedEndpointService } = require('../../../app/services')

describe('Deprecated Endpoint service', () => {
  describe('when the route is deprecated', () => {
    describe('and the route is succeeded', () => {
      it('returns a header object with deprecation and link', () => {
        const app = {
          deprecated: {
            succeeded: true,
            successor: '/replacement-path'
          }
        }
        const result = DeprecatedEndpointService.go({ settings: { app } })

        expect(result.deprecation).to.be.true()
        expect(result.link).to.equal('</replacement-path>; rel="successor-version"')
      })
    })

    describe('and the route is not succeeded', () => {
      it('returns a header object with deprecation and without link', () => {
        const app = {
          deprecated: {
            succeeded: false
          }
        }
        const result = DeprecatedEndpointService.go({ settings: { app } })

        expect(result.deprecation).to.be.true()
        expect(result.link).to.not.exist()
      })
    })
  })

  describe('when the route is not deprecated', () => {
    it('returns an empty header object', () => {
      const app = { }
      const result = DeprecatedEndpointService.go({ settings: { app } })

      expect(result).to.be.empty()
    })
  })
})
