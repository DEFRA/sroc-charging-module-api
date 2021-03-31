'use strict'

/**
 * @module StreamReadableRecordsService
 */

const { QueryBuilder } = require('objection')

/**
 * Returns a Readable stream of database records when given a database query object. It accepts both Objection and Knex
 * QueryBuilder objects. We allow this because Objection QueryBuilder doesn't support eager loading methods in streams,
 * so we must use a Knex query if we want to join tables and have the joined data returned from the stream.
 *
 * Note that we must pass in a query and not the result of a query -- therefore it should be instantiated _without_
 * `await` ie:
 *  const query = TransactionModel.query().select('*')
 *  StreamReadableRecordsService.go(query)
 *
 * @param {module:QueryBuilder} query Objection or Knex QueryBuilder object of the query you wish to stream.
 * @returns {ReadableStream} A stream of database records.
 */
class StreamReadableRecordsService {
  static go (query) {
    // Objection doesn't natively support the .stream() method so we convert Objection queries to Knex queries
    const knexQuery = query instanceof QueryBuilder ? query.toKnexQuery() : query

    return knexQuery.stream()
  }
}

module.exports = StreamReadableRecordsService
