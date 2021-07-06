import StaticLookupLib from '../../lib/static_lookup.lib.js'
import SendCustomerFileService from '../../services/send_customer_file.service.js'

export default class CustomersController {
  static async send (req, h) {
    const regions = StaticLookupLib.regions

    // Initiate generate/send process in the background
    SendCustomerFileService.go(req.app.regime, regions, req.app.notifier)

    return h.response().code(204)
  }

  static async show (_req, h) {
    return h.response().code(204)
  }
}
