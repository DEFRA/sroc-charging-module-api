'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../../support/helpers')

// Thing under test
const { FilterRoutesService } = require('../../../app/services')

describe('Filter routes service', () => {
  const routes = [
    { path: '/' },
    { path: '/admin' },
    { path: '/v2/bill-runs' },
    { path: '/v2/bill-runs/unfinished' }
  ]

  describe('when the environment is non-production', () => {
    it('returns the routes unchanged', () => {
      const result = FilterRoutesService.go(routes, 'dev')

      expect(result).to.equal(routes)
    })
  })

  describe('when the environment is production', () => {
    beforeEach(() => {
      Sinon.stub(FilterRoutesService, '_pathsToBeFiltered').returns(['/v2/bill-runs/unfinished'])
    })

    afterEach(() => {
      Sinon.restore()
    })

    it('returns the routes filtered', () => {
      const filteredRoutes = GeneralHelper.cloneObject(routes)
      filteredRoutes.pop()

      const result = FilterRoutesService.go(routes, 'prd')

      expect(result).to.equal(filteredRoutes)
    })
  })
})
