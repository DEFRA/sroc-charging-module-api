'use strict'

module.exports = {
  presroc: {
    simple: {
      request: require('./presroc/simple_request.json'),
      rulesService: require('./presroc/simple_rules_service.json'),
      response: require('./presroc/simple_response.json')
    },
    s126ProrataCredit: {
      request: require('./presroc/s126_prorata_credit_request.json'),
      rulesService: require('./presroc/s126_prorata_credit_rules_service.json'),
      response: require('./presroc/s126_prorata_credit_response.json')
    },
    sectionAgreementsTrue: {
      request: require('./presroc/section_agreements_true_request.json'),
      rulesService: require('./presroc/section_agreements_true_rules_service.json'),
      response: require('./presroc/section_agreements_true_response.json')
    }
  }
}
