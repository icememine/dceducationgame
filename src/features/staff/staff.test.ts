import { describe, expect, it } from "vitest";
import { hashPassword, passwordProblem, temporaryPassword, validUsername, verifyPassword } from "./password";
import { can, NAV, PERMISSIONS, ROLES } from "./roles";

describe("staff roles", () => {
  it("gives each role only its pages", () => {
    expect(can("admin", "staff")).toBe(true);
    expect(can("content", "editor")).toBe(true);
    expect(can("content", "ai-review")).toBe(false);
    expect(can("compliance", "risk-audit")).toBe(true);
    expect(can("compliance", "editor")).toBe(false);
    expect(can("compliance", "staff")).toBe(false);
    expect(can("content", "market-sim:all")).toBe(false);
    expect(can(undefined, "analytics")).toBe(false);
    expect(can("nope", "analytics")).toBe(false);
  });

  it("only refers to known roles and permissions", () => {
    for (const roles of Object.values(PERMISSIONS)) for (const r of roles) expect(ROLES).toHaveProperty(r);
    for (const n of NAV) expect(PERMISSIONS).toHaveProperty(n.perm);
  });
});

describe("passwords", () => {
  it("hashes with a salt and verifies", async () => {
    const a = await hashPassword("rong-admin-2026");
    const b = await hashPassword("rong-admin-2026");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("rong-admin-2026", a)).toBe(true);
    expect(await verifyPassword("rong-admin-2027", a)).toBe(false);
    expect(await verifyPassword("x", "garbage")).toBe(false);
  });

  it("enforces the policy and makes valid temporary passwords", () => {
    expect(passwordProblem("short1")).toMatch(/ít nhất/);
    expect(passwordProblem("onlyletterss")).toMatch(/chữ và số/);
    expect(passwordProblem("lan.nguyen2026", "lan.nguyen")).toMatch(/tên đăng nhập/);
    expect(passwordProblem("dragon-capital-26")).toBeNull();
    for (let i = 0; i < 20; i++) expect(passwordProblem(temporaryPassword())).toBeNull();
    expect([validUsername("lan.nguyen"), validUsername("Lan"), validUsername("ab"), validUsername("compliance-1")]).toEqual([true, false, false, true]);
  });
});
