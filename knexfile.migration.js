'use strict'

/**
 * We use knexSnakeCaseMappers to map camelCase in the code to snake_case in the databaes. Unfortunately this causes
 * issues with some of the migrations. We therefore use a separate knexfile for migration, which is the same as the
 * main knexfile but we delete from each environment config wrapIdentifer and postProcessResponse, which are added by
 * knexSnakeCaseMappers.
 */

const knexfile = require('./knexfile')

for (const environment in knexfile) {
  delete knexfile[environment].wrapIdentifier
  delete knexfile[environment].postProcessResponse
}

module.exports = { ...knexfile }
