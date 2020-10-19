class RequestToChargeTranslator {
  constructor (data) {
    Object.assign(this, data)
  }

  // Some getter names don't comply with the StandardJS camelcase rule so we disable the rule as required

  get charge_period_start () { // eslint-disable-line camelcase
    return this.periodStart
  }

  get charge_period_end () { // eslint-disable-line camelcase
    return this.periodEnd
  }

  get charge_credit () { // eslint-disable-line camelcase
    return this.credit
  }

  get billableDays () {
    return this.billableDays
  }

  get abstractableDays () {
    return this.authorisedDays
  }

  get volume () {
    return this.volume
  }

  get source () {
    return this.source
  }

  get season () {
    return this.season
  }

  get loss () {
    return this.loss
  }

  get section130Agreement () {
    return this.section130Agreement
  }

  get section126Agreement () {
    return this.section126Agreement
  }

  get abatementAdjustment () {
    return this.section126Factor
  }

  get section127Agreement () {
    return this.section127Agreement
  }

  get secondPartCharge () {
    return this.twoPartTariff
  }

  get compensationCharge () {
    return this.compensationCharge
  }

  get eiucSource () {
    return this.eiucSource
  }

  get waterUndertaker () {
    return this.waterUndertaker
  }

  get region () {
    return this.regionalChargingArea
  }
}

module.exports = RequestToChargeTranslator
