# App folder

`/app` is the root folder for the code that makes up the [Hapi web service](https://hapi.dev/) which _is_ the Charging Module.

> WIP - We'll be adding a breakdown of what each of the subfolders contains and is used for in the future.

- 📂 [Services folder](services.md)

## Versioning

Information on our versioning can be found in [versioning.md](versioning.md).

## Refactoring for ruleset changes

The financial year a charge is applicable to determines the ruleset used. In the context of the API this means we'll be calling a different Rules Service endpoint and might mean we need to validate data differently or amend the behaviour of a service.

Each API endpoint is expected to handle requests across _all_ rulesets. However, a **bill run** only supports one kind of ruleset; a single **bill run** cannot contain both PRE-SROC and SROC transactions. In a the case a change is needed the following outlines an example of how to go about it.

It is based on an imaginary 'Transaction Charge Details' endpoint that when requested with a **bill run** and **transaction** ID returns the fields which were passed to the rules service to calculate the charge. We're also using the introduction of an SROC rulset to the existing PRESROC ruleset.

> **Important!** It is a given that as part of the refactoring unit tests are either updated or added to cover the changes in behaviour

### Controllers

Our intent is that the controller does not change at all. It should continue to call the generic service, for example, `ViewTransactionChargeService`.

```javascript
  static async view (req, h) {
    const result = await ViewTransactionChargeService.go(req.app.billRun, req.params.transactionId)

    return h.response(result).code(200)
  }
```

### Services

This is where we expect most refactoring to happen. The key change is that the role of the main service should change from handling the request to determining which ruleset based service should.

#### Main service

Imagine the service before refactoring looked like this.

```javascript
class ViewTransactionChargeService {
  static async go (billRun, transactionId) {
    let transaction = await this._transaction(transactionId)

    return this._response(transaction)
  }

  static _transaction (transactionId) {
    return TransactionModel.query().findById(transactionId)
  }

  static _response (transaction) {
    const presenter = new ViewTransactionChargePresenter(transaction)

    return presenter.go()
  }
}
```

The contents should first be copy & pasted into 2 new services; `ViewTransactionChargePresrocService` and `ViewTransactionChargeSrocService`. Then the service should be refactored to become the 'router' i.e. the thing which determines which of the ruleset based services to call when a request comes in.

```javascript
class ViewTransactionChargeService {
  static async go (billRun, transactionId) {
    switch (billRun.ruleset) {
      case 'sroc':
        return ViewTransactionChargeSrocService.go(billRun, transactionId)
      case 'presroc':
        return ViewTransactionChargePresrocService.go(billRun, transactionId)
      default:
        throw Error('Unrecognised ruleset')
    }
  }
}
```

#### Ruleset services

With 2 ruleset based services we are now free to refactor as required. In our example the key difference will be which presenter is used to generate the response (see the [Translators and Presenters](#transalators-and-presenters) for details about the presenter refactoring).

```javascript
class ViewTransactionChargeSrocService {
  static async go (billRun, transactionId) {
    let transaction = await this._transaction(transactionId)

    return this._response(transaction)
  }

  static _transaction (transactionId) {
    return TransactionModel.query().findById(transactionId)
  }

  static _response (transaction) {
    const presenter = new ViewTransactionChargeSrocPresenter(transaction) // <- This line!

    return presenter.go()
  }
}
```

```javascript
class ViewTransactionChargePresrocService {
  static async go (billRun, transactionId) {
    let transaction = await this._transaction(transactionId)

    return this._response(transaction)
  }

  static _transaction (transactionId) {
    return TransactionModel.query().findById(transactionId)
  }

  static _response (transaction) {
    const presenter = new ViewTransactionChargePresrocPresenter(transaction) // <- This line!

    return presenter.go()
  }
}
```

Depending on the service and the changes needed between the rulesets it could more than this. The intent is that by creating these new services we have the flexibility to make them whilst still serving all requests through a single endpoint.

#### Common service

Once the ruleset services are created and the required behaviour is confirmed the final step in refactoring is to review what is the same across the 2 services and refactor them into a _common service_.

In our example `go()` and `_transaction()` is exactly the same. Only `_response()` is changed across the 2 services. So, we would create a new `ViewTransactionChargeCommonService`.

```javascript
class ViewTransactionChargeCommonService {
  static async go (billRun, transactionId) {
    let transaction = await this._transaction(transactionId)

    return this._response(transaction)
  }

  static _transaction (transactionId) {
    return TransactionModel.query().findById(transactionId)
  }

  static _response (invoice) {
    throw Error("Extending service must implement '_response()'")
  }
}
```

Note that the common `_response()` method will throw an error to ensure it is not inadvertently used. The ruleset based services can then undergo a final change. Instead of duplicating functionality they extend the common service and only implement their own version of `_response()`.

```javascript
class ViewTransactionChargeSrocService extends ViewTransactionChargeCommonService {
  static _response (transaction) {
    const presenter = new ViewTransactionChargeSrocPresenter(transaction)

    return presenter.go()
  }
}
```

```javascript
class ViewTransactionChargePresrocService extends ViewTransactionChargeCommonService {
  static _response (transaction) {
    const presenter = new ViewTransactionChargePresrocPresenter(transaction)

    return presenter.go()
  }
}
```

### Translators and Presenters

Continuing our example we'll focus on presenters but refactoring of translators and presenters across rulesets will be the same.

The key difference from services is that there is no 'main' presenter. The determination of what the ruleset is and therefore which class types need to be used is made just once in the 'main' service. The ruleset services which just reference the ruleset presenters directly.

Imagine the `ViewTransactionChargePresenter` before refactoring looks like this.

```javascript
class ViewTransactionChargePresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      billableDays: data.regimeValue4,
      abstractableDays: data.regimeValue5,
      volume: data.lineAttr5,
      source: data.regimeValue6,
      season: data.regimeValue7,
      loss: data.regimeValue8,
      secondPartCharge: data.regimeValue16,
      compensationCharge: data.regimeValue17,
      eiucSource: data.regimeValue13,
      waterUndertaker: data.regimeValue14,
      region: data.regimeValue15,
      s127Agreement: data.regimeValue12,
      s130Agreement: data.regimeValue9,
      abatementAdjustment: data.regimeValue11
    }
  }
}
```

The existing presenter should be renamed.

```bash
git mv app/presenters/view_transaction_charge.presenter.js app/presenters/view_transaction_charge_presroc.presenter.js
```

This should then be copied as `app/presenters/view_transaction_charge_sroc.presenter.js`. Finally, the new `ViewTransactionChargeSrocPresenter` should be updated based on whatever changes are needed for the new ruleset.

```javascript
class ViewTransactionChargePresrocPresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      billableDays: data.regimeValue4,
      abstractableDays: data.regimeValue5,
      volume: data.lineAttr5,
      source: data.regimeValue6,
      season: data.regimeValue7,
      loss: data.regimeValue8,
      secondPartCharge: data.regimeValue16,
      compensationCharge: data.regimeValue17,
      eiucSource: data.regimeValue13,
      waterUndertaker: data.regimeValue14,
      region: data.regimeValue15,
      s127Agreement: data.regimeValue12,
      s130Agreement: data.regimeValue9,
      abatementAdjustment: data.regimeValue11
    }
  }
}

# ...

class ViewTransactionChargeSrocPresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      billableDays: data.regimeValue4,
      favouriteColour: data.regimeValue12,
      favouriteIcecream: data.regimeValue9,
      superheroPower: data.regimeValue11
    }
  }
}
```

### Why this way?

We have adopted this process for the following reasons

- Where we want things to remain the same, for example the controllers, it means nothing has to change
- Refactoring the main service as a 'router' enables us to be flexible if and when further changes are added, for example new rulesets or regimes
- Splitting things by ruleset also gives us the flexibility to make whatever changes are needed
- We hope it is easier for new team members to _follow the code_. There is no cleverness or meta-programming used. Code directly references other code it uses
- We also hope it makes it easier to identify the differences and commonality across rulesets
