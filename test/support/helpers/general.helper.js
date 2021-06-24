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
}

module.exports = GeneralHelper
