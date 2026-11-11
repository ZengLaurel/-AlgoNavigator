# AIgoNavigator — Roadmap

## 当前执行计划：四板块扩展（2026-11-11）

**需求基线：** [REQUIREMENTS.md §12](./REQUIREMENTS.md#12-四大板块完整教学需求2026-11-11)。
数组、链表、队列现已明确纳入后续交付范围，每个板块对齐 Stack 的完整功能：
动画、导师教学、知识补充、真实 Python 任务、独立应用挑战及教小拓题库。
知识来源为本地 `hello-algo/` 的数组、链表和队列章节，参考版本及教学边界
以需求文档 §12.2 为准，参考仓库保持只读。

本轮只更新路线图；下列新增阶段均为**未开始**，不表示已开发或通过测试。
`SPECIFICATION.md` 仍主要描述 Stack，**下一项实际工作是 Phase 10 的规格同步**。
必须先完成设计门槛，才进入 Phase 11 的实现；不能直接将 Stack-only 的状态、
执行接口和提示词复制到三个板块。

| 工作项                            | 当前状态               | 下一步 / 完成证据                            |
| --------------------------------- | ---------------------- | -------------------------------------------- |
| Phase 0–6、Stack Tutor 与教学题库 | 已有实现及历史验证记录 | 后续每阶段保持回归，不代表所有人工验收已完成 |
| 四板块需求                        | 已明确，2026-11-11     | REQUIREMENTS.md §12                          |
| Phase 7 美术与视觉完善            | 部分完成               | 透明素材、合成与锚点视觉检查等剩余项继续保留 |
| Phase 8 试点加固                  | 部分完成               | 跨浏览器、真实设备、冷启动及故障恢复证据     |
| Phase 9 真实学生试点              | 已准备，未运行         | PILOT.md、实际观察与结果记录                 |
| Phase 10 规格与内容设计           | 未开始，下一步         | 三板块数据契约、教学内容和判定设计           |
| Phase 11 共用能力扩展             | 未开始                 | 执行、导师、教学判定、导航与存档兼容验证     |
| Phase 12 数组 Supply Camp         | 未开始                 | 四阶段体验、手册、导师、至少四题及验收       |
| Phase 13 链表 Misty Forest        | 未开始                 | 四阶段体验、手册、导师、至少四题及验收       |
| Phase 14 队列 Harbor Pier         | 未开始                 | 四阶段体验、手册、导师、至少四题及验收       |
| Phase 15 四板块联合验收           | 未开始                 | 全回归、四区进度、人工验收及待办清单         |

**执行顺序与历史阶段的关系：** 新功能沿 Phase 10 → 11 → 12 → 13 → 14 → 15
顺序推进，每阶段满足自己的退出标准后再进入下一阶段。用户确认的扩展范围
允许先进行这些内部设计与开发，不以未运行的 Phase 9 作为开发前置条件。
Phase 7/8/9 保留为独立的美术、可靠性和真实学习效果验收事项；安全与可靠性
问题不能因范围扩展被搁置。面向儿童试点前必须完成适用的 Phase 8 门槛，
不能凭功能开发完成就直接安排试用。此规则覆盖文末旧的全局线性阶段约束。

## User-prioritized extension — Teach Xiao Tuo Stack practice (2026-11-08)

**Goal:** extend the Stack ending into learning by teaching, using a bounded
selection from the supplied LeetCode Stack list rather than all problems.

**Implemented:** room 04 unlocks at the maze exit (including migration for
previous Stack-gem holders); four original child-friendly adaptations of
1441, 844, 2390 and 1047 with source links; visible stack/top and symbolic
actions; labelled FIFO misconception; demonstrate → correct/explain → fresh
transfer gates; three progressive hints; three chat shortcuts; separate
learner and coach modes; happy sprite and per-activity learned progress.
The existing three-room gem and local Codex Tutor continue to work.

**Assessment boundary:** stored mastery requires deterministic trace and
transfer evidence plus a correct structured rule/reason. Own-word explanation
is optional conversation, not keyword scoring. Chat cannot unlock mastery.
Server prompt v1 selects only a vetted coaching intent; raw generated prose,
code and unknown intent fields never reach the practice UI. All hint counts
retain the no-complete-solution policy. Offline practice remains playable.

**Verification:** case-level outcomes are generated in TEST-RESULTS.md; five
companion reports describe cases, inputs and expectations. Browser/live checks
and limitations are recorded in TEACHING-ACCEPTANCE.md. The test-report script
now writes failed cases too, rather than leaving an old passing report.
This extension does not assert Phase 7/8 art/hardware gates or a real-student
learning outcome; the planned pilot must assess those separately.

**Team integration (2026-11-08):** merged World Adventure Map, region scrolls,
skills handbook and data-gem progress from `1x1dontsleep/AlgoNavigator` revision
`581a1a6`. The current three-room game and local Tutor remain intact; the
module gem is awarded at the final maze exit. This adds navigation and
progress presentation, not implementations of the other three structures.
See [TEAM-MERGE.md](./TEAM-MERGE.md).

Sequencing of [SPECIFICATION.md](./SPECIFICATION.md) into executable phases.
Each phase has a goal, deliverables, and an exit criterion that must be met
before moving to the next phase. Work proceeds phase by phase, in order.

## Phase 0 — Project Scaffolding

**Goal:** a running empty shell to build into.

- Initialize Vite + React + TypeScript project at repo root (`D:\AIgoNavigator`).
- Set up linting/formatting (ESLint + Prettier), Vitest.
- Add base folder structure per SPECIFICATION.md §3.3 (`src/app`,
  `src/components`, `src/engine`, `src/tutor`, `src/content`, `src/state`,
  `api/`).
- Add `.gitignore` entries for `node_modules`, build artifacts, `.env`.
- Confirm `hello-algo/` and `Data-Structure/` remain untouched.
- Automated tests: none yet beyond the Vitest pipeline canary
  (`smoke.test.ts`) — there's no application logic to test until Phase 1.

**Exit criterion:** `npm run dev` serves a blank React app; CI (or local)
lint + test commands run clean.

## Phase 1 — Animation Engine Core (single structure: Stack)

**Goal:** prove the core visualization pattern before replicating it 3x.

- Implement `StructureState` type and the Stack renderer (D3 data-join +
  Framer Motion transitions) per SPEC §5.
- Build `AnimationStage` with play/pause/step/speed controls.
- Author scripted `animationSteps` for Stack push/pop/peek, driven by
  hand-written `StructureState` fixtures (no Pyodide yet).
- Automated tests (see SPEC §9 table): layout-math unit tests, a
  controller-logic test for `AnimationStage`'s stepping/play/pause (using
  a trivial render prop, no Stack/Framer-Motion coupling), a structural
  render test for `StackRenderer` (Framer Motion mocked — animation
  timing stays manual-only), and an end-to-end `App` render smoke test.

