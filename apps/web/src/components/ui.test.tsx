import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./ui";

describe("Progress", () => {
  it("exposes accessible numeric progress", () => {
    render(<Progress value={75} label="3 of 4 needs covered" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "75",
    );
  });
});
