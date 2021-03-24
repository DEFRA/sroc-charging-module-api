'use strict'

/**
 * @module CreateTransactionPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the data into the response we send to clients after a create transaction request.
 */
class CreateTransactionPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'D',
      col02: 'this.nextSequenceNumber()',
      col03: 't.customer_reference',
      col04: 'formatDate(t.transaction_date)',
      col05: 't.transaction_type',
      col06: 't.transaction_reference',
      col07: '',
      col08: 'GBP',
      col09: '',
      col10: 'formatDate(t.header_attr_1), // invoice date',
      col11: '',
      col12: '',
      col13: '',
      col14: '',
      col15: '',
      col16: '',
      col17: '',
      col18: '',
      col19: '',
      col20: 't.currency_line_amount',
      col21: '',
      col22: 't.line_area_code',
      col23: 't.line_description',
      col24: 'A',
      col25: '',
      col26: 'this.blankWhenCompensationCharge(t, t.line_attr_1)',
      col27: 'this.blankWhenCompensationCharge(t, t.line_attr_2)',
      col28: 'this.blankWhenCompensationCharge(t, t.line_attr_3)',
      col29: 'this.blankWhenCompensationCharge(t, t.line_attr_4)',
      col30: 'this.volumeInMegaLitres(t)',
      col31: 'this.blankWhenCompensationCharge(t, t.line_attr_6)',
      col32: 'this.blankWhenCompensationCharge(t, t.line_attr_7)',
      col33: 'this.blankWhenCompensationCharge(t, t.line_attr_8)',
      col34: 'this.blankWhenCompensationCharge(t, t.line_attr_9)',
      col35: 'this.blankWhenCompensationCharge(t, t.line_attr_10)',
      col36: '',
      col37: '',
      col38: 'this.blankUnlessCompensationCharge(t, t.line_attr_13)',
      col39: 'this.blankUnlessCompensationCharge(t, t.line_attr_14)',
      col40: '',
      col41: '1',
      col42: 'Each',
      col43: 't.unit_of_measure_price'
    }
  }
}

module.exports = CreateTransactionPresenter
