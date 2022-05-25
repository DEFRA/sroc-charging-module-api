'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BasePresenter = require('../../app/presenters/base.presenter.js')

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
        '2021-01-01T14:41:10.511Z',
        '2021-02-01T14:41:10.511Z',
        '2021-03-01T14:41:10.511Z',
        '2021-04-01T14:41:10.511Z',
        '2021-05-01T14:41:10.511Z',
        '2021-06-01T14:41:10.511Z',
        '2021-07-12T14:41:10.511Z',
        '2021-08-12T14:41:10.511Z',
        '2021-09-12T14:41:10.511Z',
        '2021-10-12T14:41:10.511Z',
        '2021-11-12T14:41:10.511Z',
        '2021-12-12T14:41:10.511Z'
      ].map(date => presenter._formatDate(date))

      expect(results).to.equal([
        '01-JAN-2021',
        '01-FEB-2021',
        '01-MAR-2021',
        '01-APR-2021',
        '01-MAY-2021',
        '01-JUN-2021',
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

  describe('_asNumber method', () => {
    it('returns a number if given a string that is a number', async () => {
      const presenter = new BasePresenter()

      const result = presenter._asNumber('123')

      expect(result).to.equal(123)
    })

    it('returns a number if given a number', async () => {
      const presenter = new BasePresenter()

      const result = presenter._asNumber(123)

      expect(result).to.equal(123)
    })

    it("returns `null` if given a string that isn't a number", async () => {
      const presenter = new BasePresenter()

      const result = presenter._asNumber('one two three')

      expect(result).to.equal(null)
    })
  })

  describe('_extractFactorFromString method', () => {
    it('returns the factor if given a string in the format `... x n.n`', async () => {
      const presenter = new BasePresenter()

      const result = presenter._extractFactorFromString('S127 x 0.5')

      expect(result).to.equal(0.5)
    })

    it('returns the factor if it has more than 1 decimal place', async () => {
      const presenter = new BasePresenter()

      const result = presenter._extractFactorFromString('S127 x 0.833')

      expect(result).to.equal(0.833)
    })

    it('returns `null` if given a string in the wrong format', async () => {
      const presenter = new BasePresenter()

      const result = presenter._extractFactorFromString('S127 0.5')

      expect(result).to.equal(null)
    })

    it('returns `null` if given `null` as a value', async () => {
      const presenter = new BasePresenter()

      const result = presenter._extractFactorFromString(null)

      expect(result).to.equal(null)
    })
  })

  describe('_extractS127FactorFromString method', () => {
    it('returns the factor if given a string in the format `... x n.n`', async () => {
      const presenter = new BasePresenter()

      const result = presenter._extractS127FactorFromString('S127 x 0.5')

      expect(result).to.equal(0.5)
    })

    it('returns `null` if given a string for the wrong section', async () => {
      const presenter = new BasePresenter()

      const result = presenter._extractS127FactorFromString('S130 x 0.5')

      expect(result).to.equal(null)
    })

    it('returns `null` if given `null` as a value', async () => {
      const presenter = new BasePresenter()

      const result = presenter._extractS127FactorFromString(null)

      expect(result).to.equal(null)
    })
  })
})