**Exit criterion:** a student can watch a scripted push/pop/peek animation
for Stack with working playback controls.

## Phase 2 — Code Execution Integration (Stack)

**Goal:** connect real student Python code to the Stack animation.

- Stand up `PyodideProvider` + Web Worker per SPEC §6 (lazy load, loading
  indicator, timeout/loop guard, worker respawn on hang).
- Build `CodeEditorPanel` (CodeMirror 6) with Run/Reset.
- Implement the Stack exercise harness (`MyStack` class the student
  completes; state read-back to `StructureState`).
- Wire worker output into the same Stack renderer from Phase 1 (FR-4: live
  code drives the same visualization as the scripted demo).
- Kid-friendly error message mapping for common Python exceptions.
- Automated tests (see SPEC §9 table): the `pyodide` npm package runs in
  Node, so the exec-bridge logic (stdout capture, exception mapping,
  loop/step-guard triggering) gets tested directly without a browser
  Worker. The Worker respawn-on-hang logic gets its own unit test with a
  mock Worker here, not deferred to Phase 6.

**Exit criterion:** a student can write `push`/`pop` code in-browser, click
Run, and see the Stack animation update to match their code's real
behavior; infinite loops are caught and recoverable without a page reload.

## Phase 3 — AI Tutor Integration (Stack lesson only)

**Address correction (2026-11-08):** the reported repeated offline replies
came from the old static preview at 4174, while the local Tutor ran at a
different address. Replaced that preview with the local Tutor server and
fixed `dev` / `dev:local` to 127.0.0.1:4174 with strict port binding.
The launcher no longer silently selects a new address.

**Local-provider follow-up (2026-11-08):** after the user reported an API
failure, local development now defaults to the installed Codex CLI's
ChatGPT login via `npm run dev` / `dev:local`. The original API path is
available via `dev:api` and remains the production adapter. This is an
online local bridge, not an offline model. Existing system proxy support
fixed direct CLI connectivity; the browser's Chinese “pop是什么？” received
a real code-aware hint. CLI requests are ephemeral/read-only, sensitive
tools disabled, untrusted input passed via stdin; local HTTP checks Origin
and caps bodies at 32 KiB. Timeouts supersede the earlier 30-second note:
55 seconds for CLI and 60 seconds in the browser. No auth files are read
or copied by the application.

