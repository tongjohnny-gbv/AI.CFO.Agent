import "dotenv/config";
import { App, ExpressReceiver } from "@slack/bolt";
import axios from "axios";
import express from "express";
import { prisma } from "@ai-cfo/db";
import { decrypt, encrypt } from "./crypto";

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: ["commands", "chat:write", "im:history", "im:read", "app_mentions:read"],
  installerOptions: { redirectUriPath: "/slack/oauth_redirect" },
  installationStore: {
    storeInstallation: async (i) => {
      const t = i.team?.id; if (!t || !i.bot?.token) throw new Error("missing team/token");
      await prisma.slackInstallation.upsert({ where: { teamId_enterpriseId: { teamId: t, enterpriseId: i.enterprise?.id ?? null } }, update: { botTokenEncrypted: encrypt(i.bot.token) }, create: { teamId: t, enterpriseId: i.enterprise?.id ?? null, botTokenEncrypted: encrypt(i.bot.token) } });
    },
    fetchInstallation: async (query) => {
      const row = await prisma.slackInstallation.findFirst({ where: { teamId: query.teamId } });
      if (!row) throw new Error("installation not found");
      return { team: { id: row.teamId }, enterprise: row.enterpriseId ? { id: row.enterpriseId } : undefined, bot: { token: decrypt(row.botTokenEncrypted) } } as any;
    }
  }
});

const app = new App({ receiver, token: process.env.SLACK_BOT_TOKEN });
const webApp = process.env.WEB_APP_URL || "http://localhost:3000";
const chatEndpoint = process.env.SHARED_CHAT_ENDPOINT || "http://localhost:3000/api/chat";
const correlationId = () => `slk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

async function resolveOrg(teamId: string, userId: string): Promise<string | null> {
  const identity = await prisma.slackIdentity.findFirst({ where: { teamId, slackUserId: userId, active: true } });
  return identity?.orgId ?? null;
}

function blocks(answer: any, orgId: string) {
  return [
    { type: "section", text: { type: "mrkdwn", text: `*Answer*\n${answer.short_answer}` } },
    { type: "section", text: { type: "mrkdwn", text: (answer.insights || []).map((i: string) => `• ${i}`).join("\n") } },
    { type: "context", elements: [{ type: "mrkdwn", text: `Data used: ${answer.data_used}` }] },
    { type: "actions", elements: [
      { type: "button", text: { type: "plain_text", text: "Open full analysis" }, url: `${webApp}/chat?org_id=${orgId}` },
      { type: "button", text: { type: "plain_text", text: "Show assumptions" }, action_id: "show_assumptions", value: JSON.stringify(answer.assumptions || []) },
      { type: "button", text: { type: "plain_text", text: "Generate monthly package" }, action_id: "gen_package", value: orgId }
    ] }
  ] as any;
}

app.command("/cfo", async ({ ack, command, respond, client }) => {
  await ack();
  const org_id = await resolveOrg(command.team_id, command.user_id);
  if (!org_id) return respond(`Please link Slack in ${webApp}/orgs and select an active org.`);
  const { data } = await axios.post(chatEndpoint, { org_id, source: "slack", slack_user_id: command.user_id, text: command.text || "CFO summary", thread_id: command.thread_ts, correlation_id: correlationId() });
  if (command.channel_name !== "directmessage") await client.chat.postMessage({ channel: command.channel_id, thread_ts: command.thread_ts || undefined, text: data.short_answer, blocks: blocks(data, org_id) });
  else await respond({ text: data.short_answer, blocks: blocks(data, org_id), response_type: "ephemeral" });
});

app.message(async ({ message, say }) => {
  if (message.channel_type !== "im" || !("text" in message) || !message.user || !message.team) return;
  const org_id = await resolveOrg(message.team, message.user);
  if (!org_id) return say(`Please link Slack in ${webApp}/orgs and select an active org.`);
  const { data } = await axios.post(chatEndpoint, { org_id, source: "slack", slack_user_id: message.user, text: message.text, thread_id: message.thread_ts, correlation_id: correlationId() });
  await say({ text: data.short_answer, blocks: blocks(data, org_id) });
});

app.action("show_assumptions", async ({ ack, body, client, action }) => {
  await ack();
  const assumptions = JSON.parse((action as any).value || "[]");
  await client.chat.postMessage({ channel: (body as any).channel.id, text: `Assumptions:\n${assumptions.length ? assumptions.map((a: string) => `• ${a}`).join("\n") : "None"}` });
});

app.action("gen_package", async ({ ack, body, client, action }) => {
  await ack();
  const org_id = (action as any).value; const month = new Date().toISOString().slice(0, 7);
  await axios.post(`${webApp}/api/reports`, { org_id, month });
  await client.chat.postMessage({ channel: (body as any).channel.id, text: `Generated: ${webApp}/reports/${month}` });
});

receiver.router.get("/health", (_req, res) => res.status(200).send("ok"));
(async () => { await app.start(Number(process.env.SLACK_BOT_PORT || 3001)); })();
