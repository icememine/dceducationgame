import { describe, expect, it } from "vitest";
import { findLesson, segments, validateContent } from "./index";

describe("content", () => {
  it("orders the journey Hiểu mình → Hiểu quỹ → Quỹ DC", () => {
    expect(segments.map((s) => s.id)).toEqual(["my-plan", "fund-types", "dc-funds"]);
  });

  it("passes integrity checks", () => {
    expect(validateContent()).toEqual([]);
  });

  it("indexes lessons by id", () => {
    expect(findLesson("a1-ccq-nav")?.segment.id).toBe("dc-funds");
    expect(findLesson("nope")).toBeUndefined();
  });

  it("keeps hearts off for the self-assessment segment", () => {
    expect(segments.find((s) => s.id === "my-plan")?.heartsEnabled).toBe(false);
  });
});
