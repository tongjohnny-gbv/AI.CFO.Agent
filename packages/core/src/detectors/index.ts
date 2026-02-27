import { GLRow, Insight, MonthlyPL } from "../types";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function runDetectors(pl: MonthlyPL[], gl: GLRow[]): Insight[] {
  const insights: Insight[] = [];
  const ordered = [...pl].sort((a, b) => a.month.localeCompare(b.month));
  if (ordered.length < 2) return insights;
  const latest = ordered[ordered.length - 1];
  const previous = ordered[ordered.length - 2];

  const marginNow = latest.revenue ? latest.gross_profit / latest.revenue : 0;
  const marginPrev = previous.revenue ? previous.gross_profit / previous.revenue : 0;
  if (marginNow < marginPrev - 0.05) {
    insights.push({
      key: "margin_down",
      severity: "high",
      title: "Gross margin declined",
      detail: `Margin dropped from ${pct(marginPrev)} to ${pct(marginNow)} in ${latest.month}.`
    });
  }

  const cashRows = gl.filter((r) => /cash/i.test(r.account_name));
  if (cashRows.length > 1 && latest.net_income < 0) {
    const byMonth = new Map<string, number>();
    cashRows.forEach((r) => {
      const month = r.date.slice(0, 7);
      byMonth.set(month, (byMonth.get(month) ?? 0) + r.amount);
    });
    const months = [...byMonth.keys()].sort();
    if (months.length >= 2) {
      const drop = (byMonth.get(months[months.length - 2]) ?? 0) - (byMonth.get(months[months.length - 1]) ?? 0);
      if (drop > 0) {
        insights.push({
          key: "cash_runway_drop",
          severity: "high",
          title: "Cash runway dropping",
          detail: `Cash proxy fell by ${drop.toFixed(0)} month-over-month while net income is negative.`
        });
      }
    }
  }

  const arRows = gl.filter((r) => /accounts receivable|\bar\b/i.test(r.account_name));
  insights.push(arRows.length
    ? { key: "ar_aging_proxy", severity: "medium", title: "AR aging proxy", detail: `Detected ${arRows.length} AR rows; review invoices older than 45 days.` }
    : { key: "ar_aging_proxy", severity: "low", title: "AR aging proxy unavailable", detail: "Not enough AR-tagged GL data to estimate aging." });

  const customerRows = gl.filter((r) => r.customer);
  if (customerRows.length > 0) {
    const totals = new Map<string, number>();
    customerRows.forEach((r) => totals.set(r.customer!, (totals.get(r.customer!) ?? 0) + Math.abs(r.amount)));
    const total = [...totals.values()].reduce((a, b) => a + b, 0);
    const max = Math.max(...totals.values());
    if (max / total > 0.4) {
      insights.push({
        key: "revenue_concentration",
        severity: "medium",
        title: "Revenue concentration risk",
        detail: `Top customer is ${pct(max / total)} of customer-attributed volume.`
      });
    }
  }

  if (latest.opex > previous.opex * 1.15) insights.push({ key: "payroll_creep", severity: "medium", title: "Payroll/Opex creep", detail: "Operating expense increased more than 15% month-over-month." });
  if (latest.opex - previous.opex > Math.abs(previous.opex) * 0.2) insights.push({ key: "expense_spike", severity: "high", title: "Expense spike", detail: "Large opex spike detected in latest month." });

  const avgRevenue = ordered.slice(0, -1).reduce((s, m) => s + m.revenue, 0) / (ordered.length - 1);
  if (Math.abs(latest.revenue - avgRevenue) / avgRevenue > 0.25) insights.push({ key: "seasonality_anomaly", severity: "medium", title: "Seasonality anomaly", detail: "Latest revenue deviates >25% from prior average." });

  const taxRows = gl.filter((r) => /tax|withholding/i.test(`${r.account_name} ${r.memo ?? ""}`));
  if (taxRows.some((r) => Math.abs(r.amount) > 10000)) insights.push({ key: "tax_surprise_flag", severity: "high", title: "Tax surprise flag", detail: "Large tax/withholding transaction detected." });

  return insights;
}
