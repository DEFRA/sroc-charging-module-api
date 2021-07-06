// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import GeneralHelper from '../../support/helpers/general.helper'

// Thing under test
import FilterRoutesService from '../../../app/services/plugins/filter_routes.service.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Filter routes service', () => {
  const routes = [
    { path: '/' },
    { path: '/admin' },
    { path: '/v2/bill-runs' },
    {
      path: '/v2/bill-runs/unfinished',
      options: { app: { excludeFromProd: true } }
    }
  ]

  describe('when the environment is non-production', () => {
    it('returns the routes unchanged', () => {
      const result = FilterRoutesService.go(routes, 'dev')

      expect(result).to.equal(routes)
    })
  })

  describe('when the environment is production', () => {
    it('returns the routes filtered', () => {
      const filteredRoutes = GeneralHelper.cloneObject(routes)
      filteredRoutes.pop()

      const result = FilterRoutesService.go(routes, 'prd')

      expect(result).to.equal(filteredRoutes)
    })
  })
})
