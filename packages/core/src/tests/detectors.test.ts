import { describe, expect, it } from "vitest";
import { runDetectors } from "../detectors";

describe("runDetectors", () => {
  it("returns baseline detector outputs including graceful skips", () => {
    const pl = [
      { month: "2024-01", revenue: 100000, cogs: 30000, gross_profit: 70000, opex: 30000, net_income: 12000 },
      { month: "2024-02", revenue: 90000, cogs: 40000, gross_profit: 50000, opex: 40000, net_income: -4000 }
    ];
    const gl = [
      { date: "2024-01-10", account_name: "Cash", amount: 80000 },
      { date: "2024-02-10", account_name: "Cash", amount: 60000 },
      { date: "2024-02-09", account_name: "Payroll", amount: -22000 },
      { date: "2024-02-11", account_name: "Tax Withholding", amount: -12000 }
    ];
    const out = runDetectors(pl, gl as any);
    expect(out.some((i) => i.key === "margin_down")).toBe(true);
    expect(out.some((i) => i.key === "ar_aging_proxy")).toBe(true);
    expect(out.some((i) => i.key === "tax_surprise_flag")).toBe(true);
  });
});
