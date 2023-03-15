import { validateEmail } from "./utils";
import { validateUrl } from "./utils";

test("validateEmail returns false for non-emails", () => {
  expect(validateEmail(undefined)).toBe(false);
  expect(validateEmail(null)).toBe(false);
  expect(validateEmail("")).toBe(false);
  expect(validateEmail("not-an-email")).toBe(false);
  expect(validateEmail("n@")).toBe(false);
});

test("validateEmail returns true for emails", () => {
  expect(validateEmail("kody@example.com")).toBe(true);
});

test("validateUrl returns true for urls", () => {
  expect(validateUrl("https://stackoverflow.com")).toBe(true);
});

test("validateUrl returns false for invalid/incomplete urls", () => {
  expect(validateUrl("")).toBe(true);
  expect(validateUrl("stackoverflow.com")).toBe(true);
});
