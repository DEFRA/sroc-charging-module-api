# Versioning

The CM API is versioned in the usual way: paths start with the version number, eg: `/v1/...`, `/v2/...` etc. We begin the process of migrating to a new version when we introduce breaking changes to an existing endpoint.

## Versioning example

Say we have a series of routes under `/v1/`:
- `GET /v1/something`, with the handler `SomethingController.get`
- `POST /v1/something`, with the handler `SomethingController.post`
- `PATCH /v1/something`, with the handler `SomethingController.patch`

We will be adding a new parameter to `POST /v1/something` and changing the behaviour of `PATCH /v1/something`. We will therefore be migrating our routes to `/v2/`.

Our method of migration is to distinguish the current version from the incoming version by inserting the old version number wherever needed, and effectively treating the incoming version as "the new normal".

We begin by copying the existing handlers and inserting the old version number:
- `SomethingController.get` is copied to `SomethingController.getV1`
- `SomethingController.post` is copied to `SomethingController.postV1`
- `SomethingController.patch` is copied to `SomethingController.patchV1`

We update the routes file (ie. `something.routes.js`) to point the existing routes to these handlers:

```js
const routes = [
  {
    method: 'GET',
    path: '/v1/something',
    handler: SomethingController.getV1
  },
  {
    method: 'POST',
    path: '/v1/something',
    handler: SomethingController.postV1
  },
  {
    method: 'PATCH',
    path: '/v1/something',
    handler: SomethingController.patchV1
  }
]
```

### Endpoint with same behaviour

Since `GET`'s behaviour is not changing, we can simply add a route as follows:

```js
const routes = [
  ...
  {
    method: 'GET',
    path: '/v2/something',
    handler: SomethingController.get
  }
]
```

### Endpoint with different behaviour

The behaviour of `PATCH` is changing, so we first rename the existing service that it uses and update the `patchV1` controller accordingly:

```js
  static async patchV1 (req, h) {
    await PatchV1Service.go(req.app.something)
    return h.response().code(204)
  }
```

We then develop a new service and update the `patch` controller:

```js
  static async patch (req, h) {
    await PatchService.go(req.app.something, req.app.somethingElse)
    return h.response().code(204)
  }
```

Finally, we add the new route:

```js
const routes = [
  ...
  {
    method: 'PATCH',
    path: '/v2/something',
    handler: SomethingController.patch
  }
]
```

### Endpoint with different parameters

We are adding a new optional parameter to the `POST` endpoint. In `v1`, the value of `xyzzy` was always `plugh` and we therefore hardcoded this. In `v2` we allow the value of `xyzzy` to be specified, but we will now be defaulting to `plover`. Other than this, the behaviour of the endpoint is the same.

Since our policy is to treat `v2` as "the new normal", we do whatever we need to do in order to default the value of `xyzzy` to `plover` -- for example, updating a translator:

```js
  _schema () {
    return Joi.object({
      ...
      xyzzy: Joi.string().default('plover')
    })
  }
```

Say our controller looked like this:

```js
  static async post (req, h) {
    const result = await PostSomething.go(req.payload)
    return h.response(result).code(201)
  }
```

We update the `postV1` controller to set the value of `xyzzy` to `plugh`:

```js
  static async postV1 (req, h) {
    // Set V1 default
    req.payload.xyzzy = 'plugh'

    const result = await PostSomething.go(req.payload)
    return h.response(result).code(201)
  }
```

As a safeguard against accidentally using the `v1` endpoint instead of the `v2` endpoint, we also add in a check for `xyzzy` in the payload. If it's present then the request will be rejected. Otherwise, we default it to `plugh`. This will not catch every accidental access -- for example, not including `xyzzy` in the payload is valid for both versions. However, we can at least do what we can to ensure that the right endpoint is being accessed:

```js
  static async postV1 (req, h) {
    // Service to validate the v1 request
    await PostSomethingV1Guard.go(req.payload)

    // Set v1 default
    req.payload.xyzzy = 'plugh'

    const result = await PostSomething.go(req.payload)
    return h.response(result).code(201)
  }
```

And finally, as before we ensure we have our `POST /v2/something` route added to `routes.js`.
