/**
 * API client for tamashii-website-backend (NestJS).
 * Expects NEXT_PUBLIC_API_URL (e.g. http://localhost:3000) to point at the backend.
 */

const getBase = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? '';
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
};

export interface RunSummary {
  runId: string;
  state: string;
  clients: number;
  step: number;
  epoch: number;
}

export interface ApiRuns {
  runs: RunSummary[];
  totalTokens: number;
  totalTokensPerSecondActive: number;
}

export interface RunDetail {
  runId: string;
  state: string;
  coordinator: {
    clients: unknown[];
    rounds: unknown[];
    config: { warmupTime: number; roundsPerEpoch: number };
  };
  progress: { step: number; epoch: number };
}

export interface ApiRunResponse {
  run: RunDetail;
  isOnlyRun: boolean;
}

/** Normalize run from backend (may use id or runId, etc.) into RunSummary */
function normalizeRun(raw: Record<string, unknown>): RunSummary {
  return {
    runId: (raw.runId as string) ?? (raw.id as string) ?? String(raw.runId ?? raw.id ?? ''),
    state: (raw.state as string) ?? (raw.status as string) ?? 'Unknown',
    clients: Number(raw.clients ?? 0),
    step: Number(raw.step ?? 0),
    epoch: Number(raw.epoch ?? 0),
  };
}

export async function fetchRuns(): Promise<ApiRuns> {
  const res = await fetch(`${getBase()}/runs`);
  if (!res.ok) throw new Error(`Failed to fetch runs: ${res.status}`);
  const data = (await res.json()) as { runs?: unknown[]; totalTokens?: number; totalTokensPerSecondActive?: number };
  const runs = Array.isArray(data.runs)
    ? data.runs.map((r) => normalizeRun(typeof r === 'object' && r !== null ? (r as Record<string, unknown>) : {}))
    : [];
  return {
    runs,
    totalTokens: Number(data.totalTokens ?? 0),
    totalTokensPerSecondActive: Number(data.totalTokensPerSecondActive ?? 0),
  };
}

export async function fetchStatus(): Promise<{ status: string; coordinator?: { status: string } }> {
  const res = await fetch(`${getBase()}/status`);
  if (!res.ok) throw new Error(`Failed to fetch status: ${res.status}`);
  return res.json();
}

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${getBase()}/health`);
  if (!res.ok) throw new Error(`Failed to fetch health: ${res.status}`);
  return res.json();
}

/**
 * Subscribe to run detail stream (NDJSON). Calls onUpdate for each new payload.
 * Returns an unsubscribe function.
 * Only reports HTTP errors after attempting to read the stream (so we don't fail
 * before the first chunk when the backend returns 200 with streaming body).
 */
export function subscribeRunStream(
  runId: string,
  index: string,
  onUpdate: (data: ApiRunResponse) => void,
  onError?: (err: Error) => void
): () => void {
  const base = getBase();
  if (typeof window !== 'undefined' && !base) {
    onError?.(
      new Error(
        'NEXT_PUBLIC_API_URL is not set. Set it to your backend URL (e.g. http://localhost:3000) so the stream hits the backend, not this app.'
      )
    );
    return () => {};
  }
  const url = `${base}/run/${encodeURIComponent(runId)}/${encodeURIComponent(index)}`;
  const ac = new AbortController();

  (async () => {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/x-ndjson' },
        signal: ac.signal,
      });

      if (!res.body) {
        onError?.(new Error(`Stream failed: no response body (${res.status})`));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedAtLeastOnePayload = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value ?? new Uint8Array(0), { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed) as ApiRunResponse;
            receivedAtLeastOnePayload = true;
            onUpdate(data);
          } catch {
            // skip malformed line
          }
        }
      }

      // Flush any remaining line in buffer
      const trimmed = buffer.trim();
      if (trimmed) {
        try {
          const data = JSON.parse(trimmed) as ApiRunResponse;
          receivedAtLeastOnePayload = true;
          onUpdate(data);
        } catch {
          // skip
        }
      }

      // Only report HTTP error if we never got valid NDJSON (don't fail on status before first chunk)
      if (!receivedAtLeastOnePayload && !res.ok) {
        const message =
          res.status === 404
            ? `Run not found (404). Check that this run ID is in the backend RUN_IDS and that the ID matches exactly.`
            : `Stream failed: ${res.status}`;
        onError?.(new Error(message));
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') onError?.(e as Error);
    }
  })();

  return () => ac.abort();
}
