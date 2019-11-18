import fetch from "node-fetch";
import { encode } from "querystring";

const SANDBOX_URL = "https://api.sandbox.transferwise.tech";
const LIVE_URL = "https://api.transferwise.com";

const VERSION = "v1";

class TransferWise {
  constructor({ token, sandbox = false } = {}) {
    if (!token) throw new Error("token is required");

    this.token = token;
    this.sandbox = sandbox;
    this.url = sandbox ? SANDBOX_URL : LIVE_URL;
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
    return fetch(url, fetchOptions).then(resp => resp.json());
  }

  profiles() {
    return this.request({ path: "/profiles" });
  }

  borderlessAccounts(profileId) {
    return this.request({
      path: `/borderless-accounts?profileId=${profileId}`
    });
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
}

export default TransferWise;
