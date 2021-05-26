'use strict'

/**
 * Determines if the request is related to a licence and does the work of first finding it, then validating if the
 * request is valid, ie. that the licence exists.
 *
 * This sits as a partner plugin with RequestBillRun, so that by the time we get to a controller we have already
 * retrieved and validated any bill run and licence included in the url.
 *
 * In this case most of the work is done by the {@module RequestLicednceService}. If licence is found and valid for the
 * request the plugin adds the {@module LicenceModel} instance to `request.app` as per the
 * {@link https://hapi.dev/api/?v=20.1.0#-requestapp|Hapi documentation} to make it available to all controllers.
 *
 * @module RequestLicencePlugin
 */

const { RequestLicenceService } = require('../services')

const RequestLicencePlugin = {
  name: 'request_licence',
  register: (server, _options) => {
    server.ext('onPreHandler', async (request, h) => {
      const { licenceId } = request.params
      request.app.licence = await RequestLicenceService.go(request.path, licenceId)

      return h.continue
    })
  }
}

module.exports = RequestLicencePlugin
