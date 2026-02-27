# AI CFO Agent (MVP SaaS)

Monorepo with shared intelligence endpoint consumed by web and Slack.

## Stack
- `apps/web`: Next.js App Router + TypeScript + Tailwind (deploy to Vercel)
- `apps/slack-bot`: Node + TypeScript + `@slack/bolt` (deploy to Render paid always-on)
- `packages/core`: shared chat + detector logic
- `packages/db`: Prisma schema, seed, samples

## Data model
Includes tenant-safe multi-org tables: `orgs`, `users`, `memberships`, `slack_installations`, `slack_identities`, `messages`, `financial_uploads`, `gl_rows`, `monthly_pl`, `insights`, `monthly_reports`, `context_notes`.

## Local setup
1. `pnpm install`
2. Copy `.env.example` to `.env`
3. Start Postgres and set `DATABASE_URL`
4. `pnpm --filter @ai-cfo/db prisma:generate`
5. `pnpm --filter @ai-cfo/db prisma:migrate`
6. `pnpm --filter @ai-cfo/db seed`
7. Web: `pnpm --filter web dev`
8. Slack bot: `pnpm --filter slack-bot dev`

## Slack app creation
1. Create app from scratch in Slack API dashboard.
2. OAuth scopes (bot): `commands`, `chat:write`, `im:history`, `im:read`, `app_mentions:read`.
3. Slash command: `/cfo` with request URL `https://<render-service>/slack/events`.
4. Event subscriptions request URL: `https://<render-service>/slack/events`; subscribe to `message.im`.
5. OAuth redirect URL: `https://<render-service>/slack/oauth_redirect`.
6. Install app to workspace; copy signing secret/client id/client secret/bot token to Render env.

## ngrok local flow
- Expose Slack bot: `ngrok http 3001`
- Set Slack request URLs to ngrok endpoint + `/slack/events`
- Keep `SHARED_CHAT_ENDPOINT=http://localhost:3000/api/chat`.

## Web features delivered
- Org management page (`/orgs`) for create/switch placeholder.
- CSV upload + mapping (`/upload`) for GL and Monthly P&L.
- Shared endpoint `POST /api/chat` with citations, data-used summary, assumptions guard.
- Insights page (`/insights`) from 8 detectors.
- Monthly package generation (`/reports`) with deep links.

## Slack features delivered
- `/cfo` command with immediate `ack()` and async response.
- DM message handling with shared chat endpoint.
- Block Kit response with action buttons (open analysis, assumptions, generate package).
- Correlation IDs and audit logging via message records.

## Deployment
### Vercel (web)
- Import repo; set project root `apps/web`.
- Env vars: `DATABASE_URL`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `CHAT_API_KEY`.

### Render (slack-bot)
- Deploy Blueprint from `render.yaml`.
- Ensure paid always-on plan (`starter` or above), not free/sleeping.
- Set env vars from `.env.example`.

## Demo script
1. Install app in Slack workspace.
2. Seed demo data and upload sample CSV from `packages/db/samples`.
3. In web `/chat`, ask trend questions.
4. In Slack run `/cfo what changed in gross margin?`.
5. DM bot `show risk hotspots`.
6. Visit web `/insights` and `/reports`, then click “Generate monthly package” from Slack action.
