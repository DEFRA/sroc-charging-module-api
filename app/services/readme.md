# Services

"Service" is the name we give to a certain type of module in the CM. They typically have one task (eg. creating a transaction, or marshalling the customer file sending process) and are called with the `go()` method -- all other methods of a service should be considered private.

We organise them in folders according to the entity they operate on (which we sometimes refer to as their "noun"). So for example, the service to create a transaction lives in `transactions/`.

We also organise further where deemed necessary. For example, the service to marshall the customer file sending process lives in `files/customers/` alongside all other services specific to that process, while the more general services used in the process (eg. the service that sends a given file to S3) live in `files/`.

Some services may operate on multiple nouns, in which case attention should be paid to the "main" noun it deals with. For example, the service that verifies that a licence is linked to a bill run lives in `licence/` as its intent is to confirm that a licence is valid.

In general, a service's name will include its noun for clarity. Multiple nouns should be avoided where possible; only include them if they have equal weighting in the service's operation. For example, the service that verifies a licence is linked to a bill run is called `ValidateBillRunLicenceService` because although it lives in `licence/`, the bill run is equally important to its operation.

We generally only create a folder once there are multiple services dealing with an entity -- if we only have one service dealing with a particular thing then we will leave it in `services/`.

The `plugins/` folder is a slight exception to the above; this is where services live which are exclusively called by plugins, regardless of its noun. So for example `RequestLicenceService`, which is solely used by the `RequestLicencePlugin`, lives in `plugins/` and not `licences/`.

