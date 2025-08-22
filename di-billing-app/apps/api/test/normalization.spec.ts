import { normalizeBac, toWholeDollars } from "../src/utils/normalization";

describe("normalizeBac", () => {
it("pads to 6 digits", () => {
expect(normalizeBac("123")).toBe("000123");
});
it("strips non-digits", () => {
expect(normalizeBac("12-34x")).toBe("001234");
});
it("truncates extra digits keeping last 6", () => {
expect(normalizeBac("123456789")).toBe("345678");
});
});

describe("toWholeDollars", () => {
it("accepts integers", () => {
expect(toWholeDollars(2500)).toBe(2500);
});
it("rejects decimals", () => {
expect(() => toWholeDollars(12.34)).toThrow();
});
it("rejects NaN", () => {
expect(() => toWholeDollars("abc")).toThrow();
});
});
