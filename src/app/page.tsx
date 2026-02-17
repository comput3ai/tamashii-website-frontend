import Link from 'next/link';
import { fetchRuns } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let runs: { runId: string; state: string; clients: number; step: number; epoch: number }[] = [];
  let error: string | null = null;

  try {
    const data = await fetchRuns();
    runs = data.runs;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load runs';
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Tamashii — EVM Training</h1>
        <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0' }}>
          Runs from coordinator backend
        </p>
      </header>

      {error && (
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <strong>Error:</strong> {error}. Ensure the backend is running and{" "}
          <code>NEXT_PUBLIC_API_URL</code> is set.
        </div>
      )}

      {!error && runs.length === 0 && (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            No runs yet. Create a run on the EVM coordinator or set <code>RUN_IDS</code> on the
            backend.
          </p>
          <p style={{ margin: '0.75rem 0 0', color: 'var(--muted)', fontSize: '0.875rem' }}>
            If you just set <code>RUN_IDS</code>, restart the backend so it picks up the change.
          </p>
        </div>
      )}

      {!error && runs.length > 0 && (
        <div className="card">
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Runs</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {runs.map((r) => (
              <li key={r.runId} style={{ marginBottom: '0.75rem' }}>
                <Link href={`/runs/${encodeURIComponent(r.runId)}/0`} style={{ fontWeight: 600 }}>
                  {r.runId}
                </Link>
                <span className={`badge badge--${r.state === 'Training' ? 'ok' : 'muted'}`} style={{ marginLeft: '0.5rem' }}>
                  {r.state}
                </span>
                <span style={{ color: 'var(--muted)', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                  step {r.step} · epoch {r.epoch} · {r.clients} clients
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
