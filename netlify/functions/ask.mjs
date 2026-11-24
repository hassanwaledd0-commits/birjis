// Meyslon's server tier (b): the page (src/js/186a-x_ai~tiers.js) sends {prompt, kind, lang, image?} and gets {text} back.
// The API key lives ONLY in Netlify's environment variables (ANTHROPIC_API_KEY); it is never sent to the page.
// Limits: Netlify's rate limit rule below (per visitor IP), a second per-IP window kept in memory (best effort, per warm
// instance), the prompt length, one picture of limited size, and max_tokens. Set a monthly spend limit on the Anthropic
// Console as the hard ceiling on cost.
// Optional environment variable BIRJIS_AI_MODEL chooses another model (default claude-opus-5-5).
import Anthropic from "@anthropic-ai/sdk";

export const config = {
  path: "/api/ask", // = ai_endpoint in site.config.json (tools/check_links.py checks they match)
  method: ["POST"],
  rateLimit: { windowLimit: 8, windowSize: 60, aggregateBy: ["ip", "domain"] },
};

export const LIMITS = { prompt: 20000, imageB64: 2_000_000, body: 2_600_000, perIp: 30, perIpMs: 10 * 60_000 };
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? "").trim();

const SYSTEM = `You answer inside "Birjis", a free educational website in Arabic and English about three aircraft (A380, 747-400, 737-800): their parts and systems, physics lessons, a simplified cockpit and flight simulator, and training AMM cards.
The user message is written by the website. It holds the persona (Meyslon, a friendly engineer), what the student is looking at, and the student's question. Follow its instructions on tone, language and length.
Rules that always apply:
- Help only with aviation, aircraft engineering and maintenance training, the physics behind them, and studying them. For anything else, say in one short sentence that you only help with learning about aircraft.
- Never invent numbers, part numbers, torque values, limits or procedures. If you are not sure, say so.
- Everything is for education only, not for operating or maintaining a real aircraft; real work follows the approved manuals and licensed staff.
- Never name or show airline or brand logos. Manufacturer names in plain Latin text are fine.`;

const REFUSAL = {
  ar: "ما أكدر أجاوب على هذا السؤال هنا. اسألني عن الطائرات وقطعها وأنظمتها والطيران، وأنا حاضر.",
  en: "I can't answer that here. Ask me about aircraft, their parts and systems, or flying, and I'm happy to help.",
};

const recent = new Map(); // ip -> [timestamps]
function allowIp(ip, now = Date.now()) {
  if (!ip) return true;
  const a = (recent.get(ip) || []).filter((t) => now - t < LIMITS.perIpMs);
  if (a.length >= LIMITS.perIp) { recent.set(ip, a); return false; }
  a.push(now); recent.set(ip, a);
  if (recent.size > 5000) for (const [k, v] of recent) if (!v.length || now - v[v.length - 1] > LIMITS.perIpMs) recent.delete(k);
  return true;
}

const json = (status, obj) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export default async function ask(req, context) {
  if (req.method !== "POST") return json(405, { error: "method" });
  const origin = req.headers.get("origin");
  try { if (origin && new URL(origin).host !== new URL(req.url).host) return json(403, { error: "origin" }); } catch { return json(403, { error: "origin" }); }
  const key = env("ANTHROPIC_API_KEY");
  if (!key) return json(503, { error: "not_configured" });
  if ((+req.headers.get("content-length") || 0) > LIMITS.body) return json(413, { error: "too_large" });
  if (!allowIp(context?.ip)) return json(429, { error: "rate_limited" });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const lang = body?.lang === "en" ? "en" : "ar";
  if (!prompt) return json(400, { error: "empty" });
  if (prompt.length > LIMITS.prompt) return json(413, { error: "too_long" });

  const content = [];
  if (body.image != null) {
    const { media_type, data } = body.image || {};
    if (!IMAGE_TYPES.has(media_type) || typeof data !== "string" || !/^[A-Za-z0-9+/=]+$/.test(data)) return json(400, { error: "bad_image" });
    if (data.length > LIMITS.imageB64) return json(413, { error: "too_large" });
    content.push({ type: "image", source: { type: "base64", media_type, data } });
  }
  content.push({ type: "text", text: prompt });

  const client = new Anthropic({ apiKey: key, maxRetries: 0, timeout: 25_000 });
  try {
    const msg = await client.beta.messages.create({
      model: env("BIRJIS_AI_MODEL") || "claude-opus-5-5",
      max_tokens: 3000,
      system: SYSTEM,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{ role: "user", content }],
    });
    if (msg.stop_reason === "refusal") return json(200, { text: REFUSAL[lang], stop: "refusal" });
    const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    if (!text) return json(502, { error: "empty_answer" });
    return json(200, { text, stop: msg.stop_reason });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json(429, { error: "rate_limited" });
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return json(503, { error: "not_configured" });
    if (e instanceof Anthropic.BadRequestError) return json(400, { error: "bad_request" });
    if (e instanceof Anthropic.APIConnectionError) return json(504, { error: "upstream_unreachable" });
    if (e instanceof Anthropic.APIError) return json(502, { error: "upstream", status: e.status ?? null });
    return json(500, { error: "server" });
  }
}
