'use strict'

const tableName = 'bill_runs'

/**
 * Fix 2 corrupt bill runs
 *
 * https://eaflood.atlassian.net/browse/CMEA-171
 *
 * In September 2021 the Billing & Data team reported a discrepency between the bill run summary for
 * efda490c-84fd-4e8b-b7cb-e5b6dabcf3b8 and the invoice detail. This was tracked down to an issue with the CM
 * incorrectly updating the summary when a deminimis invoice was deleted.
 *
 * https://github.com/DEFRA/sroc-charging-module-api/pull/561 fixed the bug. This migration is to fix the bill run
 * summary info for the affected records.
 *
 * Purely as a way to record it somewhere, below is the query used to detect bill runs affected by this bug
 *
 * ```sql
 * SELECT * FROM
 * (
 *   SELECT
 *     (CASE
 *       WHEN invoices.total_count IS null THEN false
 *       WHEN (invoices.total_count - invoices.deminimis_count) > br.invoice_count THEN true
 *       ELSE false
 *     END) AS check_flag,
 *     br.bill_run_number,
 *     br.file_reference,
 *     br.status,
 *     (invoices.total_count) AS inv_total_count,
 *     (invoices.deminimis_count) AS inv_deminimis_count,
 *     (invoices.total_count - invoices.deminimis_count) AS inv_invoice_count,
 *     (br.invoice_count) AS br_invoice_count,
 *     br.id,
 *     br.region
 *   FROM bill_runs AS br
 *   LEFT JOIN
 *     (
 *       SELECT
 *         bill_run_id,
 *         (COUNT(ID)) AS total_count,
 *         (SUM(CASE WHEN deminimis_invoice IS true THEN 1 ELSE 0 END)) AS deminimis_count
 *       FROM invoices
 *       WHERE
 *         zero_value_invoice IS false
 *         AND ((debit_line_value - credit_line_value) >= 0)
 *       GROUP BY bill_run_id
 *     ) AS invoices ON invoices.bill_run_id = br.id
 *   WHERE br.status != 'initialised'
 * ) AS results
 * ORDER BY
 *   results.check_flag DESC, results.file_reference
 * ```
 */
exports.up = async function (knex) {
  await knex(tableName)
    .whereIn('id', ['efda490c-84fd-4e8b-b7cb-e5b6dabcf3b8', '2e2de774-e9bc-4624-a893-a999664c1c6a'])
    .increment({
      invoice_count: 1,
      invoice_value: 1
    })
}

exports.down = async function (knex) {
  await knex(tableName)
    .whereIn('id', ['efda490c-84fd-4e8b-b7cb-e5b6dabcf3b8', '2e2de774-e9bc-4624-a893-a999664c1c6a'])
    .decrement({
      invoice_count: 1,
      invoice_value: 1
    })
}
