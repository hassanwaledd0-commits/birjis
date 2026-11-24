// Meyslon's server tier (netlify/functions/ask.mjs) against a fake Anthropic API on localhost: no key, no network, no cost.
// Checks the request it sends (model, fallbacks, effort, key header, picture) and how every answer or error maps for the page.
// usage: node tests/ai_function_test.mjs
import http from "node:http";
let last = null;
const srv = http.createServer((req, res) => {
  let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => {
    const j = JSON.parse(b || "{}"); last = { headers: req.headers, body: j, url: req.url };
    const txt = JSON.stringify(j.messages).match(/SCN:(\w+)/)?.[1] || "ok";
    const send = (st, o) => { res.writeHead(st, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
    const msg = (content, stop = "end_turn") => send(200, { id: "msg_1", type: "message", role: "assistant", model: j.model, content, stop_reason: stop, stop_details: null, usage: { input_tokens: 10, output_tokens: 5 } });
    if (txt === "ok") return msg([{ type: "thinking", thinking: "", signature: "x" }, { type: "text", text: "الجناح يولّد الرفع." }]);
    if (txt === "refusal") return msg([], "refusal");
    if (txt === "empty") return msg([{ type: "text", text: "  " }]);
    if (txt === "429") return send(429, { type: "error", error: { type: "rate_limit_error", message: "slow down" } });
    if (txt === "529") return send(529, { type: "error", error: { type: "overloaded_error", message: "overloaded" } });
    if (txt === "401") return send(401, { type: "error", error: { type: "authentication_error", message: "bad key" } });
    send(500, { type: "error", error: { type: "api_error", message: "?" } });
  });
});
await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));
process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${srv.address().port}`;
const { default: ask, config, LIMITS } = await import("../netlify/functions/ask.mjs");
const SITE = "https://birjis3.netlify.app";
let fails = 0, n = 0;
const ok = (cond, what) => { n++; if (!cond) { fails++; console.log("FAIL", what); } };
const call = async (body, o = {}) => {
  const r = await ask(new Request(SITE + "/api/ask", { method: o.method || "POST", headers: { "content-type": "application/json", origin: o.origin ?? SITE },
    body: o.method === "GET" ? undefined : typeof body === "string" ? body : JSON.stringify(body) }), { ip: o.ip || "10.0.0." + n });
  return { st: r.status, j: await r.json() };
};

// the path the function answers on = ai_endpoint of site.config.json
const cfg = JSON.parse((await import("node:fs")).readFileSync(new URL("../site.config.json", import.meta.url), "utf8"));
ok(config.path === cfg.ai_endpoint, `config.path ${config.path} = ai_endpoint ${cfg.ai_endpoint}`);
ok(config.rateLimit && config.rateLimit.windowLimit > 0 && config.rateLimit.aggregateBy.includes("ip"), "Netlify rate limit rule per IP");

delete process.env.ANTHROPIC_API_KEY;
let r = await call({ prompt: "سؤال" });
ok(r.st === 503 && r.j.error === "not_configured", "no key -> 503 not_configured " + JSON.stringify(r));
process.env.ANTHROPIC_API_KEY = "test-key-not-real";

r = await call(null, { method: "GET" }); ok(r.st === 405, "GET -> 405");
r = await call({ prompt: "x" }, { origin: "https://evil.example" }); ok(r.st === 403, "other origin -> 403");
r = await call("{not json"); ok(r.st === 400 && r.j.error === "bad_json", "bad json -> 400");
r = await call({ prompt: "   " }); ok(r.st === 400 && r.j.error === "empty", "empty -> 400");
r = await call({ prompt: "ا".repeat(LIMITS.prompt + 1) }); ok(r.st === 413 && r.j.error === "too_long", "too long -> 413");
r = await call({ prompt: "صورة", image: { media_type: "image/svg+xml", data: "AAAA" } }); ok(r.st === 400 && r.j.error === "bad_image", "svg picture refused");
r = await call({ prompt: "صورة", image: { media_type: "image/jpeg", data: "A".repeat(LIMITS.imageB64 + 4) } }); ok(r.st === 413, "huge picture refused");

r = await call({ prompt: "ما وظيفة الجناح؟ SCN:ok", lang: "ar" });
ok(r.st === 200 && r.j.text === "الجناح يولّد الرفع.", "answer text " + JSON.stringify(r));
ok(last && last.body.model === "claude-opus-5-5", "model claude-opus-5-5");
ok(last && last.body.fallbacks === "default", "server-side fallbacks: default");
ok(last && /server-side-fallback-2026-07-01/.test(last.headers["anthropic-beta"] || ""), "fallback beta header");
ok(last && last.body.output_config?.effort === "low", "effort low");
ok(last && last.body.max_tokens === 3000, "max_tokens 3000");
ok(last && (last.headers["x-api-key"] === "test-key-not-real" || last.headers["authorization"] === "Bearer test-key-not-real"), "key sent by the server only " + JSON.stringify({k: last.headers["x-api-key"], a: last.headers["authorization"]}));
ok(last && typeof last.body.system === "string" && /only help with learning about aircraft/.test(last.body.system), "system prompt keeps the topic");
ok(last && !("thinking" in last.body), "thinking not set (adaptive by default)");

r = await call({ prompt: "صورة SCN:ok", image: { media_type: "image/jpeg", data: "/9j/AAAA" } });
ok(r.st === 200 && last.body.messages[0].content[0].type === "image" && last.body.messages[0].content[0].source.media_type === "image/jpeg", "picture forwarded as an image block");

process.env.BIRJIS_AI_MODEL = "claude-haiku-5-5";
r = await call({ prompt: "SCN:ok" }); ok(last.body.model === "claude-haiku-5-5", "BIRJIS_AI_MODEL overrides the model");
delete process.env.BIRJIS_AI_MODEL;

r = await call({ prompt: "SCN:refusal", lang: "en" }); ok(r.st === 200 && r.j.stop === "refusal" && /aircraft/.test(r.j.text), "refusal -> polite text, never empty");
r = await call({ prompt: "SCN:empty" }); ok(r.st === 502 && r.j.error === "empty_answer", "empty answer -> 502 (page falls to the next tier)");
r = await call({ prompt: "SCN:429" }); ok(r.st === 429 && r.j.error === "rate_limited", "upstream 429 -> 429 rate_limited");
r = await call({ prompt: "SCN:529" }); ok(r.st === 502 && r.j.error === "upstream", "overloaded -> 502");
r = await call({ prompt: "SCN:401" }); ok(r.st === 503 && r.j.error === "not_configured", "bad key -> 503 not_configured");

// the per-IP window kept in memory
let st = 0; for (let i = 0; i <= LIMITS.perIp; i++) st = (await call({ prompt: "SCN:ok" }, { ip: "203.0.113.9" })).st;
ok(st === 429, "per-IP limit after " + LIMITS.perIp + " questions");

console.log("auth header used:", last.headers["x-api-key"] ? "x-api-key" : "authorization");
srv.close();
console.log(fails ? `AI FUNCTION: ${fails} of ${n} checks failed` : `AI FUNCTION OK: ${n} checks`);
process.exit(fails ? 1 : 0);
