'use strict'

const Hoek = require('@hapi/hoek')

/**
 * Class of general test helper methods
 *
 * The methods here have a more general purpose and can be used across test types, features and domains.
 */
class GeneralHelper {
  /**
   * Deep clone an object
   *
   * In JavaScript assigning an object is by reference. We use 'fixtures' in our tests which are JSON objects read from
   * files. They help us avoid duplication and noise in our tests. Often we need to amend a small part of the object for
   * the purposes of a test. If we didn't clone the fixture before doing this, all subsequent tests would see the
   * altered fixture.
   *
   * There are a number of ways to clone an object. Using the spread operator (`...`) or `Object.assign` however, will
   * only do a shallow clone (copy the top level properties but still reference any sub-properties). Because our
   * fixtures can be multidimensional we need to do a deep clone. Hapi brings in the dependency Hoek which contains a
   * `clone()` method that does deep cloning so we use that.
   *
   * You can read more about cloning objects here https://www.samanthaming.com/tidbits/70-3-ways-to-clone-objects/
   *
   * @param {Object} thingToBeCloned Object you want to be cloned
   * @returns {Object} a deep clone of the object
   */
  static cloneObject (thingToBeCloned) {
    return Hoek.clone(thingToBeCloned)
  }

  /**
   * Generate a {@link https://www.ietf.org/rfc/rfc4122.txt|RFC4122} compliant UUID
   *
   * We use UUID's as record ids in our database. PostgreSQL handles generating these for us when we insert a record.
   * Some of our models have a requirement that linked item ID's are also populated. For example, a `transaction`
   * expects its `invoice_id` and `licence_id` fields to be populated.
   *
   * When testing though there are times we want to create a record without also having to create its dependents. We
   * just need to populate a foreign key field with a valid UUID. For those times you can use this to generate a valid
   * UUID v4 ID just like we use in the database.
   *
   * **WARNING!** The UUIDs this generates would not be safe for production usage. They depend on JavaScript's
   * `Math.random()` which isn't seen as _random enough_ for generating non-clashing UUIDs.
   *
   * Credits: https://stackoverflow.com/a/2117523/6117745
   */
  static uuid4 () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)

      return v.toString(16)
    })
  }

  /**
   * Use where you need to pause within a test
   *
   * There are times where we kick off something in the background but we then need to assert the result as part of a
   * test. For that we have this helper that will pause the test for the number of milliseconds requested.
   *
   * **Note** We have noted that a delay of more than 2000ms seems to cause the test to timeout. If you see errors when
   * using a delay greater than 2 seconds this may be the cause.
   *
   * @param {number} ms Time in milliseconds to pause for (1000ms == 1 second)
   */
  static sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Format a date as `2021-09-06T14:01:15.929Z`
   *
   * In some places (eg. storing a date in a CSV format) we format a date using JSON.stringify(). This has the side-
   * effect of putting quotes around it. Since we generally wouldn't want this, we use this helper method to do the
   * formatting, by stringifying the date then removing the surrounding quotes.
   */
  static formatDate (date) {
    return JSON
      .stringify(date)
      .replace(/"/g, '')
  }

  /**
   * Returns the date a given number of days ago, where 0 = today, 1 = yesterday, etc. Optionally, the time element of
   * the returned date object can be specified, with the hour, minute, second and millisecond component of the time
   * specified separately. Any not specified will default to the current hour, minute, second or millisecond, eg. if
   * the current date and time is 2021-03-05T11:06:43.123Z then daysAgoDate(1, 9, 29) would be 2021-03-04T09:29:43.123Z
   *
   * @param {integer} days Number of days to go back, eg. 0 = today, 1 = yesterday, etc.
   * @param {integer} [hour] The hour part of the time to return. Defaults to the current hour.
   * @param {integer} [minute] The minute part of the time to return. Defaults to the current minute.
   * @param {integer} [second] The second part of the time to return. Defaults to the current second.
   * @param {integer} [millisecond] The millisecond part of the time to return. Defaults to the current millisecond.
   * @returns {date} The resulting date object.
   */
  static daysAgoDate (
    days,
    hour = new Date().getHours(),
    minute = new Date().getMinutes(),
    second = new Date().getSeconds(),
    millisecond = new Date().getMilliseconds()
  ) {
    const date = new Date()

    date.setDate(date.getDate() - days)
    date.setHours(hour, minute, second, millisecond)

    return date
  }
}

module.exports = GeneralHelper
