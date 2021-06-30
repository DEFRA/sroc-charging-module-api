import CreateAuthorisedSystemService from '../../services/create_authorised_system.service.js'
import ListAuthorisedSystemsService from '../../services/list_authorised_systems.service.js'
import ShowAuthorisedSystemService from '../../services/show_authorised_system.service.js'
import UpdateAuthorisedSystemService from '../../services/update_authorised_system.service.js'

export default class AuthorisedSystemsController {
  static async index (_req, h) {
    const result = await ListAuthorisedSystemsService.go()

    return h.response(result).code(200)
  }

  static async show (req, h) {
    const result = await ShowAuthorisedSystemService.go(req.params.id)

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
