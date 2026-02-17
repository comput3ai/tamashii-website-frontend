'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ApiRunResponse } from '@/lib/api';
import { subscribeRunStream } from '@/lib/api';
import Link from 'next/link';

export default function RunDetailPage() {
  const params = useParams();
  const runId = String(params?.runId ?? '');
  const index = String(params?.index ?? '0');

  const [data, setData] = useState<ApiRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    const unsub = subscribeRunStream(
      runId,
      index,
      (d) => setData(d),
      (e) => setError(e.message)
    );
    return unsub;
  }, [runId, index]);

  if (!runId) {
    return (
      <div className="container">
        <p>Missing run ID</p>
        <Link href="/">← Back to runs</Link>
      </div>
    );
  }

  const run = data?.run;

  return (
    <div className="container">
      <nav style={{ marginBottom: '1rem' }}>
        <Link href="/">← Back to runs</Link>
      </nav>

      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{runId}</h1>
        <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0' }}>
          Live stream from backend (updates every few seconds)
        </p>
      </header>

      {error && (
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <strong>Error:</strong> {error}
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--muted)' }}>
            Run ID in URL: <code>{runId}</code> (index: {index}). Ensure the backend has this run in <code>RUN_IDS</code> and that the stream route <code>GET /run/:runId/:index</code> is implemented.
          </p>
        </div>
      )}

      {!run && !error && (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--muted)' }}>Connecting to stream…</p>
        </div>
      )}

      {run && (
        <>
          <div className="card">
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>State</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`badge badge--${run.state === 'Training' ? 'ok' : run.state === 'WaitingForMembers' ? 'warn' : 'muted'}`}>
                {run.state}
              </span>
              <span>Step <strong>{run.progress.step}</strong></span>
              <span>Epoch <strong>{run.progress.epoch}</strong></span>
              <span>Clients <strong>{Array.isArray(run.coordinator.clients) ? run.coordinator.clients.length : 0}</strong></span>
            </div>
          </div>

          <div className="card">
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Config</h2>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 1rem' }}>
              <dt style={{ color: 'var(--muted)' }}>Warmup time</dt>
              <dd style={{ margin: 0 }}>{run.coordinator.config.warmupTime}</dd>
              <dt style={{ color: 'var(--muted)' }}>Rounds per epoch</dt>
              <dd style={{ margin: 0 }}>{run.coordinator.config.roundsPerEpoch}</dd>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
