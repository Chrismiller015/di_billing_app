di-billing-app
Monorepo for the billing reconciliation tool (GM Invoices vs Salesforce Subscriptions).

Tech Stack
Backend: NestJS, Prisma (Postgres), Winston logging

Frontend: Vite + React, Tailwind, react-icons

Dev: Docker Compose (Postgres, Redis, pgAdmin), GitHub Actions (CI), Jest/Vitest

Quick Start
Copy .env.example → .env and adjust if necessary.

Start infra (Postgres, Redis, pgAdmin):

Bash

docker compose -f docker-compose.dev.yml up -d
Install deps at root:

Bash

npm install
Initialize DB:

Bash

npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
Run API:

Bash

npm run dev:api
Run Web:

Bash

npm run dev:web
Scripts
npm run dev:api – start Nest API in watch mode

npm run dev:web – start Vite dev server

npm run build – build both workspaces

npm run test – run tests (API Jest + Web Vitest)

npm run lint – lint

Notes
Prices stored as integer whole dollars.

BAC is stored as zero-padded 6-character string.

Only one GM invoice upload is current per program/period.

Upload errors are displayed in their own tab with count in the title.
