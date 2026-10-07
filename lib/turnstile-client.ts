const TURNSTILE_LOAD_TIMEOUT_MS = 5000;
const TURNSTILE_TOKEN_TIMEOUT_MS = 5000;

function waitForTurnstile(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (window.turnstile) {
        resolve(true);
      } else if (Date.now() - start >= timeoutMs) {
        resolve(false);
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

/** Renders a fresh, disposable invisible Turnstile widget and resolves with
 * its token. Turnstile's invisible widgets appear to be single-use — once a
 * token is produced, Cloudflare tears the widget down internally, so
 * re-executing or resetting the same widget id logs "Cannot find Widget".
 * Rendering a new widget per call sidesteps that entirely. Waits for the
 * Turnstile script to actually finish loading first, rather than checking
 * once and giving up — a fast form (like picking a file and submitting) can
 * easily beat the script's load time otherwise. */
export async function getTurnstileToken(
  siteKey: string | undefined,
  action: string,
): Promise<string> {
  if (!siteKey) return "";

  const ready = await waitForTurnstile(TURNSTILE_LOAD_TIMEOUT_MS);
  if (!ready) return "";

  const container = document.createElement("div");
  document.body.appendChild(container);

  try {
    return await new Promise<string>((resolve) => {
      const timeout = setTimeout(() => resolve(""), TURNSTILE_TOKEN_TIMEOUT_MS);
      window.turnstile!.render(container, {
        sitekey: siteKey,
        action,
        size: "invisible",
        callback: (token: string) => {
          clearTimeout(timeout);
          resolve(token);
        },
      });
    });
  } finally {
    setTimeout(() => container.remove(), 2000);
  }
}
