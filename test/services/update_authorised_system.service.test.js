// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Additional dependencies needed
import { DataError } from 'objection'

// Thing under test
import UpdateAuthorisedSystemService from '../../app/services/update_authorised_system.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Update Authorised System service', () => {
  let adminAuthSystem
  let updateAuthSystem
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('ice', 'Ice')

    adminAuthSystem = await AuthorisedSystemHelper.addAdminSystem(null, 'admin', 'active', regime)
    updateAuthSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'UpdateMe', [regime])
  })

  describe('When a valid authorised system ID is supplied', () => {
    describe('and the payload contains a status change', () => {
      it('applies the update', async () => {
        const payload = { status: 'inactive' }
        const id = updateAuthSystem.id

        await UpdateAuthorisedSystemService.go(id, payload)

        const refreshedAuthSystem = await updateAuthSystem.$query()

        expect(refreshedAuthSystem.status).to.equal('inactive')
      })
    })

    describe('and the payload contains a name change', () => {
      it('applies the update', async () => {
        const payload = { name: 'fiddle' }
        const id = updateAuthSystem.id

        await UpdateAuthorisedSystemService.go(id, payload)

        const refreshedAuthSystem = await updateAuthSystem.$query()

        expect(refreshedAuthSystem.name).to.equal('fiddle')
      })
    })

    describe('and the payload contains a regime change', () => {
      let newRegime

      beforeEach(async () => {
        newRegime = await RegimeHelper.addRegime('fire', 'Fire')
      })

      it('applies the update', async () => {
        const payload = { regimes: [newRegime.slug] }
        const id = updateAuthSystem.id

        await UpdateAuthorisedSystemService.go(id, payload)

        const refreshedAuthSystem = await updateAuthSystem.$query().withGraphFetched('regimes')

        expect(refreshedAuthSystem.regimes.length).to.equal(1)
        expect(refreshedAuthSystem.regimes[0].slug).to.equal(newRegime.slug)
        expect(refreshedAuthSystem.regimes[0].id).to.equal(newRegime.id)
      })
    })

    describe('but the payload is empty', () => {
      it('throws an error', async () => {
        const id = updateAuthSystem.id
        const err = await expect(UpdateAuthorisedSystemService.go(id))
          .to
          .reject(Error, 'The payload was empty.')

        expect(err).to.be.an.error()
      })
    })

    describe('but the payload contains an invalid status', () => {
      it('throws an error', async () => {
        const payload = { status: 'Happy' }
        const id = updateAuthSystem.id
        const err = await expect(UpdateAuthorisedSystemService.go(id, payload))
          .to
          .reject(Error, `${payload.status} is not a valid status. Can only be active or inactive.`)

        expect(err).to.be.an.error()
      })
    })

    describe('but the payload contains an invalid name', () => {
      it('throws an error', async () => {
        const payload = { name: 'admin' }
        const id = updateAuthSystem.id
        const err = await expect(UpdateAuthorisedSystemService.go(id, payload))
          .to
          .reject(Error, `You cannot use the name ${payload.name}. There can be only one!`)

        expect(err).to.be.an.error()
      })
    })

    describe('but the payload contains an unknown regime', () => {
      it('throws an error', async () => {
        const payload = { status: 'active', regimes: ['ice', 'fire'] }
        const id = updateAuthSystem.id
        const err = await expect(UpdateAuthorisedSystemService.go(id, payload))
          .to
          .reject(Error, 'One or more of the regimes is unrecognised.')

        expect(err).to.be.an.error()
      })
    })
  })

  describe('When an invalid authorised system ID is supplied', () => {
    describe('because there is no matching authorised system', () => {
      it('throws an error', async () => {
        const id = GeneralHelper.uuid4()
        const err = await expect(UpdateAuthorisedSystemService.go(id))
          .to
          .reject(Error, `No authorised system found with id ${id}`)

        expect(err).to.be.an.error()
      })
    })

    describe("because it's the admin authorised system", () => {
      it('throws an error', async () => {
        const id = adminAuthSystem.id
        const err = await expect(UpdateAuthorisedSystemService.go(id))
          .to
          .reject(Error, 'You cannot update the main admin.')

        expect(err).to.be.an.error()
      })
    })

    describe('because the UUID is invalid', () => {
      it('returns throws an error', async () => {
        const err = await expect(UpdateAuthorisedSystemService.go('123456789'))
          .to
          .reject(DataError)

        expect(err).to.be.an.error()
      })
    })
  })
})
