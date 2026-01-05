import { Outlet, createRootRoute } from '@tanstack/react-router'
import { darkTheme, lightTheme, sharedTheme } from '../themes.js'
import { useDarkMode } from 'usehooks-ts'
import { css } from '@linaria/core'
import { c } from '../utils.js'
import {
	ConnectionProvider,
	WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

import '@solana/wallet-adapter-react-ui/styles.css'

export const Route = createRootRoute({
	component: RootComponent,
})

const fullHeight = css`
	min-height: 100vh;
`

// Only validate Solana env vars if not using external backend URL
// When VITE_BACKEND_URL is set, we're connecting to an external backend
// and may not need Solana-specific configuration
if (!import.meta.env.VITE_BACKEND_URL) {
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
}

function RootComponent() {
	const { isDarkMode } = useDarkMode()

	// Use a default Solana RPC if not set (for external backend testing)
	const solanaRpc = import.meta.env.VITE_MINING_POOL_RPC || 'https://api.devnet.solana.com'

	const content = (
		<div
			id="outlet"
			className={`${fullHeight} ${sharedTheme} ${isDarkMode ? c(darkTheme, 'theme-dark') : c(lightTheme, 'theme-light')}`}
		>
			<Outlet />
		</div>
	)

	// Only wrap with Solana providers if we have Solana config or no external backend URL
	if (!import.meta.env.VITE_BACKEND_URL) {
		return (
			<ConnectionProvider endpoint={solanaRpc}>
				<WalletProvider wallets={[]} onError={(err) => console.error(err)}>
					<WalletModalProvider>
						{content}
					</WalletModalProvider>
				</WalletProvider>
			</ConnectionProvider>
		)
	}

	// If using external backend, just render content without Solana providers
	return content
}
