export type InsightSeverity = "low" | "medium" | "high";

export type Insight = {
  key: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
};

export type MonthlyPL = {
  month: string;
  revenue: number;
  cogs: number;
  gross_profit: number;
  opex: number;
  net_income: number;
};

export type GLRow = {
  id?: string;
  date: string;
  account_name: string;
  account_type?: string | null;
  amount: number;
  vendor?: string | null;
  memo?: string | null;
  customer?: string | null;
};

export type ChatRequest = {
  org_id: string;
  source: "web" | "slack";
  user_id?: string;
  slack_user_id?: string;
  text: string;
  thread_id?: string;
  correlation_id?: string;
};

export type ChatResponse = {
  short_answer: string;
  insights: string[];
  data_used: string;
  citations: string[];
  assumptions?: string[];
};
