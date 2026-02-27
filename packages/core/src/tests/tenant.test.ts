import { describe, expect, it } from "vitest";
import { assertTenantAccess } from "../tenant";

describe("assertTenantAccess", () => {
  it("enforces org-level isolation", () => {
    expect(assertTenantAccess({ userId: "u1", orgId: "o1", role: "admin" }, "o1")).toBe(true);
    expect(assertTenantAccess({ userId: "u1", orgId: "o2", role: "admin" }, "o1")).toBe(false);
    expect(assertTenantAccess({ orgId: "o1", role: "admin" }, "o1")).toBe(false);
  });
});
