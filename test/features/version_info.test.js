'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const { RouteHelper } = require('../support/helpers')

const options = {
  method: 'GET',
  url: '/test/public'
}

describe('Add version information to all responses', () => {
  let server

  // Create server before each test
  before(async () => {
    server = await deployment()
    RouteHelper.addPublicRoute(server)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a request is made', () => {
    describe('if the version environment variables are present', () => {
      beforeEach(async () => {
        Sinon.stub(process.env, 'GIT_COMMIT').value('abc123')
        Sinon.stub(process.env, 'DOCKER_TAG').value('v0.1.0-99-gaabc123')
      })

      it('includes git commit details in a response header', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.headers['x-cma-git-commit']).to.equal('abc123')
      })

      it('includes docker tag details in a response header', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.headers['x-cma-docker-tag']).to.equal('v0.1.0-99-gaabc123')
      })
    })

    describe('if the version environment variables are not present', () => {
      beforeEach(async () => {
        Sinon.stub(process.env, 'GIT_COMMIT').value('')
        Sinon.stub(process.env, 'DOCKER_TAG').value('')
      })

      it("sets the git commit details in a response header to 'unknown'", async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.headers['x-cma-git-commit']).to.equal('unknown')
      })

      it("sets the docker tag details in a response header to 'unknown'", async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.headers['x-cma-docker-tag']).to.equal('unknown')
      })
    })
  })
})
