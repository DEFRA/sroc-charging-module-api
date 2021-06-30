import CreateCustomerDetailsService from '../../services/create_customer_details.service.js'

export default class PresrocCustomerDetailsController {
  static async create (req, h) {
    await CreateCustomerDetailsService.go(req.payload, req.app.regime)

    return h.response().code(201)
  }
}
