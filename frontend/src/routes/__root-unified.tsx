import { createRootRoute, Outlet } from '@tanstack/react-router'
import { css, cx } from '@linaria/core'
import { useDarkMode } from '../hooks/useDarkMode'
import { lightTheme, darkTheme, sharedTheme } from '../theme'
import { EVMProvider } from '../providers/EVMProvider'
import { ConnectionProvider, WalletProvider, WalletModalProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export const Route = createRootRoute({
	component: RootComponent,
})

const fullHeight = css`
	min-height: 100vh;
`

// EVM supported networks configuration
const EVM_SUPPORTED_NETWORKS = {
	8453: {
		name: 'Base',
		rpcUrl: 'https://mainnet.base.org',
		blockExplorer: 'https://basescan.org',
		nativeCurrency: {
			name: 'Ethereum',
			symbol: 'ETH',
			decimals: 18,
		},
	},
	84532: {
		name: 'Base Sepolia',
		rpcUrl: 'https://sepolia.base.org',
		blockExplorer: 'https://sepolia.basescan.org',
		nativeCurrency: {
			name: 'Ethereum',
			symbol: 'ETH',
			decimals: 18,
		},
	},
	56: {
		name: 'BNB Smart Chain',
		rpcUrl: 'https://bsc-dataseed.binance.org',
		blockExplorer: 'https://bscscan.com',
		nativeCurrency: {
			name: 'BNB',
			symbol: 'BNB',
			decimals: 18,
		},
	},
	97: {
		name: 'BNB Testnet',
		rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
		blockExplorer: 'https://testnet.bscscan.com',
		nativeCurrency: {
			name: 'BNB',
			symbol: 'BNB',
			decimals: 18,
		},
	},
}

// Get backend type from environment
const BACKEND_TYPE = import.meta.env.VITE_BACKEND_TYPE || 'solana'

// Validate environment variables based on backend type
if (BACKEND_TYPE === 'solana') {
	if (
		!import.meta.env.VITE_MINING_POOL_RPC ||
		!import.meta.env.VITE_MINING_POOL_RPC.startsWith('http')
	) {
		throw new Error(
			`Invalid deployment config. env var VITE_MINING_POOL_RPC was not set when building.`
		)
	}

	if (!import.meta.env.VITE_COORDINATOR_CLUSTER) {
		throw new Error(
			`Invalid deployment config. env var VITE_COORDINATOR_CLUSTER was not set when building.`
		)
	}
	if (!import.meta.env.VITE_MINING_POOL_CLUSTER) {
		throw new Error(
			`Invalid deployment config. env var VITE_MINING_POOL_CLUSTER was not set when building.`
		)
	}
} else if (BACKEND_TYPE === 'evm') {
	if (!import.meta.env.VITE_EVM_RPC_URL) {
		throw new Error(
			`Invalid deployment config. env var VITE_EVM_RPC_URL was not set when building.`
		)
	}

	if (!import.meta.env.VITE_EVM_CHAIN_ID) {
		throw new Error(
			`Invalid deployment config. env var VITE_EVM_CHAIN_ID was not set when building.`
		)
	}

	if (!import.meta.env.VITE_EVM_COORDINATOR_ADDRESS) {
		throw new Error(
			`Invalid deployment config. env var VITE_EVM_COORDINATOR_ADDRESS was not set when building.`
		)
	}
}

function SolanaProvider({ children }: { children: React.ReactNode }) {
	const network = import.meta.env.VITE_MINING_POOL_CLUSTER === 'mainnet' 
		? WalletAdapterNetwork.Mainnet 
		: WalletAdapterNetwork.Devnet

	const wallets = [
		new PhantomWalletAdapter(),
		new SolflareWalletAdapter(),
	]

	return (
		<ConnectionProvider endpoint={import.meta.env.VITE_MINING_POOL_RPC}>
			<WalletProvider wallets={wallets} onError={(err) => console.error(err)}>
				<WalletModalProvider>
					{children}
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	)
}

function EVMProviderWrapper({ children }: { children: React.ReactNode }) {
	return (
		<EVMProvider supportedChains={EVM_SUPPORTED_NETWORKS}>
			{children}
		</EVMProvider>
	)
}

function RootComponent() {
	const { isDarkMode } = useDarkMode()

	const content = (
		<div
			id="outlet"
			className={`${fullHeight} ${sharedTheme} ${isDarkMode ? cx(darkTheme, 'theme-dark') : cx(lightTheme, 'theme-light')}`}
		>
			<Outlet />
		</div>
	)

	// Wrap with appropriate provider based on backend type
	if (BACKEND_TYPE === 'evm') {
		return <EVMProviderWrapper>{content}</EVMProviderWrapper>
	} else {
		return <SolanaProvider>{content}</SolanaProvider>
	}
}
