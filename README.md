# TransferWise

> An open-source TransferWise API client for Node.JS

`npm install @fightmegg/transferwise`

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
tw.profiles();
```

**borderlessAccounts**

```js
tw.borderlessAccounts("<profileId>");
```

**recipientAccounts**

```js
tw.recipientAccounts.create("<accounts object>");
tw.recipientAccounts.get("<accountId>");
tw.recipientAccounts.delete("<accountId>");
tw.recipientAccounts.list("<account url params>");
```

**quotes**

```js
tw.quotes.temporary("<quote url params>");
tw.quotes.create("<quote object>");
tw.quotes.get("<quoteId>");
```

**transfers**

```js
tw.transfers.create("<transfer object>");
tw.transfers.cancel("<transfer object>");
tw.transfers.get("<transferId>");
tw.transfers.issues("<transferId>");
tw.transfers.fund("<profileId>", "<transferId>");
tw.transfers.deliveryEstimate("<transferId>");
tw.transfers.list("<transfer url params>");
```

**simulation**

```js
tw.simulation.transfers.processing("<transferId>");
tw.simulation.transfers.fundsConverted("<transferId>");
tw.simulation.transfers.outgoingPaymentSent("<transferId>");
tw.simulation.transfers.bouncedBack("<transferId>");
tw.simulation.transfers.fundsRefunded("<transferId>");
```

**webhooks**

```js
tw.webhooks.constructEvent("<webhookMsg>", "<signature>");
```
