# Services

## What is a service?

"Service" is the name we give to a certain type of module in the CM. They typically have one task (eg. creating a transaction, or marshalling the customer file sending process) and are called with the `go()` method -- all other methods of a service should be considered private, and we preface them with an underscore to emphasise this. We document our services using [JSDoc](https://jsdoc.app/).

A simple example of a service would be:

```js
'use strict'

/**
 * @module GreeterService
 */

class GreeterService {
  /**
   * Service to say hello.
   *
   * @param {String} name Person to be greeted.
   * @returns {String} A friendly greeting.
   */
  static go (name) {
    return this._greeting(name)
  }

static _greeting (name) {
    return `Hello, ${name}!`
  }
}

module.exports = GreeterService
```

This would then be used as follows:

```js
const GreeterService = require('./greeter.service.js')
const greeting = GreeterService.go('world')
console.log(greeting)
```
Resulting in:
```
Hello, world!
```

## How do we organise them?

We put our services in folders according to the entity they operate on (which we sometimes refer to as their "noun"). So for example, the service to create a transaction lives in `transactions/`.

We also organise further where deemed necessary. For example, the service that marshals the customer file sending process lives in `files/customers/` alongside all other services specific to that process, while the more general services used in the process (eg. the service that sends a given file to S3) live in `files/`.

Some services may operate on multiple nouns, in which case attention should be paid to the "main" noun it deals with. For example, the service that verifies that a licence is linked to a bill run lives in `licence/` as its intent is to confirm that a licence is valid.

Note that we generally only create a folder once there are multiple services dealing with an entity; if we only have one service dealing with a particular thing then we leave it in `services/`.

## How do we name them?

In general, a service's name will include its noun for clarity. Multiple nouns should be avoided where possible; only include them if they have equal weighting in the service's operation. For example, the service that verifies a licence is linked to a bill run is called `ValidateBillRunLicenceService` because although it lives in `licence/`, the bill run is equally important to its operation.

## Are there any exceptions?

The `plugins/` folder is a slight exception to the above; this is where services live which are exclusively called by plugins, regardless of their noun. So for example `RequestLicenceService`, which is solely used by the `RequestLicencePlugin`, lives in `plugins/` and not `licences/`.

## And finally...

Remember that you can always speak to your fellow devs if you're unsure about any of this, and we can always make changes later if needs be!
