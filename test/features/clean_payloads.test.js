'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const { RouteHelper } = require('../support/helpers')

const options = payload => {
  return {
    method: 'POST',
    url: '/test/post',
    payload: payload
  }
}

describe.only('Cleaning data in requests', () => {
  let server

  // Create server before each test
  before(async () => {
    server = await deployment()
    RouteHelper.addPublicPostRoute(server)
  })

  describe('When a POST request contains properties that are only whitespace', () => {
    it('removes it', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        customerName: ' '
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload).to.not.contain('customerName')
    })
  })

  describe('When a POST request contains properties that are empty', () => {
    it('removes it', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        customerName: ''
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload).to.not.contain('customerName')
    })
  })

  describe.skip('When a POST request contains properties containing extra whitespace', () => {
    it('removes it', async () => {
      const requestPayload = {
        reference: 'BESESAME001 ',
        customerName: ' Bert & Ernie Ltd '
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload.reference).to.equal('BESESAME001')
      expect(responsePayload.customerName).to.equal('Bert & Ernie Ltd')
    })
  })
})
