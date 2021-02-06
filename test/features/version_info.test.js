'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const { GeneralHelper, RouteHelper } = require('../support/helpers')

const options = {
  method: 'GET',
  url: '/test/public'
}

describe('Add version information to all responses', () => {
  // We need to 'stub' process.env. However, if a property does not already exist Sinon, the tool we normally use,
  // throws an error
  //
  //  Cannot stub non-existent property GIT_COMMIT
  //
  // Locally it's likely the env vars will be set, and we could set them in our CI workflow. However, we think the
  // VersionInfoPlugin is more robust if our tests prove it will work as expected whether the env vars exist or not. So,
  // instead we have gone with a method where we clone the existing process.env prior to running our tests, and restore
  // it after each one to ensure the changes don't leak into other tests.
  const env = GeneralHelper.cloneObject(process.env)
  let server

  // Create server before each test
  before(async () => {
    server = await deployment()
    RouteHelper.addPublicRoute(server)
  })

  afterEach(async () => {
    process.env = env
  })

  describe('When a request is made', () => {
    describe('if the version environment variables are present', () => {
      beforeEach(async () => {
        process.env.GIT_COMMIT = 'abc123'
        process.env.DOCKER_TAG = 'v0.1.0-99-gaabc123'
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
        delete process.env.GIT_COMMIT
        delete process.env.DOCKER_TAG
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
