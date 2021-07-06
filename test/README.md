# Test guidance

## Authenticating with JWTs

[Oauth2](https://oauth.net/2/) is the pattern used to authenticate with the API. Client systems use [JSON Web Tokens (JWTs)](https://jwt.io/) generated after authenticating with [AWS Cognito](https://aws.amazon.com/cognito/). These are added to an `Authorization` header as a [Bearer token](https://oauth.net/2/bearer-tokens) in the request to the API.

[hapi-now-auth](https://github.com/now-ims/hapi-now-auth) is the plugin we use to implement a JWT based [Hapi authentication strategy](https://hapi.dev/tutorials/auth). Whenever a request is made the plugin handles extracting the bearer token, verifying it came from AWS Cognito, and decoding it. We then extract the `clientId` from the payload which is how we determine the client system trying to authenticate.

### Authenticating in the tests

Buried in the **hapi-now-auth** plugin is a call to `jsonwebtoken.verify()`. We can't emulate how AWS Cognito emulates and signs JWTs so this will always fail with the JWTs we create in our tests. To solve this you will see most tests will use [Sinon to stub](https://sinonjs.org/releases/v9.2.0/stubs/) the method.

This allows us to return a decoded version of the tokens we generate in the tests. Because of this you will see this pattern frequently in the tests.

- Generate a token using [AuthorisationHelper](test/support/helpers/authorisation.helper.js)
- `require()` **jsonwebtoken** so we can stub it using **Sinon**
- Stub `verify()` to return a decoded version of the token also provided by `AuthorisationHelper`

```javascript
//...

import Sinon from 'sinon'

const AuthorisationHelper = require('../support/helpers/authorisation.helper')

const JsonWebToken = require('jsonwebtoken')

describe('Some controller: GET /path/to/endpoint', () => {
  const authToken = AuthorisationHelper.adminToken()

  before(async () => {

    // ...

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  after(async () => {
    Sinon.restore()
  })

  it('displays the correct message', async () => {
    // ...
  })
})
```
