# Tamashii Website Frontend (Next.js)

Next.js frontend for the Tamashii EVM website backend. Lists runs and shows live run detail (state, step, epoch, clients) from the NestJS API.

## Backend

Point this app at [tamashii-website-backend](https://github.com/SingularityDAO-dev/tamashii-website-backend) (NestJS) with `BACKEND=evm` and your EVM RPC + coordinator address.

## Setup

```bash
cd tamashii-website-frontend
npm install
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Base URL of the backend API (no trailing slash) |

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Run

**Development:**

```bash
# Terminal 1: start backend (EVM)
cd ../tamashii-website-api
BACKEND=evm EVM_RPC_URL=... EVM_COORDINATOR_ADDRESS=0x... RUN_IDS=test-run-1 npm run start:dev

# Terminal 2: start frontend
cd tamashii-website-frontend
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). The frontend runs on port 3001 so the backend can use 3000.

**Production:**

```bash
npm run build
npm run start
```

## Pages

- **/** — List of runs from `GET /runs`
- **/runs/[runId]/[index]** — Live run detail stream (`GET /run/:runId/:index` NDJSON), updates every few seconds
