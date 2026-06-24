export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #000000; color: #f5f5f7; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2.5rem; background: #08090a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
      h1 { font-size: 1.5rem; margin: 0 0 0.75rem; letter-spacing: -0.02em; }
      p { color: #94a3b8; margin: 0 0 2rem; font-size: 14px; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.6rem 1.2rem; border-radius: 8px; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; font-weight: 500; transition: opacity 0.2s; }
      a:hover, button:hover { opacity: 0.9; }
      .primary { background: #e10600; color: #f5f5f7; }
      .secondary { background: transparent; color: #94a3b8; border-color: rgba(255,255,255,0.08); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
