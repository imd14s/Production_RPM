import { formatLongDate, getFirstName, getGreeting, getHourInTimeZone } from "./date";

describe("getGreeting", () => {
  it("greets in the morning", () => {
    expect(getGreeting(0)).toBe("Bom dia");
    expect(getGreeting(11)).toBe("Bom dia");
  });

  it("greets in the afternoon", () => {
    expect(getGreeting(12)).toBe("Boa tarde");
    expect(getGreeting(17)).toBe("Boa tarde");
  });

  it("greets at night", () => {
    expect(getGreeting(18)).toBe("Boa noite");
    expect(getGreeting(23)).toBe("Boa noite");
  });

  it("rejects invalid hours", () => {
    expect(() => getGreeting(-1)).toThrow(RangeError);
    expect(() => getGreeting(24)).toThrow(RangeError);
    expect(() => getGreeting(12.5)).toThrow(RangeError);
  });
});

describe("getHourInTimeZone", () => {
  it("converts UTC to the brazilian time zone", () => {
    expect(getHourInTimeZone(new Date("2026-11-01T15:00:00Z"), "America/Sao_Paulo")).toBe(12);
  });

  it("keeps the hour when the time zone is UTC", () => {
    expect(getHourInTimeZone(new Date("2026-11-01T15:00:00Z"), "UTC")).toBe(15);
  });

  it("returns zero for midnight", () => {
    expect(getHourInTimeZone(new Date("2026-11-01T03:00:00Z"), "America/Sao_Paulo")).toBe(0);
  });
});

describe("formatLongDate", () => {
  it("formats a date in brazilian portuguese", () => {
    const formatted = formatLongDate(new Date("2026-11-01T15:00:00Z"));

    expect(formatted).toContain("2026");
    expect(formatted).toContain("novembro");
    expect(formatted).toContain("domingo");
  });

  it("respects the informed time zone", () => {
    const formatted = formatLongDate(new Date("2026-11-02T01:00:00Z"));

    expect(formatted).toContain("domingo");
  });
});

describe("getFirstName", () => {
  it("returns the first name", () => {
    expect(getFirstName("Maria Silva Souza")).toBe("Maria");
  });

  it("ignores extra spaces", () => {
    expect(getFirstName("  João  ")).toBe("João");
  });

  it("returns an empty string for blank input", () => {
    expect(getFirstName("   ")).toBe("");
  });
});
