'use strict'

const CreateAuthorisedSystemService = require('../../services/authorised_systems/create_authorised_system.service')
const ListAuthorisedSystemsService = require('../../services/authorised_systems/list_authorised_systems.service')
const ViewAuthorisedSystemService = require('../../services/authorised_systems/view_authorised_system.service')
const UpdateAuthorisedSystemService = require('../../services/authorised_systems/update_authorised_system.service')

class AuthorisedSystemsController {
  static async index (_req, h) {
    const result = await ListAuthorisedSystemsService.go()

    return h.response(result).code(200)
  }

  static async view (req, h) {
    const result = await ViewAuthorisedSystemService.go(req.params.id)

    return h.response(result).code(200)
  }

  static async create (req, h) {
    const result = await CreateAuthorisedSystemService.go(req.payload)

    return h.response(result).code(201)
  }

  static async update (req, h) {
    await UpdateAuthorisedSystemService.go(req.params.id, req.payload)

    return h.response().code(204)
  }
}

module.exports = AuthorisedSystemsController
