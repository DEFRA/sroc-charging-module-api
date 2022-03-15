'use strict'

const TestListCustomerFilesService = require('../../../services/files/customers/test_list_customer_files.service.js')
const ViewCustomerFileService = require('../../../services/files/customers/view_customer_file.service.js')

class TestCustomerFilesController {
  static async index (req, h) {
    const result = await TestListCustomerFilesService.go(req.app.regime)

    return h.response(result).code(200)
  }

  static async view (req, h) {
    const result = await ViewCustomerFileService.go(req.params.id)

    return h.response(result).code(200)
  }
}

module.exports = TestCustomerFilesController
