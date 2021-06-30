import CalculateChargeService from '../../services/calculate_charge.service.js'

export default class CalculateChargeController {
  static async calculate (req, h) {
    const result = await CalculateChargeService.go(req.payload, req.app.regime)

    return h.response(result).code(200)
  }
}
