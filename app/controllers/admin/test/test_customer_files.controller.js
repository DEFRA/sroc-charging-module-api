import ListCustomerFilesService from '../../../services/list_customer_files.service.js'
import ShowCustomerFileService from '../../../services/show_customer_file.service.js'

export default class TestCustomerFilesController {
  static async index (req, h) {
    const result = await ListCustomerFilesService.go(req.app.regime)

    return h.response(result).code(200)
  }

  static async show (req, h) {
    const result = await ShowCustomerFileService.go(req.params.id)

    return h.response(result).code(200)
  }
}
