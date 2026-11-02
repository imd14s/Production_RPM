import { convertQuantity } from "./units";

describe("convertQuantity", () => {
  it("converts using the factor", () => {
    expect(convertQuantity(2, 1000)).toBe(2000);
  });

  it("handles fractional factors", () => {
    expect(convertQuantity(1, 0.001)).toBe(0.001);
  });

  it("rejects invalid inputs", () => {
    expect(convertQuantity(0, 1000)).toBeNull();
    expect(convertQuantity(2, 0)).toBeNull();
    expect(convertQuantity(NaN, 1000)).toBeNull();
    expect(convertQuantity(2, NaN)).toBeNull();
  });
});