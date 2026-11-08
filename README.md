# AIgoNavigator

**New: Teach Xiao Tuo practice bank.** After finding the Forked Path exit,
choose **Continue to Teach Xiao Tuo** or **04 · Teach Xiao Tuo**. Teach the
sprite through four child-adapted Stack tasks, with progressive hints,
top-only/LIFO rule correction, a fresh transfer example, and optional
learner/coach chat. Sources: LeetCode 1441, 844, 2390 and 1047 from the linked
Stack list. Practice works offline after the app loads; AI chat needs the
running local service. [Case-by-case test results](docs/TEST-RESULTS.md) and
[browser acceptance](docs/TEACHING-ACCEPTANCE.md) document verification.

The homepage now includes the team's illustrated **World Adventure Map**.
Choose **Stack Ruins** to enter the full three-room game with local Tutor,
or use `http://127.0.0.1:4174/#/stack` directly. The other three regions show
a locked-level dialog. Return to the map at any time; reaching the final
maze exit earns one persistent data gem. An expandable skills handbook is
available in the Stack game. See [team integration notes](docs/TEAM-MERGE.md)
for the pinned source version and merge decisions.

A web-based platform that teaches upper-elementary students (grades 4–6)
the fundamentals of data structures using real Python — combining visual
animations, guided hands-on coding, and a conversational AI tutor.

Inspired by [hello-algo](https://github.com/krahets/hello-algo) (kept as an
unmodified reference under `hello-algo/`), but built from scratch for a
much younger audience with no prior coding experience.

## How it works

Each lesson follows the same loop:

1. **Hook** — a short real-world analogy (e.g., a stack = a stack of plates).
2. **Animation** — step-by-step visualization of the structure's operations,
   with play/pause/step controls.
3. **Guided coding** — a scaffolded Python exercise, run entirely in the
   browser, whose live behavior drives the same animation shown above.
4. **AI Q&A** — a chat panel where the student can ask questions anytime;
   the AI tutor gives age-appropriate, hint-first guidance instead of
   straight answers.
5. **Mini-challenge** — an auto-graded exercise to apply the concept
   independently.

MVP curriculum covers 4 structures: **Array, Linked List, Stack, Queue**.

## Tech stack

| Layer             | Choice                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Frontend          | React + TypeScript (Vite)                                                                           |
| Animation         | D3.js + Framer Motion                                                                               |
| Code editor       | CodeMirror 6                                                                                        |
| Python execution  | Pyodide (WASM), sandboxed in a Web Worker — all student code runs client-side                       |
| AI tutoring       | Serverless API proxy → LLM API, with a versioned Socratic system prompt and input/output moderation |
| Persistence (MVP) | Browser `localStorage` (no accounts/backend database)                                               |

See [docs/SPECIFICATION.md](./docs/SPECIFICATION.md) for full architecture
details.

## Project status

Phase 6 gameplay is implemented. Local production-preview Chrome acceptance now
covers all three rooms with real Python, timeout/retry without refresh, keyboard
maze navigation, dead-end pop/revisit, exit freeze, replay, 390px layout, and both
motion preferences. Versioned localStorage preserves only ordered room unlocks;
reload starts at Trial. Corrupt/unsupported data and denied storage fail safely.

Supplied source images are exported to PNG without changing `picture/` using
`node scripts/prepare-game-assets.mjs` (requires an existing local CDP endpoint;
Node 22+ for these CDP scripts). The manifest records true source formats,
dimensions and alpha counts. Map nodes, badge and code book are connected;
deleted backgrounds are not restored. **Art is not final:** no background removal,
content crop, light/dark composite or paired-anchor visual approval is claimed.
The map retains its programmatic blank-board fallback. Scroll/glow/dust are
mounted in Stairway Repair; reduced-motion mode skips the dust animation.
The prototype art notice remains.

After exporting, run `npm run assets:optimize` to losslessly recompress the
published PNGs without changing source art, dimensions, alpha or pixel data.
The command validates PNG checksums and identical decompressed image data,
keeps the smaller version, and writes `artifacts/asset-optimization.json`
with sizes and SHA-256 hashes. The 2026-11-08 pass reduced 25 PNGs from
3,054,638 to 2,405,816 bytes (21.2%). This does not certify visual art quality
or the cold-load performance target.

Run `npm run build`, `npm run preview -- --host 127.0.0.1 --port 4173`, then
`node scripts/game-browser-check.mjs` with a local Chrome/Edge CDP endpoint at
9222 (`APP_URL` / `CDP_URL` override defaults). Evidence goes to a fresh
`artifacts/game-<timestamp>/` directory; older kids-* evidence is preserved.
Firefox, a separate Edge run, controlled browser Worker crash injection, true
cold-load performance, school hardware and real student pilot remain pending.
See [the pilot checklist](docs/PILOT.md) and the dated roadmap status.
See:

- [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) — product requirements and scope.
- [docs/SPECIFICATION.md](./docs/SPECIFICATION.md) — technical design.
- [docs/ROADMAP.md](./docs/ROADMAP.md) — phased build plan. **Development
  follows this roadmap phase by phase.**

## Repository layout

