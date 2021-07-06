/**
 * @module DatabaseHealthCheckService
 */

import { db } from '../../db/index.js'
import JsonPresenter from '../presenters/json.presenter.js'

/**
 * Generates an array of stats for each table in the database when `go()` is called
 *
 * This is a dump of running `SELECT * FROM pg_stat_user_tables` for the database. It's part of the database
 * healthcheck and we use it for 2 reasons
 *
 * - confirm we can connect
 * - get some basic stats, for example number of records, for each table without needing to connect to the db
*/
export default class DatabaseHealthCheckService {
  static async go () {
    const stats = db.select().table('pg_stat_user_tables')

    return this._response(stats)
  }

  static _response (stats) {
    const presenter = new JsonPresenter(stats)

    return presenter.go()
  }
}
