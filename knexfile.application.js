import Objection from 'objection'

/**
 * Passing in `knexSnakeCaseMappers` allows us to use camelCase everywhere and knex will convert it to snake_case on
 * the fly.
 *
 * This means when we access a property on the model we can use camelCase even if the underlying database property
 * was snake_case. It also means we get camelCase object keys, handy when you need to return a db query result as is
 * in a response.
 *
 * @see {@link https://vincit.github.io/objection.js/recipes/snake-case-to-camel-case-conversion.html}
 *
 * We set the `underscoreBeforeDigits` option so that properties like lineAttr1 are correctly changed to line_attr_1.
 *
 * However this causes issues with migrations as it still applies the underscore before the digit even if the rest of
 * the name is snake case. So for example, a migration to create line_attr_1 will actually create line_attr__1. We
 * therefore only add `knexSnakeCaseMappers` when running the application to ensure that it isn't applied to
 * migrations.
 *
 *
 */

import * as knexfile from './knexfile.js'

for (const environment in knexfile) {
  Object.assign(knexfile[environment], Objection.knexSnakeCaseMappers({ underscoreBeforeDigits: true }))
}

export const environments = { ...knexfile }