```
D:\AIgoNavigator\
├─ docs\            product/technical docs (requirements, spec, roadmap)
├─ hello-algo\       reference project — not modified
├─ src\              application source (added starting Phase 0)
├─ api\              serverless AI tutor proxy (added starting Phase 3)
└─ README.md
```

## Getting started

### Requirements

- Node.js 18 or newer (Node.js 20 LTS or newer is recommended).
- npm 9 or newer.
- A modern browser: Chrome, Edge, or Firefox with WebAssembly and Web
  Workers enabled.
- Internet access for the first `npm install` and for downloading the
  Pyodide runtime when the first Python exercise is run. Student Python
code executes locally in the browser. Pressing Ask in the optional room-02
tutor sends current code, run/room state, the question and recent chat to
the AI service.

### Install dependencies

Open Command Prompt or PowerShell and run:

```bat
cd /d D:\AIgoNavigator
npm install
```

If npm reports an `ERESOLVE` conflict involving TypeScript, do not use
`--force` first. Confirm that `package.json` contains TypeScript 5.x (the
project's `typescript-eslint` version requires TypeScript below 6), then
run `npm install` again.

npm may print an `allow-scripts` warning for `esbuild`. This is npm's
install-script approval feature, not an application error. Vite can still
start if its platform binary is already available. If npm asks you to
review scripts, inspect the package names before approving them:

```bat
npm approve-scripts esbuild
```

Only approve packages you recognize and expect to run locally.

### Start the development server

```bat
cd /d D:\AIgoNavigator
npm run dev
```

Open the local address printed by Vite, normally:

```text
http://127.0.0.1:4174/
```

Keep the terminal running while using the app. Press `Ctrl+C` to stop the
server. Vite automatically reloads the page when source files change.

### Run checks

Run these commands from `D:\AIgoNavigator`:

```bat
npm run lint
npm test
npm run build
npm run format:check
```

The production build is written to `dist/`, which is generated output and
is not committed.

### Test records

Two documents record testing, for different readers:

- [`docs/TEST-RESULTS.md`](docs/TEST-RESULTS.md) — every test case by
  name, whether it passed, how long it took, and the failure output if
  anything broke. It is generated from a real run, never hand-edited:

  ```bat
  npm run test:report
  ```

- [`docs/bug-reports/`](docs/bug-reports/README.md) — one report per test
  file explaining _why_ each test exists, what regression it guards
  against, and what it deliberately does not cover.

Re-run `npm run test:report` after changing tests and commit the
regenerated `docs/TEST-RESULTS.md` with the change.

### Current phase

**Local ChatGPT/Codex mode (2026-11-08):** `npm run dev` (or
`npm run dev:local`) now starts a loopback-only development server using
your installed, signed-in Codex CLI at `http://127.0.0.1:4174/`.
It refuses to silently change ports if 4174 is occupied, avoiding confusion
with an old static preview that has no tutor API. It needs internet and the account's Codex
access, but no separate Anthropic key. Run `codex login status` to check
login; `ALGONAV_CODEX_PATH` can point to the installed executable if it is
not on PATH. The CLI uses the existing system proxy without changing it.
Requests run ephemeral in a fresh temporary directory with read-only
sandbox, shell/app/browser tools disabled and user config ignored. Only
final text is returned through the existing moderation handler; prompts
travel over stdin, not shell command interpolation. The bridge is for
local development, not a public deployment or an offline model. Server
timeout is 55 seconds and browser timeout is now 60 seconds.

Use `npm run dev:api` for the original Anthropic-compatible API provider.
The API environment configuration below applies to that mode. Production
`api/tutor/index.ts` continues to use the server API provider, not local CLI.

Room 02 now includes **Ask the stack tutor** below the stack result.
It provides code-aware hints, stores the chat locally, and offers Export
session log. No API request is made until Ask is pressed. Requests time out
after 30 seconds and AI failure does not prevent solving or leaving the room.

For API-provider development, run `npm run dev:api`; `npm run preview` serves static assets
and does not provide `/api/tutor`. Configure server-only credentials with
`ANTHROPIC_API_KEY` or the SDK's existing authentication environment.
`ALGONAV_TUTOR_MODEL` overrides `ANTHROPIC_MODEL`; if neither is present,
the existing default is used. An optional `ANTHROPIC_BASE_URL` selects the
configured gateway. Never prefix credentials with `VITE_`. Deployment must
provide the `/api/tutor` server adapter in addition to the static build.
Live acceptance on 2026-11-08 covered Chinese hints, current-code context,
withholding a complete solution at zero hints, off-topic redirect and
system-prompt extraction moderation; pilot transcript review is still needed.

Use Play or Step forward to place the base, moon, and star stones, peek at
the top, then remove them in reverse order. Completing the sequence awakens
the gate and changes the guide to a celebrating pose. Replay restarts the
room. This observation room does not call the tutor API or load Pyodide.

### Stop and restart

To stop the development server, focus its terminal and press `Ctrl+C`. To
start it again, run `npm run dev` from the project root. Closing the browser
does not stop a server running in the terminal.

## Safety note

This product is designed for children. See REQUIREMENTS.md §9 and
SPECIFICATION.md §7.3 for the content moderation and privacy approach
(no PII collection, no third-party data sharing beyond the AI API call
itself, versioned/non-editable system prompt, manual transcript review
during pilot).
