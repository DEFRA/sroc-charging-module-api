'use strict'

const AuthorisationService = require('./authorisation.service')
const CalculateChargeService = require('./calculate_charge.service')
const CognitoJwtToPemService = require('./cognito_jwt_to_pem.service')
const CreateAuthorisedSystemService = require('./create_authorised_system.service')
const ListRegimesService = require('./list_regimes.service')
const ObjectCleaningService = require('./object_cleaning.service')
const RulesService = require('./rules.service')

module.exports = {
  AuthorisationService,
  CalculateChargeService,
  CognitoJwtToPemService,
  CreateAuthorisedSystemService,
  ListRegimesService,
  ObjectCleaningService,
  RulesService
}
