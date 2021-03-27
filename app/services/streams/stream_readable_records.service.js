'use strict'

/**
 * @module StreamReadableRecordsService
 */

/**
 * Returns a Readable stream of database records when given an Objection QueryBuilder object.
 *
 * Note that we must pass in a query and not the result of a query -- therefore it should be instantiated _without_
 * `await` ie:
 *  const query = TransactionModel.query().select('*')
 *  StreamReadableRecordsService.go(query)
 *
 * @param {module:QueryBuilder} query Objection QueryBuilder object of the query you wish to stream.
 * @returns {ReadableStream} A stream of database records.
 */
class StreamReadableRecordsService {
  static go (query) {
    return query
      .toKnexQuery()
      .stream()
  }
}

module.exports = StreamReadableRecordsService
