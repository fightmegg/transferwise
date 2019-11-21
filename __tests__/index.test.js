import fetch from "node-fetch";
import TransferWise from "../index";
import { constructEvent } from "../webhooks";

jest.mock("node-fetch", () => jest.fn());

jest.mock("../webhooks", () => ({
  __esModule: true,
  constructEvent: jest.fn()
}));

describe("TransferWise", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("constructor", () => {
    test("it THROWS if no token is given", () => {
      const tw = () => new TransferWise();
      expect(tw).toThrowError(new Error("token is required"));
    });

    test("it sets instance variables correctly for sandbox", () => {
      const tw = new TransferWise({ token: "1234", sandbox: true });
      expect(tw.token).toEqual("1234");
      expect(tw.sandbox).toEqual(true);
      expect(tw.url).toEqual("https://api.sandbox.transferwise.tech");
    });

    test("it sets instance variables correctly for live", () => {
      const tw = new TransferWise({ token: "1234" });
      expect(tw.token).toEqual("1234");
      expect(tw.sandbox).toEqual(false);
      expect(tw.url).toEqual("https://api.transferwise.com");
    });
  });

  describe("request", () => {
    beforeEach(() => {
      fetch.mockReturnValue({ then: jest.fn() });
    });

    test("it calls fetch with defaults", () => {
      const tw = new TransferWise({ token: "1234", sandbox: true });
      tw.request();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        "https://api.sandbox.transferwise.tech/v1",
        {
          method: "GET",
          json: true,
          headers: {
            Authorization: `Bearer 1234`,
            "Content-Type": "application/json",
            "cache-control": "no-cache"
          }
        }
      );
    });

    test("it calls fetch with custom version & path", () => {
      const tw = new TransferWise({ token: "1234", sandbox: true });
      tw.request({ version: "v3", path: "/profiles" });
      expect(fetch).toHaveBeenCalledWith(
        "https://api.sandbox.transferwise.tech/v3/profiles",
        expect.any(Object)
      );
    });

    test("it calls fetch with custom method & json body", () => {
      const tw = new TransferWise({ token: "1234", sandbox: true });
      tw.request({
        version: "v3",
        path: "/profiles",
        method: "POST",
        body: { type: "BALANCE" }
      });
      expect(fetch).toHaveBeenCalledWith(
        "https://api.sandbox.transferwise.tech/v3/profiles",
        {
          method: "POST",
          json: true,
          body: JSON.stringify({ type: "BALANCE" }),
          headers: expect.any(Object)
        }
      );
    });
  });

  describe("profiles", () => {
    test('it calls request with { path: "/profiles" }', () => {
      const tw = new TransferWise({ token: "1234", sandbox: true });
      tw.request = jest.fn();
      tw.profiles();
      expect(tw.request).toHaveBeenCalledWith({ path: "/profiles" });
    });
  });

  describe("borderlessAccounts", () => {
    test('it calls request with { path: "/borderless-accounts?profileId=2486" }', () => {
      const tw = new TransferWise({ token: "1234", sandbox: true });
      tw.request = jest.fn();
      tw.borderlessAccounts(2486);
      expect(tw.request).toHaveBeenCalledWith({
        path: "/borderless-accounts?profileId=2486"
      });
    });
  });

  describe("recipientAccounts", () => {
    test.each([
      [
        "create",
        { method: "POST", path: "/accounts", body: { profile: 2486 } },
        { profile: 2486 }
      ],
      ["get", { path: "/accounts/222222" }, 222222],
      ["delete", { method: "DELETE", path: "/accounts/222222" }, 222222],
      ["list", { path: "/accounts?currency=GBP" }, { currency: "GBP" }]
    ])(".%s calls request with %o", (fn, params, input) => {
      const tw = new TransferWise({ token: "1234", sandbox: true });
      tw.request = jest.fn();
      tw.recipientAccounts[fn](input);
      expect(tw.request).toHaveBeenCalledWith(params);
    });
  });

  describe("quotes", () => {
    test.each([
      ["temporary", { path: "/quotes?source=GBP" }, { source: "GBP" }],
      [
        "create",
        { method: "POST", path: "/quotes", body: { profile: 2486 } },
        { profile: 2486 }
      ],
      ["get", { path: "/quotes/222222" }, 222222]
    ])(".%s calls request with %o", (fn, params, input) => {
      const tw = new TransferWise({ token: "1234", sandbox: true });
      tw.request = jest.fn();
      tw.quotes[fn](input);
      expect(tw.request).toHaveBeenCalledWith(params);
    });
  });

  describe("transfers", () => {
    test.each([
      [
        "create",
        { method: "POST", path: "/transfers", body: { targetAccount: 222222 } },
        { targetAccount: 222222 },
        null
      ],
      [
        "cancel",
        { method: "PUT", path: "/transfers/222222/cancel" },
        222222,
        null
      ],
      ["get", { path: "/transfers/222222" }, 222222, null],
      ["issues", { path: "/transfers/222222/issues" }, 222222, null],
      [
        "fund",
        {
          method: "POST",
          version: "v3",
          path: "/profiles/2486/transfers/222222/payments",
          body: { type: "BALANCE" }
        },
        2486,
        222222
      ],
      [
        "deliveryEstimate",
        { path: "/delivery-estimates/222222" },
        222222,
        null
      ],
      ["list", { path: "/transfers?profile=2486" }, { profile: 2486 }, null]
    ])(".%s calls request with %o", (fn, params, input, input2) => {
      const tw = new TransferWise({ token: "1234", sandbox: true });
      tw.request = jest.fn();
      tw.transfers[fn](input, input2);
      expect(tw.request).toHaveBeenCalledWith(params);
    });
  });

  describe("simulation", () => {
    describe("transfers", () => {
      test.each([
        [
          "processing",
          { path: "/simulation/transfers/222222/processing" },
          222222
        ],
        [
          "fundsConverted",
          { path: "/simulation/transfers/222222/funds_converted" },
          222222
        ],
        [
          "outgoingPaymentSent",
          { path: "/simulation/transfers/222222/outgoing_payment_sent" },
          222222
        ],
        [
          "bouncedBack",
          { path: "/simulation/transfers/222222/bounced_back" },
          222222
        ],
        [
          "fundsRefunded",
          { path: "/simulation/transfers/222222/funds_refunded" },
          222222
        ]
      ])(".%s calls request with %o", (fn, params, input) => {
        const tw = new TransferWise({ token: "1234", sandbox: true });
        tw.request = jest.fn();
        tw.simulation.transfers[fn](input);
        expect(tw.request).toHaveBeenCalledWith(params);
      });
    });
  });

  describe("webhooks", () => {
    describe("constructEvent", () => {
      test("constructEvent calls constructEvent with (sandbox=true, payload, signature)", () => {
        const tw = new TransferWise({ token: "1234", sandbox: true });
        tw.webhooks.constructEvent("payload", "signature");
        expect(constructEvent).toHaveBeenCalledTimes(1);
        expect(constructEvent).toHaveBeenCalledWith(
          true,
          "payload",
          "signature"
        );
      });

      test("constructEvent calls constructEvent with (sandbox=true, payload, signature)", () => {
        const tw = new TransferWise({ token: "1234", sandbox: false });
        tw.webhooks.constructEvent("payload", "signature");
        expect(constructEvent).toHaveBeenCalledTimes(1);
        expect(constructEvent).toHaveBeenCalledWith(
          false,
          "payload",
          "signature"
        );
      });
    });
  });
});
