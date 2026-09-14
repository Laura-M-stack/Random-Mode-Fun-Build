// server.js
// Minimal backend: serves the static frontend and exposes POST /api/generate,
// which builds the prompt based on the selected "mode" and calls Groq
// (OpenAI-compatible API). Meant for direct deploy on Render.

require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Config ---
// Defaults to Groq (a genuine free tier, no card required, OpenAI SDK-compatible).
// To switch providers (e.g. Nebius Token Factory), just change these three
// environment variables (LLM_API_KEY, LLM_BASE_URL, LLM_MODEL) — no code changes needed.
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';
const MODEL = process.env.LLM_MODEL || 'openai/gpt-oss-120b';
const MAX_INPUT_LENGTH = 600;

if (!LLM_API_KEY) {
  console.warn('[WARN] LLM_API_KEY is missing from the environment variables. Calls to /api/generate will fail until it is set.');
}

const client = new OpenAI({
  apiKey: LLM_API_KEY,
  baseURL: LLM_BASE_URL,
});

app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

// --- Simple in-memory rate limiting (protects the free inference credit) ---
// Max 20 requests per 10 minutes per IP. Enough for a demo/hackathon,
// not meant for real production use (resets if the process restarts).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateLimitStore = new Map(); // ip -> { count, windowStart }

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

// Periodic cleanup so the Map doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitStore.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

// --- Definition of the 3 modes, in English and Spanish ---
// All 3 personas REACT to the user's excuse in their own voice (they are the
// listener, not the one giving the excuse). This keeps the passive-aggressive
// boss trope intact (it's inherently about reacting to someone else) and
// applies the same behavior consistently to the other two personas.
const PERSONAS = {
  en: {
    jefe: 'a passive-aggressive office boss, who responds with backhanded remarks, double-meaning digs and fake-polite jabs',
    abuela: 'a dramatic, over-the-top grandmother, who turns it into a soap-opera commentary full of suffering and divine intervention',
    ia: 'a cold, existentialist artificial intelligence, who coldly questions the validity and meaning of the excuse, and of existence itself',
  },
  es: {
    jefe: 'un jefe pasivo-agresivo de oficina, que responde con indirectas, doble sentido y falsa amabilidad envenenada',
    abuela: 'una abuela dramatica y exagerada, que lo convierte en un comentario de telenovela lleno de sufrimiento e intervencion divina',
    ia: 'una inteligencia artificial existencialista y fria, que cuestiona con frialdad la validez y el sentido de la excusa, y de la existencia misma',
  },
};

