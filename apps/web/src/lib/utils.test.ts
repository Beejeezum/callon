import { describe, expect, it } from "vitest";
import { percentComplete } from "./utils";

describe("percentComplete", () => {
  it("caps at 100", () => expect(percentComplete(3, 2)).toBe(100));
  it("handles no requested quantity", () =>
    expect(percentComplete(0, 0)).toBe(0));
});
