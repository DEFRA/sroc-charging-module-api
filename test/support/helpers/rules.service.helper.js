const RulesServiceConfig = require('../../../config/rules_service.config')

class RulesServiceHelper {
  static get url () {
    return RulesServiceConfig.url
  }

  static get WRLS () {
    const { application, ruleset } = RulesServiceConfig.endpoints.wrls

    return {
      application,
      ruleset,
      response: {
        __DecisionID__: '1a9f7bcb-f6b4-4817-aea7-21348493c1dc0',
        WRLSChargingResponse: {
          chargeValue: 7.72,
          decisionPoints: {
            sourceFactor: 10.7595,
            seasonFactor: 17.2152,
            lossFactor: 0.5164559999999999,
            volumeFactor: 3.5865,
            abatementAdjustment: 7.721017199999999,
            s127Agreement: 7.721017199999999,
            s130Agreement: 7.721017199999999,
            secondPartCharge: false,
            waterUndertaker: false,
            eiucFactor: 0,
            compensationCharge: false,
            eiucSourceFactor: 0,
            sucFactor: 7.721017199999999
          },
          messages: [],
          sucFactor: 14.95,
          volumeFactor: 3.5865,
          sourceFactor: 3,
          seasonFactor: 1.6,
          lossFactor: 0.03,
          abatementAdjustment: 'S126 x 1.0',
          s127Agreement: null,
          s130Agreement: null,
          eiucSourceFactor: 0,
          eiucFactor: 0
        }
      },
      request: {
        WRLSChargingRequest: {
          billableDays: 214,
          abstractableDays: 214,
          volume: 3.5865,
          source: 'Supported',
          season: 'Summer',
          loss: 'Low',
          secondPartCharge: false,
          compensationCharge: false,
          eiucSource: 'Tidal',
          waterUndertaker: false,
          region: 'Midlands',
          abatementAdjustment: 1,
          s127Agreement: false,
          s130Agreement: false
        }
      }
    }
  }
}

module.exports = RulesServiceHelper