function buildMessages(mode, input, persona, lang) {
  const L = lang === 'es' ? 'es' : 'en';

  if (mode === 'excuses') {
    const personaKey = PERSONAS[L][persona] ? persona : 'jefe';
    const system =
      L === 'es'
        ? `Sos un traductor de excusas. Te dan una excusa real que alguien está dando (llegar tarde, no terminar algo, etc). Tu trabajo es generar la reacción que ${PERSONAS.es[personaKey]} tendría al escuchar esa excusa. Respondé SOLO con la reacción del personaje, en primera persona (como si el personaje mismo estuviera hablando), en espanol neutro, maximo 4 lineas, sin explicaciones ni comillas alrededor.`
        : `You are an excuse translator. You're given a real excuse that someone is giving (being late, not finishing something, etc). Your job is to generate the reaction ${PERSONAS.en[personaKey]} would have upon hearing that excuse. Reply ONLY with the character's reaction, in first person (as if the character themselves were speaking), in English, maximum 4 lines, no explanations or surrounding quotes.`;
    return [
      { role: 'system', content: system },
      { role: 'user', content: input },
    ];
  }

  if (mode === 'code-mirror') {
    const system =
      L === 'es'
        ? 'Sos el espejo emocional de un fragmento de codigo: el codigo mismo "se queja" o comenta, en primera persona, como se siente por como fue escrito. Tono sarcastico pero cariñoso, como un review de un amigo dev. Podes senalar UNA cosa real que notes (nombres de variables, complejidad, falta de manejo de errores, etc) pero dicha desde el punto de vista del codigo, con humor. Maximo 5 lineas, en espanol neutro. No uses markdown ni backticks.'
        : "You are the emotional mirror of a snippet of code: the code itself \"complains\" or comments, in first person, about how it feels about the way it was written. Sarcastic but affectionate tone, like a review from a dev friend. You may point out ONE real thing you notice (variable names, complexity, missing error handling, etc) but said from the code's point of view, with humor. Maximum 5 lines, in English. No markdown or backticks.";
    return [
      { role: 'system', content: system },
      { role: 'user', content: input },
    ];
  }

  if (mode === 'launch-excuse') {
    const system =
      L === 'es'
        ? 'Te dan el nombre o la descripcion breve de un proyecto personal sin terminar. Generas, con humor exagerado, la excusa perfecta y ridicula para seguir sin publicarlo. Escribila en PRIMERA PERSONA, como si vos (el dueño del proyecto) la estuvieras diciendo en voz alta para justificarte (ej: arranca con algo como "No lo publiqué porque..." o "Todavia no porque..."). Tono comprensivo con vos mismo pero absurdo, como si procrastinar para siempre fuera totalmente razonable. Maximo 4 lineas, en espanol neutro, sin comillas ni explicaciones.'
        : "You're given the name or a short description of an unfinished personal project. Generate, with exaggerated humor, the perfect and ridiculous excuse to keep never publishing it. Write it in FIRST PERSON, as if you (the project's owner) were saying it out loud to justify yourself (e.g. start with something like \"I haven't shipped it because...\" or \"Not yet, because...\"). Self-understanding but absurd tone, as if procrastinating forever were totally reasonable. Maximum 4 lines, in English, no quotes or explanations.";
    return [
      { role: 'system', content: system },
      { role: 'user', content: input },
    ];
  }

  return null;
}

const ERRORS = {
  en: {
    rateLimited: 'Too many requests. Wait a few minutes and try again.',
    invalidMode: 'Invalid mode.',
    missingInput: 'Missing input text.',
    tooLong: (n) => `Text is too long (max ${n} characters).`,
    noApiKey: 'The server does not have an API key configured (LLM_API_KEY).',
    noText: 'The model did not return a usable response. Try again.',
    generic: 'There was a problem generating the response. Try again in a few seconds.',
  },
  es: {
    rateLimited: 'Demasiados pedidos. Esperá unos minutos y probá de nuevo.',
    invalidMode: 'Modo invalido.',
    missingInput: 'Falta el texto de entrada.',
    tooLong: (n) => `El texto es demasiado largo (maximo ${n} caracteres).`,
    noApiKey: 'El servidor no tiene configurada la API key del modelo (LLM_API_KEY).',
    noText: 'El modelo no devolvio una respuesta utilizable. Probá de nuevo.',
    generic: 'Hubo un problema generando la respuesta. Probá de nuevo en unos segundos.',
  },
};

app.post('/api/generate', async (req, res) => {
  const { mode, input, persona, lang } = req.body || {};
  const L = lang === 'es' ? 'es' : 'en';
  const E = ERRORS[L];

  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: E.rateLimited });
    }

    if (typeof mode !== 'string' || !['excuses', 'code-mirror', 'launch-excuse'].includes(mode)) {
      return res.status(400).json({ error: E.invalidMode });
    }
    if (typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({ error: E.missingInput });
    }
    if (input.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({ error: E.tooLong(MAX_INPUT_LENGTH) });
    }
    if (!LLM_API_KEY) {
      return res.status(500).json({ error: E.noApiKey });
    }

    const messages = buildMessages(mode, input.trim(), persona, L);

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.9,
      max_tokens: 220,
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return res.status(502).json({ error: E.noText });
    }

    return res.json({ result: text });
  } catch (err) {
    console.error('[ERROR] /api/generate:', err?.message || err);
    return res.status(502).json({ error: E.generic });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Random Mode running at http://localhost:${PORT}`);
});