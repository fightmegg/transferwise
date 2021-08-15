import fetch from "node-fetch";
import crypto from "crypto";
import { encode } from "querystring";
import { constructEvent } from "./webhooks";

const SANDBOX_URL = "https://api.sandbox.transferwise.tech";
const LIVE_URL = "https://api.transferwise.com";

const VERSION = "v1";

class TransferWise {
  constructor({ token, privateKey = false, sandbox = false } = {}) {
    if (!token) throw new Error("token is required");

    this.token = token;
    this.sandbox = sandbox;
    this.url = sandbox ? SANDBOX_URL : LIVE_URL;
    this.privateKey = privateKey
  }

  request({ method = "GET", path = "", body, version } = {}) {
    const apiVersion = `/${version || VERSION}`;
    const url = this.url + apiVersion + path;
    const fetchOptions = {
      method,
      json: true,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "cache-control": "no-cache"
      }
    };
    if (body) fetchOptions.body = JSON.stringify(body);

    const scaRequestHandler = resp => {
      if (resp.status !== 403) return resp;
      if (resp.headers.get('X-2FA-Approval-Result') !== 'REJECTED') return resp;

      if (this.privateKey === false) {
        throw new Error("private key is required to access SCA-protected endpoints");
      }

      const oneTimeToken = resp.headers.get('X-2FA-Approval');
      const signedOTT = this.constructor.utils.signOTT(this.privateKey, oneTimeToken);
      fetchOptions.headers["X-2FA-Approval"] = oneTimeToken;
      fetchOptions.headers["X-Signature"] = signedOTT;
      return fetch(url, fetchOptions);
    };

    const scaCapableFetch = () => fetch(url, fetchOptions).then(scaRequestHandler);
    if (method === "DELETE") return scaCapableFetch();
    return scaCapableFetch().then(resp => resp.json());
  }

  me() {
    return this.request({ path: "/me" });
  }

  profiles() {
    return this.request({ path: "/profiles" });
  }

  borderlessAccounts(profileId) {
    return this.request({
      path: `/borderless-accounts?profileId=${profileId}`
    });
  }

  statement(profileId, accountId, currency, { intervalStart, intervalEnd }) {
    const params = {
      currency,
      intervalStart: intervalStart.toISOString(),
      intervalEnd: intervalEnd.toISOString(),
      type: "COMPACT"
    };

    return this.request({ path: `/profiles/${profileId}/borderless-accounts/${accountId}/statement.json?${encode(params)}`, version: "v3" });
  }

  get recipientAccounts() {
    return {
      create: accountDetails =>
        this.request({
          method: "POST",
          body: accountDetails,
          path: "/accounts"
        }),
      get: accountId => this.request({ path: `/accounts/${accountId}` }),
      delete: accountId =>
        this.request({ method: "DELETE", path: `/accounts/${accountId}` }),
      list: params => this.request({ path: `/accounts?${encode(params)}` })
    };
  }

  get quotes() {
    return {
      temporary: params => this.request({ path: `/quotes?${encode(params)}` }),
      create: quoteDetails =>
        this.request({ method: "POST", body: quoteDetails, path: "/quotes" }),
      get: quoteId => this.request({ path: `/quotes/${quoteId}` })
    };
  }

  get transfers() {
    return {
      create: transferDetails =>
        this.request({
          method: "POST",
          body: transferDetails,
          path: "/transfers"
        }),
      cancel: transferId =>
        this.request({
          method: "PUT",
          path: `/transfers/${transferId}/cancel`
        }),
      get: transferId => this.request({ path: `/transfers/${transferId}` }),
      issues: transferId =>
        this.request({ path: `/transfers/${transferId}/issues` }),
      fund: (profileId, transferId) =>
        this.request({
          method: "POST",
          version: "v3",
          body: { type: "BALANCE" },
          path: `/profiles/${profileId}/transfers/${transferId}/payments`
        }),
      deliveryEstimate: transferId =>
        this.request({ path: `/delivery-estimates/${transferId}` }),
      list: params => this.request({ path: `/transfers?${encode(params)}` })
    };
  }

  get simulation() {
    return {
      transfers: {
        processing: transferId =>
          this.request({
            path: `/simulation/transfers/${transferId}/processing`
          }),
        fundsConverted: transferId =>
          this.request({
            path: `/simulation/transfers/${transferId}/funds_converted`
          }),
        outgoingPaymentSent: transferId =>
          this.request({
            path: `/simulation/transfers/${transferId}/outgoing_payment_sent`
          }),
        bouncedBack: transferId =>
          this.request({
            path: `/simulation/transfers/${transferId}/bounced_back`
          }),
        fundsRefunded: transferId =>
          this.request({
            path: `/simulation/transfers/${transferId}/funds_refunded`
          })
      }
    };
  }

  get webhooks() {
    return {
      constructEvent: (body, signature) =>
        constructEvent(this.sandbox, body, signature)
    };
  }

  static get utils() {
    return {
      signOTT(pKey, ott) {
        const sign = crypto.createSign("RSA-SHA256");
        sign.update(ott);
        return sign.sign(pKey).toString("base64");
      }
    };
  }
}

export default TransferWise;
