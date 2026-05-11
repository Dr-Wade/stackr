import { reactive } from 'vue';

export type PreflightStatus = 'unknown' | 'pending' | 'ok' | 'refused';

const state = reactive<Record<string, PreflightStatus>>({});
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const PROBE_TIMEOUT_MS = 6000;

/**
 * Best-effort detection of "this URL refuses embedding."
 *
 * Since we have no backend, we cannot read response headers. Instead, we
 * create a hidden iframe with that URL and wait for its load event. Modern
 * browsers do still fire `load` on iframes that get blocked by X-Frame-Options
 * or CSP frame-ancestors — but the contentDocument access throws or the
 * document body is empty. We use a coarse heuristic: if `load` hasn't fired
 * within PROBE_TIMEOUT_MS, mark as 'refused'. This is honestly imperfect —
 * slow sites will be misclassified — but it surfaces the common case where
 * GitHub / Twitter / etc. simply refuse to render.
 */
export function probeUrl(id: string, url: string): void {
  state[id] = 'pending';
  const probe = document.createElement('iframe');
  probe.style.position = 'fixed';
  probe.style.left = '-9999px';
  probe.style.width = '1px';
  probe.style.height = '1px';
  probe.style.visibility = 'hidden';
  probe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  probe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  probe.src = url;

  let settled = false;
  const settle = (status: PreflightStatus) => {
    if (settled) return;
    settled = true;
    state[id] = status;
    const t = timers.get(id);
    if (t) {
      clearTimeout(t);
      timers.delete(id);
    }
    if (probe.parentNode) probe.parentNode.removeChild(probe);
  };

  probe.addEventListener('load', () => {
    // Heuristic: if the document body is empty AND we can access it, the
    // server probably returned an empty response or got blocked at the
    // network layer. Otherwise treat as ok.
    try {
      const doc = probe.contentDocument;
      if (doc && doc.body && doc.body.children.length === 0 && doc.body.textContent === '') {
        // Some refused frames still fire load with an empty doc
        settle('refused');
      } else {
        settle('ok');
      }
    } catch {
      // Cross-origin (the normal case) — we can't introspect, but load
      // having fired at all is a positive signal.
      settle('ok');
    }
  });
  probe.addEventListener('error', () => settle('refused'));

  timers.set(
    id,
    setTimeout(() => settle('refused'), PROBE_TIMEOUT_MS),
  );

  document.body.appendChild(probe);
}

export function clearPreflight(id: string) {
  delete state[id];
  const t = timers.get(id);
  if (t) {
    clearTimeout(t);
    timers.delete(id);
  }
}

export function usePreflight() {
  return {
    status: state,
    probeUrl,
    clearPreflight,
  };
}
