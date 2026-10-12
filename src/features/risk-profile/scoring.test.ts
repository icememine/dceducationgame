import { describe, expect, it } from "vitest";
import { scoreProfile, type ProfileAnswer } from "./scoring";

const a = (dimension: ProfileAnswer["dimension"], score: number): ProfileAnswer => ({ dimension, score, max: 4 });

describe("risk profile scoring", () => {
  it("high willingness and ability → năng động", () => {
    const r = scoreProfile([a("horizon", 4), a("capacity", 4), a("tolerance", 4), a("knowledge", 4)]);
    expect(r.profile).toBe("nang-dong");
    expect(r.capped).toBe(false);
  });

  it("short horizon caps an eager investor", () => {
    const r = scoreProfile([a("horizon", 0), a("capacity", 4), a("tolerance", 4), a("knowledge", 4)]);
    expect(r.profile).toBe("bao-toan");
    expect(r.capped).toBe(true);
  });

  it("middle answers → cân bằng", () => {
    const r = scoreProfile([a("horizon", 2), a("capacity", 2), a("tolerance", 2), a("knowledge", 2)]);
    expect(r.profile).toBe("can-bang");
  });
});
