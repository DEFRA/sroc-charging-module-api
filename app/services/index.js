'use strict'

const AuthorisationService = require('./authorisation.service')
const CalculateChargeService = require('./calculate_charge.service')
const CognitoJwtToPemService = require('./cognito_jwt_to_pem.service')
const ListRegimesService = require('./list_regimes.service')
const ObjectCleaningService = require('./object_cleaning.service')
const RulesService = require('./rules.service')
const ShowRegimeService = require('./show_regime.service')

module.exports = {
  AuthorisationService,
  CalculateChargeService,
  CognitoJwtToPemService,
  ListRegimesService,
  ObjectCleaningService,
  RulesService,
  ShowRegimeService
}
