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

describe('Cleaning data in requests', () => {
  let server

  // Create server before each test
  before(async () => {
    server = await deployment()
    RouteHelper.addPublicPostRoute(server)
  })

  describe('When a POST request contains properties that are only whitespace', () => {
    it('removes them', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        customerName: ' '
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload).to.not.contain('customerName')
    })

    it('removes them from nested objects', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        details: {
          firstName: 'Bert',
          lastName: ' '
        }
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload.details).to.not.contain('lastName')
    })
  })

  describe('When a POST request contains properties that are empty', () => {
    it('removes them', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        customerName: ''
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload).to.not.contain('customerName')
    })

    it('removes them from nested objects', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        details: {
          firstName: 'Bert',
          lastName: ''
        }
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload.details).to.not.contain('lastName')
    })
  })

  describe('When a POST request contains properties containing extra whitespace', () => {
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

    it('removes it from nested objects', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        details: {
          firstName: 'Bert',
          lastName: ' Ernie '
        }
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload.details.lastName).to.equal('Ernie')
    })
  })

  describe.only('When a POST request contains boolean properties that are false', () => {
    it('keeps them', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        customerName: 'Bert & Ernie Ltd',
        newCustomer: false
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload).to.contain('newCustomer')
    })

    it('keeps them in nested objects', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        details: {
          firstName: 'Bert',
          lastName: 'Ernie',
          newCustomer: false
        }
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload.details).to.contain('newCustomer')
    })
  })
})
