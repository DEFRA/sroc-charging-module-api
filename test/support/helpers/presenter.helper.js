export default class PresenterHelper {
  /**
   * Generates an array of column fields for use when testing that a file presenter returns the correct columns.
   *
   * Our convention is that file presenters return data with key names col01, col02, col03 etc. When we test that the
   * required data is returned, we generate an array of key names and check that the required data contains only those
   * keys. This method will generate and return the array.
   *
   * @param {integer} cols The number of col__ fields to return, starting with col01
   * @returns {array} The array of column fields
   */
  static generateNumberedColumns (cols) {
    const numberedCols = []

    for (let fieldNumber = 1; fieldNumber <= cols; fieldNumber++) {
      const paddedNumber = fieldNumber.toString().padStart(2, '0')
      numberedCols.push(`col${paddedNumber}`)
    }

    return numberedCols
  }
}
