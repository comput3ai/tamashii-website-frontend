# Tamashii Website Frontend

The Tamashii website frontend is a React application that supports both **Solana** and **EVM-compatible chains** (Base, BNB, Ethereum, etc.) for viewing training runs, connecting wallets, and interacting with smart contracts.

## 📦 Structure

This repository contains:
- `frontend/` - React application (Vite, TypeScript, TanStack Router)
- `shared/` - Shared TypeScript types and utilities

## 🔗 Dependencies

This frontend depends on:
- **Backend**: The backend is in a separate repository (`tamashii-website-backend`)
- **Main Project**: References `../../tamashii-network/` for:
  - Solana program IDLs (for building)
  - Tokenizer files (`shared/data-provider/tests/resources/`)
  - Prompt texts (`shared/client/src/state/prompt_texts/index.json`)
  - WASM package (`website/wasm/pkg`)

## 🚀 Getting Started

### Prerequisites

1. **Backend**: Ensure the backend is running (see `tamashii-website-backend` repository)
2. **Main Project**: The `tamashii-network` project should be at `../../tamashii-network/` relative to this directory
3. **Node.js & pnpm**: Install dependencies with `pnpm install`

### Development

```bash
# Install dependencies
pnpm install

# Start development server (Solana - localnet)
cd frontend
pnpm dev-localnet

# Or for different environments:
pnpm dev-devnet      # Solana devnet
pnpm dev-mainnet     # Solana mainnet
pnpm dev-evm-base    # EVM Base network
pnpm dev-evm-local   # EVM local Hardhat node
```

### Building

```bash
cd frontend
pnpm build           # Production build
pnpm build-evm-base  # Build for EVM Base network
```

## ⚙️ Environment Variables

**Backend Selection:**
- `VITE_BACKEND_TYPE`: Backend type - either `"solana"` or `"evm"` (default: `"solana"`)

**Common:**
- `VITE_BACKEND_PORT`: Port of the backend's server. `3000` when running locally.
- `VITE_BACKEND_PATH`: Path of the backend's server. empty when running locally.

**Solana-specific (when `VITE_BACKEND_TYPE=solana`):**
- `VITE_MINING_POOL_RPC`: URL (revealed publicly!) of the RPC for the mining pool contract to use on the frontend.
- `VITE_MINING_POOL_CLUSTER`: which cluster the mining pool uses (used for links to explorers) - either 'devnet', 'mainnet', or a custom URL for RPC (for localnet) - just a server and port, no path.
- `VITE_COORDINATOR_CLUSTER`: which cluster the coordinator uses (used for links to explorers) - either 'devnet', 'mainnet', or a custom URL for RPC (for localnet) - just a server and port, no path.

**EVM-specific (when `VITE_BACKEND_TYPE=evm`):**
- `VITE_EVM_NETWORK`: Network name (e.g., `"base"`, `"base-sepolia"`, `"bnb"`)
- `VITE_EVM_RPC_URL`: RPC URL for the EVM network
- `VITE_EVM_CHAIN_ID`: Chain ID (e.g., `8453` for Base, `84532` for Base Sepolia)
- `VITE_EVM_COORDINATOR_ADDRESS`: Coordinator contract address
- `VITE_EVM_AUTHORIZER_ADDRESS`: Authorizer contract address
- `VITE_EVM_TREASURER_ADDRESS`: Treasurer contract address
- `VITE_EVM_MINING_POOL_ADDRESS`: Mining Pool contract address

## 📝 Building IDLs

To build Solana program IDLs (needed for TypeScript types):

```bash
cd shared
pnpm build-idl
```

This will:
1. Build the coordinator IDL from `../../tamashii-network/architectures/decentralized/solana-coordinator/`
2. Build the mining pool IDL from `../../tamashii-network/architectures/decentralized/solana-mining-pool/`
3. Output JSON and TypeScript files to `shared/idl/`

## 🎨 Features

- **Dual Blockchain Support**: Works with both Solana and EVM chains
- **Wallet Integration**: 
  - Solana: Phantom, Solflare wallets
  - EVM: MetaMask and other EIP-1193 compatible wallets
- **Real-time Data**: Streaming data visualization with NDJSON
- **WebGL Visualization**: Interactive 3D graphics using regl
- **Run Management**: View and interact with training runs

## 📚 Related Repositories

- **Backend**: `tamashii-website-backend` - API server
- **Main Project**: `tamashii-network` - Core network implementation

## 🔧 Troubleshooting

### Tokenizer/Prompt Files Not Found

The frontend needs tokenizer and prompt files from the main project. Ensure:
- `../../tamashii-network/shared/data-provider/tests/resources/llama2_tokenizer.json` exists
- `../../tamashii-network/shared/data-provider/tests/resources/llama3_tokenizer.json` exists
- `../../tamashii-network/shared/client/src/state/prompt_texts/index.json` exists

These are automatically copied during the `_dev` script.

### WASM Package Not Found

The shared package needs the WASM module. Ensure:
- `../../tamashii-network/website/wasm/pkg` exists and is built

Build it in the main project:
```bash
cd ../../tamashii-network/website/wasm
./build.sh
```

---

For detailed EVM setup instructions, see the main project's [WEBSITE_EVM_ADAPTATION.md](../../tamashii-network/website/WEBSITE_EVM_ADAPTATION.md).

