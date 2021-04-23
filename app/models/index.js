'use strict'

const AuthorisedSystemModel = require('./authorised_system.model')
const BaseModel = require('./base.model')
const BillRunModel = require('./bill_run.model')
const CustomerFileModel = require('./customer_file.model')
const CustomerModel = require('./customer.model')
const InvoiceModel = require('./invoice.model')
const LicenceModel = require('./licence.model')
const RegimeModel = require('./regime.model')
const SequenceCounterModel = require('./sequence_counter.model')
const TransactionModel = require('./transaction.model')

module.exports = {
  AuthorisedSystemModel,
  BaseModel,
  BillRunModel,
  CustomerFileModel,
  CustomerModel,
  InvoiceModel,
  LicenceModel,
  RegimeModel,
  SequenceCounterModel,
  TransactionModel
}
