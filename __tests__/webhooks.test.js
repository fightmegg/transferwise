import { constructEvent } from "../webhooks";

const testEvent = { message: "this is a test request" };

const testSignature =
  "nuF2qJysTIFnZEP4xKlpAA2j2uSGCdyAmd7ptzaNcucS0AfC/dk0G/TI0Hlwrk8soskfEkSKhH6EcZhkog2c3BCqqj8++PvOBvH7ZDiYtPPelqivD2hniV2pjUzeEam2+83axiVvMNlHr5CdOU4iMN+1DJIBpv/xeX7LZ0D8ACEw9r565gtMKobvyiiGc4XKNsmfWk3wzJVzKGTU7NYzcS6omXqU/NYhoLjJn5xy4aGuf9AVKGUkRDafwTqVcvLOFV9IPDvjIk6IgjwqBbgpxl2ob2nFeATvVfLMKyPvKgwFANDUOdANiaVMTXqIrQgt8LFlp5a8apM/5iDjy2pwIg==";

describe("Webhooks", () => {
  describe("constructEvent", () => {
    test("it is a function", () => {
      expect(constructEvent).toBeInstanceOf(Function);
    });

    test("it returns event if verified to be true", () => {
      const event = constructEvent(
        true,
        JSON.stringify(testEvent),
        testSignature
      );
      expect(event).toEqual(testEvent);
    });

    test("it returns null if verification is false", () => {
      const event = constructEvent(
        false,
        JSON.stringify(testEvent),
        testSignature
      );
      expect(event).toBeNull();
    });
  });
});
