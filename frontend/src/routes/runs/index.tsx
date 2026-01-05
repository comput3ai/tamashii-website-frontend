import { createFileRoute, redirect } from '@tanstack/react-router'
import { Runs } from '../../components/Runs.js'
import { fetchRuns, fetchSummariesStreaming } from '../../fetchRuns.js'
import { useStreamingLoaderData } from '../../useStreamingData.js'
import { ApiGetRuns } from 'shared'

export const Route = createFileRoute('/runs/')({
	loader: async () => {
		console.log('[runs/index] Loader called')
		try {
			console.log('[runs/index] Fetching initial runs...')
			const initialRuns = await fetchRuns()
			console.log('[runs/index] Got initial runs:', initialRuns.runs.length)
			if (initialRuns.runs.length === 1) {
				console.log('[runs/index] Redirecting to single run')
				throw redirect({
					to: '/runs/$run/$index',
					params: {
						run: initialRuns.runs[0].id,
						index: `${initialRuns.runs[0].index}`,
					},
				})
			}
			console.log('[runs/index] Starting summaries stream...')
			return fetchSummariesStreaming()
		} catch (error) {
			console.error('[runs/index] Loader error:', error)
			throw error
		}
	},
	component: RouteComponent,
})

function RouteComponent() {
	console.log('[runs/index] Component rendering')
	const runs = useStreamingLoaderData<ApiGetRuns>({
		from: '/runs/',
	})
	console.log('[runs/index] Runs data:', runs)

	if (!runs) {
		console.log('[runs/index] No runs data, showing loading...')
		return (
			<div style={{ padding: '2rem', color: 'var(--color-fg)', backgroundColor: 'var(--color-bg)' }}>
				<div>Loading runs...</div>
			</div>
		)
	}

	if (runs.error) {
		console.error('[runs/index] Runs error:', runs.error)
		return (
			<div style={{ padding: '2rem', color: 'var(--color-fg)', backgroundColor: 'var(--color-bg)' }}>
				<div>Error loading runs: {String(runs.error)}</div>
			</div>
		)
	}

	console.log('[runs/index] Rendering Runs component with', runs.runs?.length || 0, 'runs')
	return <Runs key={window.location.pathname} {...runs} />
}
