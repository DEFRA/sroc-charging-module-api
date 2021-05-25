'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { AdminRouterService } = require('../../../app/services')

describe('Admin router service', () => {
  const optionsWithAuth = { auth: { scope: ['admin'] } }
  const optionsWithNoAuth = { auth: false }
  const baseRoute = {
    method: 'GET',
    path: '/',
    handler: () => {}
  }

  describe('when the environment is non-production', () => {
    describe("and the service is passed an '/admin' route", () => {
      it("still adds the 'options' property with the 'auth' scope set", () => {
        const adminRoute = {
          ...baseRoute,
          path: '/admin/test'
        }
        const result = AdminRouterService.go(adminRoute, 'dev')

        expect(result.options).to.exist()
        expect(result.options).to.equal(optionsWithAuth)
      })
    })

    describe("and the service is passed a 'protected' route", () => {
      it("does not add the 'options' property", () => {
        const protectedRoute = {
          ...baseRoute,
          path: '/v2/bill-runs/protected'
        }
        const result = AdminRouterService.go(protectedRoute, 'dev')

        expect(result.options).to.not.exist()
      })
    })

    describe('and the service is passed a standard route', () => {
      it("does not add the 'options' property", () => {
        const standardRoute = {
          ...baseRoute,
          path: '/v2/bill-runs'
        }
        const result = AdminRouterService.go(standardRoute, 'dev')

        expect(result.options).to.not.exist()
      })
    })

    describe("and the service is passed a 'root' route", () => {
      it("adds the no auth 'options' property", () => {
        const rootRoute = {
          ...baseRoute,
          path: '/status'
        }
        const result = AdminRouterService.go(rootRoute, 'dev')

        expect(result.options).to.exist()
        expect(result.options).to.equal(optionsWithNoAuth)
      })
    })
  })

  describe('when the environment is production', () => {
    describe("and the service is passed an '/admin' route", () => {
      it("adds the 'options' property with the 'auth' scope set", () => {
        const adminRoute = {
          ...baseRoute,
          path: '/admin/test'
        }
        const result = AdminRouterService.go(adminRoute, 'prd')

        expect(result.options).to.exist()
        expect(result.options).to.equal(optionsWithAuth)
      })
    })

    describe("and the service is passed a 'protected' route", () => {
      beforeEach(() => {
        Sinon.stub(AdminRouterService, '_protectedPath').returns(true)
      })

      afterEach(() => {
        Sinon.restore()
      })

      it("adds the 'options' property with the 'auth' scope set", () => {
        const protectedRoute = {
          ...baseRoute,
          path: '/v2/bill-runs/protected'
        }
        const result = AdminRouterService.go(protectedRoute, 'prd')

        expect(result.options).to.exist()
        expect(result.options).to.equal(optionsWithAuth)
      })
    })

    describe('and the service is passed a standard route', () => {
      it("does not add the 'options' property", () => {
        const standardRoute = {
          ...baseRoute,
          path: '/v2/bill-runs'
        }
        const result = AdminRouterService.go(standardRoute, 'prd')

        expect(result.options).to.not.exist()
      })
    })

    describe("and the service is passed a 'root' route", () => {
      it("adds the no auth 'options' property", () => {
        const rootRoute = {
          ...baseRoute,
          path: '/status'
        }
        const result = AdminRouterService.go(rootRoute, 'prd')

        expect(result.options).to.exist()
        expect(result.options).to.equal(optionsWithNoAuth)
      })
    })
  })
})
