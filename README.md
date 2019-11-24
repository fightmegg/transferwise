# TransferWise Node.js Library

[![Version](https://img.shields.io/npm/v/@fightmegg/transferwise.svg)](https://www.npmjs.com/package/@fightmegg/transferwise)
[![Downloads](https://img.shields.io/npm/dm/@fightmegg/transferwise.svg)](https://www.npmjs.com/package/@fightmegg/transferwise)
[![CircleCI](https://circleci.com/gh/fightmegg/transferwise/tree/master.svg?style=svg)](https://circleci.com/gh/fightmegg/transferwise/tree/master)

> An open-source TransferWise API client for Node.JS

The TransferWise Node library provides convient access to the TransferWise API from applications written in server-side JavaScript.

## Documentation

See the [TransferWise API docs](https://api-docs.transferwise.com/#transferwise-api) for the offical docs, below is a list of methods supported by this library.

## Installation

Install the package with:

```sh
npm install @fightmegg/transferwise
```

**NB: Requires Node >= 12**

## Usage

```js
import TransferWise from '@fightmegg/transferwise';

const tw = new TransferWise({ token: ..., sandbox: true });
const profiles = await tw.profiles();
```

## Methods

Currently only supports methods listed below. Aim to support all API methods _soon_.

**profiles**

```js
await tw.profiles();
```

**borderlessAccounts**

```js
await tw.borderlessAccounts("<profileId>");
```

**recipientAccounts**

```js
await tw.recipientAccounts.create("<accounts object>");
await tw.recipientAccounts.get("<accountId>");
await tw.recipientAccounts.delete("<accountId>");
await tw.recipientAccounts.list("<account url params>");
```

**quotes**

```js
await tw.quotes.temporary("<quote url params>");
await tw.quotes.create("<quote object>");
await tw.quotes.get("<quoteId>");
```

**transfers**

```js
await tw.transfers.create("<transfer object>");
await tw.transfers.cancel("<transfer object>");
await tw.transfers.get("<transferId>");
await tw.transfers.issues("<transferId>");
await tw.transfers.fund("<profileId>", "<transferId>");
await tw.transfers.deliveryEstimate("<transferId>");
await tw.transfers.list("<transfer url params>");
```

**simulation**

```js
await tw.simulation.transfers.processing("<transferId>");
await tw.simulation.transfers.fundsConverted("<transferId>");
await tw.simulation.transfers.outgoingPaymentSent("<transferId>");
await tw.simulation.transfers.bouncedBack("<transferId>");
await tw.simulation.transfers.fundsRefunded("<transferId>");
```

## Webhook Verification

TransferWise signs all Webhook events, and it is recommended that you [verify this signature](https://api-docs.transferwise.com/#webhook-events-list-signature-header) . Luckily this library can do that for you.

Similarly to how `stripe node` works, you should only use the event returned from the method below.

```js
const event = tw.webhooks.constructEvent("<webhookMsg>", "<signature>");
```

Please note that you must pass the **raw** request body, exactly as recieved from TransferWise to the `constructEvent()` function; this will not work with a parsed (i.e., JSON) request body.

You can find an example of how to use this with [Express](https://expressjs.com/) below:

```js
app.post("/", bodyParser.raw({ type: "application.json" }), (req, res) => {
  const sig = req.headers["x-signature"];
  const event = tw.webhooks.constructEvent(req.body, sig);
  // ...
});
```

## Development

Run all tests:

```bash
$ npm test
```

This library is published to both the NPM and GitHub package registrys.
