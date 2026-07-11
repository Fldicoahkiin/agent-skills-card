import app from "../server/app";

// Cloudflare Workers entry. wrangler's run_worker_first routes only /api/* here;
// every other path goes to Workers Static Assets (SPA fallback to index.html), so only the API lives here.
export default app;
