import CalculateChargeController from '../controllers/presroc/calculate_charge.controller.js'
import NotSupportedController from '../controllers/not_supported.controller.js'

const CalculateChargeRoutes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/calculate-charge',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/calculate-charge',
    handler: CalculateChargeController.calculate
  }
]

export default CalculateChargeRoutes
