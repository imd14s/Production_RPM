import { parseQuantityInput } from "./quantity";

describe("parseQuantityInput", () => {
  it("accepts comma decimals", () => {
    expect(parseQuantityInput("0,812")).toBe(0.812);
    expect(parseQuantityInput("250")).toBe(250);
  });

  it("rounds to three decimal places", () => {
    expect(parseQuantityInput("0,1235")).toBe(0.124);
  });

  it("rejects zero, negatives and invalid text", () => {
    expect(parseQuantityInput("0")).toBeNull();
    expect(parseQuantityInput("-1")).toBeNull();
    expect(parseQuantityInput("abc")).toBeNull();
    expect(parseQuantityInput("")).toBeNull();
  });

  it("rejects absurd quantities", () => {
    expect(parseQuantityInput("1000001")).toBeNull();
  });
});