**Game integration completed (2026-11-08):** the user requested Tutor
continuation, superseding the earlier deferred-integration note. Room 02
now offers an optional chat with current edited code, run output/error,
target glyphs and stack state. Versioned prompt v2 adds room context and
student-language replies. The existing local transcript/export and moderation
remain active. Old transcripts, failures and moderated replies do not count
as hints; requests time out after 30 seconds without blocking gameplay.
Model selection honors ALGONAV_TUTOR_MODEL, then ANTHROPIC_MODEL, then the
existing default. Verified live in-browser Chinese hinting and live API
checks for code-aware pop help, withholding full solutions at zero hints,
off-topic redirect and prompt-extraction moderation. All 179 tests pass.
This is a bounded acceptance sample, not a general safety-quality guarantee.

**Goal:** working end-to-end tutoring loop for one lesson.

- Build serverless `/api/tutor` proxy (SPEC §7.1), versioned system prompt
  file, moderation check wiring.
- Build `TutorChatPanel` UI + client-side transcript logging to
  `localStorage` + "Export session log" button.
- Verify Socratic/hint-first behavior manually against a scripted set of
  test questions (including attempts to go off-topic or extract direct
  answers).
- Automated tests (see SPEC §9 table): mock the LLM client and unit-test
  the proxy handler directly — moderation-triggered canned response,
  system-prompt context assembly. No live API calls in CI; actual
  response tone/quality stays a manual check.

**Exit criterion:** a student can ask free-form questions during the Stack
lesson, get age-appropriate Socratic responses referencing their current
code/animation state, and moderation correctly intercepts an off-topic/
unsafe test message.

> **Status note (2026-11-05):** Phase 3 shipped and its tests pass, but the
> tutor is not wired into the game shell built in Phases 4–6 below. It
> remains in the repo, untouched, pending a future decision on how (or
> whether) to re-integrate it into the game. Do not extend tutor scope
> until that decision is made — see SPECIFICATION.md §11.4.

---

**Pivot (2026-11-05):** the remaining phases below were re-planned when the
project shifted from a lesson-page format to a small underground-ruins
game, "Stack Ruins." See SPECIFICATION.md §11 for the full game design.
Phases 4–6 replace what was previously a single "Phase 4 — Full Lesson
Loop"; former Phases 5–7 are renumbered to 7–9 and their scope is narrowed
per the notes below. Work still proceeds phase by phase — do not start
Phase 5 before Phase 4's exit criterion is met, etc.

## Phase 4 — Stone Trial & Asset Foundation

**Goal:** the game shell renders, the first (non-interactive) room is
playable, and every sprite-driven component is built against a swappable
asset index so missing art never blocks logic work.

- Build `src/assets/index.ts`: a single module mapping logical asset names
  (`stone-door-closed`, `sprite-idle`, `block-moon`, ...) to file paths,
  per SPECIFICATION.md §11.6. Until final art lands, logical names resolve
  to placeholder SVGs at the exact final dimensions/aspect ratios from
  `docs/picture_summary.md` — never a rewrite when real art is swapped in.
- Extend `StructureState` (SPEC §11.4) with an optional `glyph` field;
  confirm the existing `computeStackLayout` pure function needs no changes.
- Build `StoneStackRenderer` replacing the plain-rectangle `StackRenderer`
  for in-game use (SPEC §11.4) — reuses layout math, swaps the visual
  mapping only.
- Build the reusable sprite components: `RuinsDoor`, `RuinsSwitch`,
  `Sprite` (idle/guide/thinking/happy poses), `MagicStairs` — each a pure
  state→asset mapping component per `docs/prompt.md` §2.4, no business
  logic.
- Build the `GameStage` shell: room routing, ruins-hall background,
  game-theme CSS palette (SPECIFICATION.md §11.8), replacing the old
  lesson-page card layout.
- Implement **Trial of Stones** (SPEC §11.5.1): scripted push/pop/peek
  sequence reusing the existing `AnimationStage` controller unchanged,
  sprite `guide`→`happy` pose transition on completion.
- Automated tests: `StoneStackRenderer` structural render test (same
  pattern as the retired `StackRenderer.test.tsx`, Framer Motion mocked);
  asset-index resolution test (every logical name used by a built
  component actually resolves to something, placeholder or real); Trial of
  Stones completion-state test reusing `AnimationStage.test.tsx`'s
  approach.

**Exit criterion:** the game opens to the ruins hall, a student can play
through the Trial of Stones scripted sequence with working playback
controls, and every visual slot (door, switch, sprite, stones) renders a
placeholder or real asset with no missing-asset errors.

## Phase 5 — Stairway Repair (Stack Gameplay)

