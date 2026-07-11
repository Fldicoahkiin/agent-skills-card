import { handle } from "hono/vercel";
import app from "../src/server/app";

// Vercel Edge Function entry. vercel.json rewrites all of /api/* here;
// Hono routes internally on the original request URL (/api/svg, /api/repo, /api/discover).
// The CF side uses src/worker/index.ts; both wrap the same app, and getToken inside it resolves the token.
export const config = { runtime: "edge" };

export default handle(app);
