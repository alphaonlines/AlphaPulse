// Runtime configuration loader for AlphaPulse (kiosk / static use)
// Reads the existing `.env` file in the project root and exposes it
// as `window.__ALPHAPULSE_ENV__` so the rest of the app can use it.
// This avoids needing a dev server or bundler at runtime.

(function () {
  function parseEnv(text) {
    const env = {};
    if (!text) return env;

    text.split('\n').forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) return;

      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) return;

      const key = line.slice(0, eqIndex).trim();
      let value = line.slice(eqIndex + 1).trim();

      // Strip surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    });

    return env;
  }

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '.env', false); // synchronous so config is ready before main.js runs
    xhr.send(null);

    if (xhr.status >= 200 && xhr.status < 300) {
      window.__ALPHAPULSE_ENV__ = parseEnv(xhr.responseText);
    } else {
      window.__ALPHAPULSE_ENV__ = {};
    }
  } catch (e) {
    console.error('Failed to load .env file for AlphaPulse:', e);
    window.__ALPHAPULSE_ENV__ = {};
  }
})();