**Goal:** the student writes real Python to solve a stack-matching puzzle
and sees the game world react.

- Author the Stairway Repair exercise content (target glyph pattern +
  starter code against the existing `MyStack` harness, extended with a
  `glyph` parameter per SPEC §11.5.2) — reuses Phase 2's Pyodide
  execution, error mapping, and `CodeEditorPanel` entirely unchanged.
- Implement `Exercise.solutionCheck` for this level: compare final
  `StructureState.elements[].glyph` against the target array
  (deterministic, hand-authored per SPEC §1's existing MVP decision).
- Wire success → `RuinsDoor`/`RuinsSwitch`/`MagicStairs` state changes and
  a position-tween "climb" (Framer Motion, no frame-by-frame sprite
  animation per the asset brief).
- Wire runtime errors → `Sprite` `thinking` pose + existing kid-friendly
  error panel (Phase 2), without resetting game state.
- Automated tests: `solutionCheck` pure-function tests (target match, extra
  stone, wrong order, wrong glyph); an integration test driving the real
  exec bridge (Node-testable per the existing Phase 2 pattern) through a
  correct and an incorrect solution end to end.

**Exit criterion:** a student can edit Python to match the target stone
pattern, click Run, and see the door open and stairway appear; an
incorrect or erroring solution leaves the room state unchanged with a
friendly error shown.

**Status: done.** `GameStage` now routes between Trial of Stones and
Stairway Repair via an unlock-on-completion nav button; `MyStack.push`
gained a backward-compatible optional `glyph` parameter; the solution check
is the standalone `checkStairwayRepair` function (SPEC's generic
`Exercise.solutionCheck` interface was never implemented, so this follows
the room-based architecture already in place instead). Real artwork for the
door, switch, stones, sprite, and stairway (`docs/picture_summary.md`) was
also wired into `src/assets/index.ts` during this phase, replacing those
keys' placeholder SVGs — each component's existing `descriptor.src` branch
point (built in Phase 4) made this a data-only change.

## Phase 6 — Forked Path (Stack as Backtracking)

**Implementation status (2026-11-06):** implemented with bounded seeded-testable
branching tree generation, immutable push/pop/revisit state, stable SVG layout,
a dedicated room-icon stack using `computeStackLayout`, keyboard room actions,
locked edge tweens and reduced motion, frozen exit completion/replay, and
explicit room-02 continuation with persistent navigation unlocks. Tests solve
maps by graph traversal or an injected fixture, not random UI guesses.
Manual browser acceptance remains pending: full Python-backed three-room
playthrough, tween appearance, narrow-screen usability, and OS reduced-motion
behavior have not been visually verified in this environment. Do not treat
this as Phase 7 visual sign-off.

**Goal:** a second, independent application of the stack concept — path
backtracking through a generated maze — ships as its own level.

- Implement the `RoomNode`/`PathState` model (SPEC §11.5.3) as pure,
  renderer-independent functions: map generation (connected graph, exactly
  one `exit`, at least one `deadEnd`, every node reachable from
  `entrance`), and push/pop-on-backtrack transitions.
- Render the map as SVG nodes/edges computed from `PathState` — positions
  and connections are never baked into the background image
  (`ruins-map-bg` is a plain board only), per SPECIFICATION.md §11.8.
- Render the `pathStack` sidebar using the same stone-stack visual
  language as Stairway Repair, to make the stack-as-backtracking
  abstraction explicit to the student.
- Animate node-to-node movement as a position tween along the connecting
  edge (same technique as the stairway climb in Phase 5).
- Automated tests (per the original SPEC §9 testing philosophy — this is
  genuinely new logic, not a reskin, so it gets full coverage): map
  generator validity properties (reachability, exactly one exit, at least
  one dead end) across repeated random generations; push-on-enter/
  pop-on-backtrack state machine tests; a rendered-SVG structural test
  (node/edge count matches `PathState`, Framer Motion mocked).

**Exit criterion:** a student can navigate a generated maze, back out of
dead ends via the visible path stack, and reach the exit to complete the
Stack Ruins game end to end (Trial of Stones → Stairway Repair → Forked
Path).

## Delivery checkpoint — 2026-11-06

Approved bounded continuation (not a declaration that all phase gates passed):

- Implemented: exact versioned room-unlock persistence, corruption/blocked-storage
  fallback and monotonic replay; Stairway reduced-motion success transition;
  source-preserving 25-image PNG export with format/dimension/alpha manifest;
  map-node/badge/book/sparkle registration and room-scoped mounts.
- Locally verified: production Chrome 156 full three-room playthrough, real Python
  infinite-loop timeout and successful retry without refresh, keyboard maze,
  dead-end pop/revisit, entrance protection, exit freeze, replay, reload unlocks,
  390px Forked layout, both motion preferences. CDP script records evidence under
  artifacts/game-<timestamp>; it preserves older kids-* evidence.
- Phase 7 remains **partial**: art quality/composites/paired state anchors not
  visually approved, no subject cropping/background removal, deleted backgrounds
  not restored, board remains programmatic; scroll/glow/dust not yet mounted.
- Phase 8 remains **partial**: Firefox, separate Edge, controlled browser Worker
  crash injection, school hardware and controlled cold-load measurements pending.
  Unit tests cover Worker failure recovery; browser acceptance covers a real hang.
- Phase 9 **prepared, not run**: PILOT.md supplies anonymous observation template
  and facilitator checklist. Actual students and go/no-go decision are external.

## Phase 7 — Asset Finalization & Polish

**Lossless compression (2026-11-08):** completed for all 25 published PNGs
using `npm run assets:optimize`, from 3,054,638 to 2,405,816 bytes (21.2%
smaller). The script checks chunk CRCs and exact decompressed image-data
equality before writing, retains non-IDAT chunks, and leaves `picture/`
untouched. Sizes and hashes are recorded in `artifacts/asset-optimization.json`.
Asset tests (24), production build and lint pass. Background restoration,
art/composite/anchor visual approval and controlled cold-load measurement
remain pending; Phase 7 is still partial.

**Increment (2026-11-08):** Stairway Repair now mounts the quest-scroll
beside the target, a static magic glow on success, and a one-shot dust
fade on stairway restoration. Decorative images are hidden from assistive
technology and ignore pointer events; reduced-motion mode skips the dust.
Effects mount only on success in room 02. Final art cleanup and visual
approval remain pending; this increment does not close the Phase 7 gate.

**Goal:** swap every placeholder for final art and add the non-blocking
polish layer.

- Replace placeholders in `src/assets/index.ts` with final assets per
  `docs/picture_summary.md`, re-cropped/re-generated to spec: transparent
  `stone-door-closed/open` and `switch-inactive/active` at their target
  dimensions (current files are opaque full-frame renders — see
  SPECIFICATION.md §11.6), the 5 glyph stones, 4 sprite poses,
  `magic-stairs`, and the 5 map node icons.
- Add the non-blocking third-batch assets (badge, code book, scroll,
  glow/sparkle/dust effects) per `docs/prompt.md` §6's "Phase 3
  beautification" batch.
- Compress/convert per `docs/prompt.md` §7: backgrounds to WebP, sprite
  PNGs size-optimized; lazy-load map/reward/fx assets per level rather
  than on initial load.
- Accessibility pass: alt text for every asset, non-color-reliant state
  indication (door/switch/stack-top state must not rely on color alone),
  captions alongside all sprite dialogue.
- Automated tests: none new — this phase is asset/perf work, verified by
  the existing structural render tests still passing against real (not
  placeholder) assets, plus manual visual QA.

**Exit criterion:** no placeholder assets remain in a normal playthrough;
load-time and accessibility checks pass per SPECIFICATION.md §11.8 and
NFR-3/NFR-4.

## Phase 8 — Pilot Hardening

**Goal:** de-risk before putting this in front of real children.

- Cross-browser check (latest Chrome/Edge/Firefox) per NFR-5.
- Manual transcript review process dry-run for the re-integrated Tutor
  and Teach Xiao Tuo chat (Phase 3 / 2026-11-08 extension). Review all
  implemented structures as they ship; do not skip this gate on the basis
  of the superseded deferred-Tutor plan.
- Reliability pass: forced Pyodide worker crashes/hangs during Stairway
  Repair, confirm recovery without progress loss (NFR-6) — reuses Phase
  2's respawn-on-hang logic and its existing test, verified in-browser.
- Full playthrough QA: Trial of Stones → Stairway Repair → Forked Path,
  on Chromebook-class hardware, checking NFR-3 load-time target.

**Exit criterion:** no open safety or reliability issues from the
hardening pass; sign-off to run the pilot.

## Phase 9 — Small-Scale Pilot & Feedback

**Goal:** validate with real students per REQUIREMENTS.md §10 success
metrics, adapted to the game format.

- Run with a small group (single classroom or a handful of students).
- Collect: completion rate per room, time-to-complete Stairway Repair
  without hints, any crashes/hangs requiring reload, qualitative feedback
  on whether the game framing improved engagement versus the original
  lesson-page format.
- Write up findings and adjust teaching difficulty, hint quality and pacing.
  Array/LinkedList/Queue are already approved in REQUIREMENTS.md §12;
  their development no longer awaits a scope decision from this pilot.
  If the pilot runs after Phase 15, cover all four structures and the
  three-of-four independent-challenge metric in REQUIREMENTS.md §10.
  If it runs earlier, state exactly which shipped structures were observed
  and leave the broader learning-outcome claim unverified.

**Exit criterion:** applicable success metrics are measured and documented;
learning and usability findings, limitations and a go/no-go decision for
broader student use are recorded. Do not imply a completed four-structure
pilot from a Stack-only observation.

## Phase 10 — 四板块规格与教学内容设计

**状态：未开始；下一步。** 对应需求 §12.1–12.12。本阶段先完成文档设计，
不以实现代码代替尚未明确的接口、内容或判题规则。

**交付内容：**

- 更新 SPECIFICATION.md：明确新基线优先级，修订三个结构仍“不在范围内”的
  旧表述，保留已交付 Stack 与历史约束的适用范围。
- 定义数组（索引、长度、容量）、链表（稳定节点身份、next、head、None）和
  队列（逻辑顺序、front/rear、服务历史）的结构状态及合法操作；标明哪些契约
  共用、哪些分别建模，不强迫三种结构复用只有 elements 的栈状态。
- 明确动画快照、操作事件、Python harness、运行结果校验和判题的连接方式。
  Python 执行结果必须携带结构证据；数组移动、链表改引用、队列服务顺序
  应可观察，stdout 或最终空结构不能作为唯一通关证据。
- 定义模块/任务/运行标识、请求过期处理和 Worker 故障恢复，避免切换板块后
  接收上一板块的执行结果或 AI 回复。
- 设计每板块四阶段的内容清单、三关目标、手册条目、Tutor 上下文，以及至少
  四道原创固定教学题。每题写出误解、允许操作、示范/迁移输入、正确规则与
  原因、恰好三个渐进提示、判定证据及失败反馈。
- 定义“示范 → 纠错解释 → 待验证复述 → 新例迁移 → 已教会”的状态机；
  模型和自由解释文字不负责判题，任何提示层级均不提供完整解法。
- 定义四区路由、逐关解锁、每区一颗宝石、逐题掌握与旧 Stack 存档兼容方案，
  以及进度记录、编程会话与习题内存聊天的不同留存边界。
- 在规格中建立“需求段落 / 验收 ID → 设计章节 → 计划测试层级”的映射，
  覆盖 ARR、LL、QUE、TEACH、AI、RUN、NAV、STORE、UX 全部验收组。

**退出标准：** 三个板块均有可以直接实现的操作契约、内容与判定样例；
需求 §12.11 中每一组都有设计落点。示范与迁移不是同一组数据，错误过程不能
只凭正确终态过关。规格、需求和本路线图的范围与完成定义一致，未解决的
阻塞设计问题明确列出并在实现前解决。

## Phase 11 — 执行、导师、教学与进度的共用能力扩展

**状态：未开始。依赖：Phase 10。** 以最小必要改动扩展现有能力，保留
Stack 的游戏流程、已用 API 与旧存档，不在此阶段提前开放未完成区域。

**交付内容：**

- 按规格扩展模块内容注册、四阶段外壳、知识手册入口和通用动画控制。
  结构规则与 renderer 独立，使脚本演示和 Python 结果使用同一知识模型。
- 扩展执行协议、harness 选择和返回状态校验；每次 Run 使用干净任务状态。
  覆盖未知模块、无效状态、旧响应、异常、超时及 Worker 重建后的再运行。
- 扩展当前仅支持 stack 的 Tutor 前后端边界：模块白名单、版本化角色提示词、
  本题上下文、针对模块的安全回退和三条快捷问题；继续支持本地开发桥接及
  生产代理。题目/角色切换隔离上下文；AI 不得改变操作或授予进度。
- 为后续题库提供可复用的教学门槛、逐级提示、重置/重玩和掌握记录能力；
  对不同结构保留各自合法动作与判定，不能把全部题目做成 push/pop。
- 扩展模块解锁与宝石存档，校验版本和题目 ID，兼容现有 Stack 房间、题库
  及地图记录；重复完成不重复奖励，存储失败时使用可玩的内存状态。

**验证：** 自动覆盖 TEACH-02/03/04、AI-02、RUN-01、NAV-01、STORE-01 的
共用行为及旧 Stack 回归；浏览器检查切换与超时恢复。对话采用 mock 验证
代理边界，后续各板块另做真实模型的角色与内容审阅。

**退出标准：** 共用契约可承载三类结构，各类返回状态与错误分支有验证；
现有 Stack 完整流程可继续玩，旧记录不丢失或产生其他板块奖励。
新区域仍保持未开放，直到对应板块阶段验收完成。

## Phase 12 — 数组板块 Supply Camp

**状态：未开始。依赖：Phase 11。** 对应需求 §12.4。

| 增量            | 必需交付                                                              | 验证重点                                                     |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| 12.1 观察与知识 | 营地储物格动画、预测检查、播放/暂停/双向单步/速度；数组手册与导师入口 | 索引从 0 开始，访问/替换/插入/删除/遍历/扩容的字幕与状态一致 |
| 12.2 Python     | 补给整理脚手架、Run/Reset、真实执行驱动数组视图、错误与提示           | ARR-01/02/03、RUN-01；长度、容量、移动证据及边界索引         |
| 12.3 独立应用   | 新序列的营地装箱任务、固定判定、完成按钮及单颗宝石                    | 完整序列与操作规则均正确，第一关或访问页面不授奖             |
| 12.4 教小拓     | 找到第几个格子、中间插入补给、删除后补齐空位、储物格满了怎么办        | 每题示范、规则/原因、新迁移及三个提示，全部教学门槛有效      |

将小拓的误解分别设为从 1 编号、覆盖代替插入、删除留下洞、长度等于容量。
容量不足不静默丢数据，教学负索引限制须区别于 Python 原生行为；手册说明
数组模型与 Python list 的差异。Tutor 回复和快捷问题必须针对数组。

**退出标准：** 四个增量、独立手册、全程导师和至少四题均可使用；
ARR-01/02/03 及本板块的 TEACH-01–04、AI-01/02、RUN-01、NAV-01、
STORE-01、UX-01 有真实结果和缺口记录。浏览器完成一遍三关及四题迁移，
断开 AI 仍可通关；通过后才开放地图数组入口。Stack 回归通过。

## Phase 13 — 链表板块 Misty Forest

**状态：未开始。依赖：Phase 12 通过，复用 Phase 11 的能力。** 对应需求 §12.5。
这是开发顺序，不是学生必须先完成数组的学习限制。

| 增量            | 必需交付                                                               | 验证重点                                                |
| --------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| 13.1 观察与知识 | 林间信标、引用箭头、head/None/当前节点、操作动画与预测；链表手册及导师 | 逻辑关系来自 next 而非画面相邻位置；节点身份与值分离    |
| 13.2 Python     | 修复信标链脚手架、真实节点与引用变化、Run/Reset、错误与提示            | LL-01/02/03、RUN-01；头尾/中间插删、重复值、空与单节点  |
| 13.3 独立应用   | 新节点的森林送信任务、可观察遍历路径、完整链路判定及单颗宝石           | 到达要求节点且终止于 None，不能漏节点、断链或形成非法环 |
| 13.4 教小拓     | 沿 next 找伙伴、头部加入新信标、中间接入信标、移除信标仍保持道路连通   | 示范与迁移覆盖引用更新、头节点变化及尾部/单节点边界     |

小拓误解包括沿画面右边走、插入丢失后续链路、擦掉值即删除、删除头节点却
不改 head。非法引用、环与遍历长度须有界检查并允许修复，不能只靠成功路径
测试。手册比较数组与链表，不把双向、循环链表或复杂度证明加入基础关卡。

**退出标准：** 四个增量、手册、导师和至少四题完整；LL-01/02/03 与本板块
全部通用验收组有证据。浏览器验证真实改引用、非法环恢复、三关及四题迁移，
AI 不可用时仍可完成；通过后开放链表区域。数组与 Stack 回归通过。

## Phase 14 — 队列板块 Harbor Pier

**状态：未开始。依赖：Phase 13 通过，复用 Phase 11 的能力。** 对应需求 §12.6。

| 增量            | 必需交付                                                           | 验证重点                                                  |
| --------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| 14.1 观察与知识 | 码头排队动画与预测、front/rear、到达顺序；队列手册及导师           | rear 入队、front 出队、FIFO、peek 不改状态，与 Stack 区分 |
| 14.2 Python     | 调度船只脚手架、enqueue/dequeue/peek、返回值和队列状态、错误与提示 | QUE-01/02/03、RUN-01；空队列、单元素和交错入出队          |
| 14.3 独立应用   | 新事件序列的港口服务站、等待队列及离港历史、单颗宝石               | 既校验服务顺序又校验最终队列，不能只因队列清空就通过      |
| 14.4 教小拓     | 谁先上船、新船停在哪里、看看队首不让它离开、边到港边服务           | 每题纠正一个误解，独立迁移，提示与角色均针对队列          |

小拓误解包括后来先走、队首插队、peek 当出队、空队列仍能出队。
教学接口采用 enqueue/dequeue，手册解释与参考章节 push/pop 命名的关系。
不把列表 pop(0) 描述为常数时间；循环队列、固定容量和回绕指针仅作可选扩展。

**退出标准：** 四个增量、手册、导师和至少四题完整；QUE-01/02/03 与本板块
全部通用验收组有证据。浏览器验证交错事件、三关与四题迁移，AI 不可用时
仍可完成；通过后开放队列区域。其他三个已实现板块回归通过。

## Phase 15 — 四板块联合验收与交付整理

**状态：未开始。依赖：Phase 12–14 均通过。** 目标是验证完整学习体验及
跨板块边界，不以编译通过或累计测试数量替代功能验收。

- 对照 REQUIREMENTS.md §12.11 完成全部验收组，三个新增题库逐题记录
  示范/迁移的正确与错误轨迹、规则/原因不匹配、重置和重玩；至少十二道新题
  均需通过，不以已有四道 Stack 题替代。复查提示不泄露完整解法。
- 完成四区导航、无跨区强制前置、每区一颗宝石和 4/4 展示；验证进入页面、
  查看手册和完成第一关不授奖，教学题掌握不影响三关宝石标准。
- 验证旧 Stack 三种进度记录、损坏/未知记录及禁用存储；连续切换板块、题目
  或角色时不泄漏对话、不接收过期执行结果、不丢失已经获得的解锁。
- 对四板块分别做真实 Python 运行、异常、无限循环、Worker 恢复和重试；
  在 AI 服务关闭时完成核心流程。首次 Python 加载仍可能依赖网络。
- 对四板块做键盘、窄屏、减少动态效果和真实模型话术审阅，记录浏览器、
  设备及网络条件；关联 Phase 7/8 的剩余美术、跨浏览器与学校设备门槛。
- 更新 README 的模块可用状态、使用说明和已知限制，整理测试与浏览器证据。
  Phase 9 的试点材料随新范围调整；未开展真实学生观察时明确写“未运行”。

**退出标准：** 全部板块的必需体验与验收有可复核证据，Stack 无已知回归，
没有阻塞本次功能交付的安全/可靠性问题。尚未测量的设备性能、视觉签核或
学生学习效果逐项列出，不得写成“全部验收完成”。只有通过 Phase 8 的适用
门槛后才进入儿童试点；Phase 9 的学习效果结论须另行记录。

## 新增阶段的统一测试与进度记录规则

以下规定适用于 Phase 11–15；Phase 10 以需求覆盖与设计核对作为验证。

1. 自动验证覆盖结构状态变换、操作轨迹、判题门槛、动画控制与布局、渲染、
   Python 执行桥接、Tutor 边界及存档迁移；浏览器验证真实 Worker、动画呈现、
   导航、输入、超时恢复与无障碍。模型语气与提示质量另做人工审阅。
2. 每阶段按改动执行适用测试，并在代码交付前运行 `npm run test:report`、
   `npm run build`、`npm run lint` 和所改文件的格式检查。失败先修复再推进，
   不用重复运行无关测试替代缺失的验收。
3. 遵循 [bug-reports/README.md](./bug-reports/README.md)，新测试文件配套说明
   用例、输入、预期、回归目的、缺口及最近结果；`TEST-RESULTS.md` 由真实运行
   生成，包含逐例通过/失败、耗时与失败信息，不手改成预期数字。
4. 手工证据分别放入计划新增的 `ARRAY-ACCEPTANCE.md`、
   `LINKED-LIST-ACCEPTANCE.md`、`QUEUE-ACCEPTANCE.md` 和
   `FOUR-MODULE-ACCEPTANCE.md`。这些文件目前尚未创建；实施时记录提交版本、
   日期、浏览器/设备/网络、用例 ID、输入步骤、预期、实际、状态和截图/日志位置。
   未执行、失败、阻塞与通过分别标注，不把缺失证据当作通过。
5. 路线图阶段状态只有在退出证据完整时更新为完成；部分交付写明已做与剩余项。
   旧的 222 条测试属于历史 Stack 基线，不能作为新板块或当前版本通过的证明。
   本次仅更新文档，不运行产品测试或刷新其结果，也不宣称新增验收已执行。

---

**Process note (2026-11-11):** follow the dependency rules in the current
execution plan above. Phase 10 design precedes all new implementation;
Phases 11–15 advance only after their stated dependencies pass. Historical
Phases 7–9 retain their separate gates. If work surfaces a design gap,
update SPECIFICATION.md (and REQUIREMENTS.md if scope is affected) before
continuing, rather than deviating silently.
