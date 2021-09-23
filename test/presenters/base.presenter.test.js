'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { BasePresenter } = require('../../app/presenters')

describe('Base presenter', () => {
  afterEach(async () => {
    Sinon.restore()
  })

  it('presents data', async () => {
    // Stub _presentation to simulate a child class with presentation properties
    Sinon.stub(BasePresenter.prototype, '_presentation').callsFake((data) => {
      return { after: data.before }
    })

    const testData = { before: true }
    const testPresenter = new BasePresenter(testData)
    const presentation = testPresenter.go()

    expect(presentation.after).to.equal(true)
  })

  it('throws an error if _presentation is not specified', async () => {
    const testData = { before: true }
    const testPresenter = new BasePresenter(testData)

    expect(() => testPresenter.go()).to.throw('You need to specify _presentation in the child presenter')
  })

  describe('_formatDate method', () => {
    it('correctly formats dates', async () => {
      const presenter = new BasePresenter()

      // We check an array of dates, one for each month, to ensure that every month is formatted correctly
      const results = [
        '2021-01-12T14:41:10.511Z',
        '2021-02-12T14:41:10.511Z',
        '2021-03-12T14:41:10.511Z',
        '2021-04-12T14:41:10.511Z',
        '2021-05-12T14:41:10.511Z',
        '2021-06-12T14:41:10.511Z',
        '2021-07-12T14:41:10.511Z',
        '2021-08-12T14:41:10.511Z',
        '2021-09-12T14:41:10.511Z',
        '2021-10-12T14:41:10.511Z',
        '2021-11-12T14:41:10.511Z',
        '2021-12-12T14:41:10.511Z'
      ].map(date => presenter._formatDate(date))

      expect(results).to.equal([
        '12-JAN-2021',
        '12-FEB-2021',
        '12-MAR-2021',
        '12-APR-2021',
        '12-MAY-2021',
        '12-JUN-2021',
        '12-JUL-2021',
        '12-AUG-2021',
        '12-SEP-2021',
        '12-OCT-2021',
        '12-NOV-2021',
        '12-DEC-2021'
      ])
    })
  })

  describe('_leftPadZeroes method', () => {
    it('correctly pads numbers', async () => {
      const number = 123
      const presenter = new BasePresenter()

      const result = presenter._leftPadZeroes(number, 7)

      expect(result).to.equal('0000123')
    })
  })

  describe('_signedCreditValue method', () => {
    describe('when given a credit', () => {
      it('returns a negative value if given a positive value', async () => {
        const presenter = new BasePresenter()

        const result = presenter._signedCreditValue(123, true)

        expect(result).to.equal(-123)
      })

      it('returns a negative value if given a negative value', async () => {
        const presenter = new BasePresenter()

        const result = presenter._signedCreditValue(-123, true)

        expect(result).to.equal(-123)
      })
    })

    describe('when given a debit', () => {
      it('returns the unchanged positive value if given a positive value', async () => {
        const presenter = new BasePresenter()

        const result = presenter._signedCreditValue(123, false)

        expect(result).to.equal(123)
      })

      it('returns the unchanged negative value if given a negative value', async () => {
        const presenter = new BasePresenter()

        const result = presenter._signedCreditValue(-123, false)

        expect(result).to.equal(-123)
      })
    })
  })

  describe('_cleanseNull method', () => {
    it('returns a blank string value if given a null value', async () => {
      const presenter = new BasePresenter()

      const result = presenter._cleanseNull(null)

      expect(result).to.equal('')
    })

    it('returns a string if given a string', async () => {
      const presenter = new BasePresenter()

      const result = presenter._cleanseNull('TEST')

      expect(result).to.equal('TEST')
    })
  })

  describe('_asBoolean method', () => {
    it("returns true if given the string 'true'", async () => {
      const presenter = new BasePresenter()

      const result = presenter._asBoolean('true')

      expect(result).to.be.true()
    })

    it("returns true if given the string 'tRuE'", async () => {
      const presenter = new BasePresenter()

      const result = presenter._asBoolean('tRuE')

      expect(result).to.be.true()
    })

    it('returns false if given a string with any other value', async () => {
      const presenter = new BasePresenter()

      const result = presenter._asBoolean('foobar')

      expect(result).to.be.false()
    })

    it('returns false if given nothing', async () => {
      const presenter = new BasePresenter()

      const result = presenter._asBoolean()

      expect(result).to.be.false()
    })
  })
})
