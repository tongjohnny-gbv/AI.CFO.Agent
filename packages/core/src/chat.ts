import { ChatRequest, ChatResponse, GLRow, MonthlyPL } from "./types";

export function buildChatResponse(input: ChatRequest, pl: MonthlyPL[], gl: GLRow[], notes: string[]): ChatResponse {
  if (!pl.length) {
    return {
      short_answer: "I don’t have enough monthly P&L data yet. Please upload at least one P&L CSV.",
      insights: ["Missing monthly_pl rows for this org", "Once uploaded, I can compute trends and flags"],
      data_used: "No financial data available",
      citations: [],
      assumptions: ["No inferred values were used"]
    };
  }

  const latest = [...pl].sort((a, b) => a.month.localeCompare(b.month)).at(-1)!;
  const margin = latest.revenue ? latest.gross_profit / latest.revenue : 0;
  const mentions = gl.filter((r) => input.text.toLowerCase().split(" ").some((t) => t.length > 3 && `${r.account_name} ${r.memo ?? ""}`.toLowerCase().includes(t))).slice(0, 5);
  const citations = [
    `monthly_pl:${latest.month}`,
    ...mentions.map((m, i) => `gl_rows:${m.id ?? `row-${i + 1}`}`)
  ];

  return {
    short_answer: `Latest month (${latest.month}) net income is ${latest.net_income.toFixed(0)} with gross margin ${(margin * 100).toFixed(1)}%.`,
    insights: [
      `Revenue: ${latest.revenue.toFixed(0)}, Opex: ${latest.opex.toFixed(0)}.`,
      `Question asked: “${input.text}”.`,
      notes[0] ? `Context note: ${notes[0]}` : "No context note found for this org.",
      mentions.length ? `Found ${mentions.length} related GL rows for your question.` : "No matching GL rows found for this question."
    ],
    data_used: `${pl[0].month} to ${latest.month}; sources: monthly_pl + gl_rows + org_notes`,
    citations,
    assumptions: mentions.length ? [] : ["No matching GL descriptions for this prompt; answer based on latest P&L trend only."]
  };
}
