'use strict'

module.exports = {
  SimpleFixtures: {
    calculateChargeRequest: require('./calculate_charge_request_simple.json'),
    calculateChargeResponse: require('./calculate_charge_response_simple.json'),
    rulesServiceRequest: require('./rules_service_request_simple.json'),
    rulesServiceResponse: require('./rules_service_response_simple.json')
  },
  S127S130Fixtures: {
    calculateChargeRequest: require('./calculate_charge_request_s127_s130.json'),
    calculateChargeResponse: require('./calculate_charge_response_s127_s130.json'),
    rulesServiceRequest: require('./rules_service_request_s127_s130.json'),
    rulesServiceResponse: require('./rules_service_response_s127_s130.json')
  },
  S126ProrataCreditFixtures: {
    calculateChargeRequest: require('./calculate_charge_request_s126_prorata_credit.json'),
    calculateChargeResponse: require('./calculate_charge_response_s126_prorata_credit.json'),
    rulesServiceRequest: require('./rules_service_request_s126_prorata_credit.json'),
    rulesServiceResponse: require('./rules_service_response_s126_prorata_credit.json')
  }
}
