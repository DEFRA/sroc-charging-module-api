'use strict'

module.exports = {
  wrls: {
    simple: {
      request: require('./wrls/simple_request.json'),
      rulesService: require('./wrls/simple_rules_service.json'),
      response: require('./wrls/simple_response.json')
    },
    s126ProrataCredit: {
      request: require('./wrls/s126_prorata_credit_request.json'),
      rulesService: require('./wrls/s126_prorata_credit_rules_service.json'),
      response: require('./wrls/s126_prorata_credit_response.json')
    },
    sectionAgreementsTrue: {
      request: require('./wrls/section_agreements_true_request.json'),
      rulesService: require('./wrls/section_agreements_true_rules_service.json'),
      response: require('./wrls/section_agreements_true_response.json')
    }
  }
}
