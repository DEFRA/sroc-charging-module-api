/**
 * @module DeleteInvoiceService
 */

const { BillRunModel, InvoiceModel } = require('../models')
const { raw } = require('../models/base.model')

class DeleteInvoiceService {
  /**
   * Deletes an invoice along with its licences and transactions, and updates the figures of the bill run that the
   * invoice belongs to. Intended to be run as a background task by a controller, ie. called without an await. Note that
   * the invoice will _not_ be validated to ensure it is linked to the bill run; it is expected that this will be done
   * from the calling controller so that it can present the appropriate error to the user immediately.
   *
   * @param {module:InvoiceModel} invoice The invoice to be deleted.
   * @param {string} billRunId The id of the bill run that the invoice belongs to.
   * @param {@module:RequestNotifierLib} notifier Instance of `RequestNotifierLib` class. We use it to log errors rather
   * than throwing them as this service is intended to run in the background.
   * @param {object} [existingTrx] Optional transaction instance; only needed if calling this service from within an
   * existing transaction.
   */
  static async go (invoice, billRunId, notifier, existingTrx = null) {
    try {
      // If this service is being called from within an existing transaction then pass it through to the _deleteInvoice
      // function; otherwise, call it from within a "create transaction" block.
      if (existingTrx) {
        await this._deleteInvoice(invoice, billRunId, existingTrx)
      } else {
        await InvoiceModel.transaction(async trx => {
          await this._deleteInvoice(invoice, billRunId, trx)
        })
      }
    } catch (error) {
      notifier.omfg('Error deleting invoice', { id: invoice.id, error })
    }
  }

  static async _deleteInvoice (invoice, billRunId, trx) {
    const billRunPatch = this._billRunPatch(invoice)

    // We only need to delete the invoice as the deletion will cascade down to the licence level, and from there down
    // to the transaction level.
    await InvoiceModel
      .query(trx)
      .deleteById(invoice.id)

    await BillRunModel
      .query(trx)
      .findById(billRunId)
      .patch(billRunPatch)

    await this._setBillRunStatusIfEmpty(billRunId, trx)
  }

  /**
   * Set the bill run status to 'initialised' if it's empty. We find by bill run id then use the empty modifier to
   * ensure we only patch the bill run if it's empty.
   */
  static async _setBillRunStatusIfEmpty (billRunId, trx) {
    await BillRunModel
      .query(trx)
      .findById(billRunId)
      .modify('empty')
      .patch({ status: 'initialised' })
  }

  /**
   * Create a patch which when applied to a bill run will subtract the counts and values of the passed-in invoice.
   *
   * @param {module:InvoiceModel} invoice The invoice which is to have its values subtracted from a bill run.
   */
  static _billRunPatch (invoice) {
    const update = {
      creditLineCount: raw('credit_line_count - ?', invoice.creditLineCount),
      creditLineValue: raw('credit_line_value - ?', invoice.creditLineValue),
      debitLineCount: raw('debit_line_count - ?', invoice.debitLineCount),
      debitLineValue: raw('debit_line_value - ?', invoice.debitLineValue),
      zeroLineCount: raw('zero_line_count - ?', invoice.zeroLineCount),
      subjectToMinimumChargeCount: raw('subject_to_minimum_charge_count - ?', invoice.subjectToMinimumChargeCount),
      subjectToMinimumChargeCreditValue: raw('subject_to_minimum_charge_credit_value - ?', invoice.subjectToMinimumChargeCreditValue),
      subjectToMinimumChargeDebitValue: raw('subject_to_minimum_charge_debit_value - ?', invoice.subjectToMinimumChargeDebitValue)
    }

    // Determine if the invoice is a credit note or invoice and update the credit note/invoice stats accordingly.
    if (invoice.$creditNote()) {
      Object.assign(update, {
        creditNoteCount: raw('credit_note_count - 1'),
        creditNoteValue: raw('credit_note_value - ?', invoice.$absoluteNetTotal())
      })
    } else {
      Object.assign(update, {
        invoiceCount: raw('invoice_count - 1'),
        invoiceValue: raw('invoice_value - ?', invoice.$absoluteNetTotal())
      })
    }

    return update
  }
}

module.exports = DeleteInvoiceService
