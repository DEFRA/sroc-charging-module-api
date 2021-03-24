'use strict'

/**
 * @module StreamRecordsService
 */

/**
 * Returns a stream of database records when given an Ojbection QueryBuilder object.
 *
 * Note that we must pass in a query and not the result of a query -- therefore it should be instantiated _without_
 * `await` ie:
 *  const query = TransactionModel.query().select('*')
 *  StreamRecordsService.go(query)
 *
 * @param {module:QueryBuilder} query Objection QueryBuilder object of the query you wish to stream.
 * @returns {} A stream of database records.
 */
class StreamRecordsService {
  static async go (query) {
    return query.toKnexQuery().stream()
  }
}

module.exports = StreamRecordsService
