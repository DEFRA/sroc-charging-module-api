// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

// Thing under test
const { ObjectCleaningService } = require('../../../app/services')

describe('Object cleaning service', () => {
  describe('When an object contains values with extra whitespace', () => {
    it('can remove them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: 'Bert & Ernie  '
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.customerName).to.equal('Bert & Ernie')
    })

    it('can remove them from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: ' Bert',
          lastName: ' Ernie '
        }
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.details.firstName).to.equal('Bert')
      expect(cleanedObject.details.lastName).to.equal('Ernie')
    })

    it('can remove them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', 'B1 ', ' C2']
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.codes).to.equal(['ABD1', 'B1', 'C2'])
    })

    it('can remove them from objects in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        contacts: [
          { firstName: ' Bert', lastName: ' Ernie ' },
          { firstName: 'Big', lastName: 'Bird' }
        ]
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.contacts[0].firstName).to.equal('Bert')
      expect(cleanedObject.contacts[0].lastName).to.equal('Ernie')
    })
  })

  describe('When an object contains values which are just whitespace', () => {
    it('removes them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: ' '
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.not.contain('customerName')
    })

    it('removes them from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: ' ',
          lastName: 'Ernie'
        }
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.details).to.not.contain('firstName')
      expect(cleanedObject.details).to.contain('lastName')
    })

    it('removes them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', ' ', 'C2']
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.codes).to.equal(['ABD1', 'C2'])
    })

    it('removes them from objects in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        contacts: [
          { firstName: 'Bert', lastName: ' ' },
          { firstName: 'Big', lastName: 'Bird' }
        ]
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.contacts[0]).to.contain('firstName')
      expect(cleanedObject.contacts[0]).to.not.contain('lastName')
    })
  })

  describe('When an object contains values which are empty', () => {
    it('removes them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: ''
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.not.contain('customerName')
    })

    it('removes them from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: '',
          lastName: 'Ernie'
        }
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.details).to.not.contain('firstName')
      expect(cleanedObject.details).to.contain('lastName')
    })

    it('removes them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', '', 'C2']
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.codes).to.equal(['ABD1', 'C2'])
    })

    it('removes them from objects in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        contacts: [
          { firstName: 'Bert', lastName: '' },
          { firstName: 'Big', lastName: 'Bird' }
        ]
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.contacts[0]).to.contain('firstName')
      expect(cleanedObject.contacts[0]).to.not.contain('lastName')
    })
  })

  describe('When an object contains null values', () => {
    it('removes them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: null
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.not.contain('customerName')
    })

    it('removes them from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: null,
          lastName: 'Ernie'
        }
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.details).to.not.contain('firstName')
      expect(cleanedObject.details).to.contain('lastName')
    })

    it('removes them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', null, 'C2']
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.codes).to.equal(['ABD1', 'C2'])
    })

    it('removes them from objects in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        contacts: [
          { firstName: 'Bert', lastName: null },
          { firstName: 'Big', lastName: 'Bird' }
        ]
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.contacts[0]).to.contain('firstName')
      expect(cleanedObject.contacts[0]).to.not.contain('lastName')
    })
  })

  describe('When an object contains boolean values', () => {
    it('leaves them untouched in simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        existingCustomer: true,
        hasOrders: false
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.equal(dirtyObject)
    })

    it('leaves them untouched in nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        orderStatus: {
          packed: true,
          shipped: false
        }
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.equal(dirtyObject)
    })

    it('leaves them untouched in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        preferences: [true, false, true]
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.equal(dirtyObject)
    })
  })

  describe('When an object contains number values', () => {
    it('leaves them untouched in simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        value: 120.3,
        lines: 5
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.equal(dirtyObject)
    })

    it('leaves them untouched in nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        orderDetails: {
          value: 121.33,
          lines: 6
        }
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.equal(dirtyObject)
    })

    it('leaves them untouched in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        lineValues: [10.0, 11.54, 2.99]
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.equal(dirtyObject)
    })
  })

  describe('When an object has values that contain characters like &, <, and >', () => {
    it('leaves them untouched in simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: 'Bert< & >Ernie'
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.equal(dirtyObject)
    })

    it('leaves them untouched in nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: 'Bert <',
          lastName: '>Ernie<'
        }
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.equal(dirtyObject)
    })

    it('leaves them untouched in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: ['A1&', 'B2<', 'C3>']
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.equal(dirtyObject)
    })
  })

  describe('When an object contains dangerous content', () => {
    it('removes it from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: '<script>alert(1)</script>'
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject).to.not.contain('customerName')
    })

    it('removes it from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: '<script>alert(1)</script>',
          lastName: 'Ernie'
        }
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.details).to.not.contain('firstName')
      expect(cleanedObject.details).to.contain('lastName')
    })

    it('removes it from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: ['ABD1', '<script>alert(1)</script>', 'C2']
      }

      const cleanedObject = ObjectCleaningService.go(dirtyObject)
      expect(cleanedObject.codes).to.equal(['ABD1', 'C2'])
    })
  })
})
