'use strict'

const DatabaseHealthCheckService = require('../../../services/database_health_check.service')

class DatabaseController {
  static async index (_req, h) {
    const result = await DatabaseHealthCheckService.go()

    return h.response(result).code(200)
  }
}

module.exports = DatabaseController
