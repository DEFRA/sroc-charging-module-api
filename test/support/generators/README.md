# Generators

> Currently, only a bill run generator is provided but there is scope to add more if needed

We use generators as part of our testing of the API. To assess performance of actions, and to give us realistic volumes of data for our views we need a way to generate large bill runs. We know the largest can have in excess of 9,000 transactions and 2,500 invoices.

Generators allow us to create this volume of data quickly and avoid

- the overhead of sending thousands of transaction requests across the network
- 'spamming' the rules service just for testing purposes

They follow the convention of [services](/app/services) being `static` and with a single `go()` method to initate the action. But unlike the main application code, we are comfortable with these not having specific unit tests. Integration tests through the `/admin/test/{regimeId}/bill-runs/generate` is sufficient.

They also rely heavily on test helpers and libraries. It's for these reasons they sit here in `/test/support/generators'.
