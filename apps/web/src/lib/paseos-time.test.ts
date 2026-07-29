import { describe, expect, it } from "vitest";
import {
  formatPaseosDateTime,
  paseosDateTimeParts,
  paseosLocalDateTimeToDate,
} from "./paseos-time";

describe("Paseos timezone helpers", () => {
  it("stores summer wall time as the correct UTC instant", () => {
    expect(
      paseosLocalDateTimeToDate("2026-08-05", "12:00")?.toISOString(),
    ).toBe("2026-08-05T16:00:00.000Z");
  });

  it("stores winter wall time as the correct UTC instant", () => {
    expect(
      paseosLocalDateTimeToDate("2026-12-05", "12:00")?.toISOString(),
    ).toBe("2026-12-05T17:00:00.000Z");
  });

  it("round-trips an instant into Paseos form fields", () => {
    expect(paseosDateTimeParts("2026-08-05T16:00:00.000Z")).toEqual({
      date: "2026-08-05",
      time: "12:00",
    });
  });

  it("rejects a nonexistent daylight-saving wall time", () => {
    expect(paseosLocalDateTimeToDate("2026-03-08", "02:30")).toBeNull();
  });

  it("formats server-rendered times in Boca Raton", () => {
    expect(
      formatPaseosDateTime("2026-08-05T16:00:00.000Z", {
        month: "short",
        day: "numeric",
        hour: "numeric",
      }),
    ).toBe("Aug 5, 12 PM");
  });
});
