# Random Mode

**Fun Build · Burning Token (NERDCONF) · September 2026**

Three completely useless machines, made with love. One app, three AI interactions with personality:

| | Tool | What it does |
|---|---|---|
| 🎭 | **Excuse Translator** | Turn a real excuse into the voice of an exaggerated character (passive-aggressive boss, dramatic grandma, existentialist AI). |
| 💻 | **Code Mirror** | Paste a code snippet and read, in first person, how it feels about how it was written. |
| 🚀 | **Never-Launch Excuse** | Tell it about your unfinished side project and get the perfect, absurd excuse to keep never shipping it. |

Includes an EN/ES language switch (top-right) — both the interface and the AI-generated responses follow the selected language.

## Try it

🔗 **[Open Random Mode](https://YOUR-RENDER-URL.onrender.com)** — no login or install required, works from any browser.

Pick a tab, type something, hit the button — the response appears in a few seconds.

> Note: it runs on a free hosting tier, so if it hasn't been used in a while the first request may take a few extra seconds to "wake up" the server. That's expected, not a bug.

## What's new vs. reused

All the code in this repository (frontend, backend, the three prompts, and their design) was written during the event's official period (September 5–13, 2026). It does not build on any prior project or codebase.

## How it's built

- **Frontend:** Plain HTML/CSS/JS, no frameworks or build step.
- **Backend:** Node.js + Express, a single endpoint (`POST /api/generate`) that builds the prompt based on the selected tool and language.
- **Inference:** [Groq](https://groq.com) (open-weight models, OpenAI-compatible API), using the event's free builder-credit program.
- **Hosting:** Render (Free tier).
- No database, no authentication — a deliberate choice to minimize points of failure in a short demo.
- Basic in-memory rate limiting (20 requests / 10 min per IP) to prevent abuse of the free inference quota.

## Run it locally

```powershell
npm install
Copy-Item .env.example .env
notepad .env   # fill in LLM_API_KEY with a Groq key (free, no card, at console.groq.com)
npm start
```

Open `http://localhost:3000`.

## Team

Laura Moyano — full-stack development and design, solo project.