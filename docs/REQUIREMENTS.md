# AIgoNavigator — Requirements Document (MVP)

## 当前需求基线：四大板块扩展（2026-11-11）

本次需求确认：在现有 Stack 游戏基础上，补齐 **数组、链表、队列**。
每个板块必须具备与 Stack 同等完整的动画、导师教学、知识补充、Python
动手任务和习题练习；习题采用“学生教小精灵小拓”的以教代学方式。
完整需求及验收标准见 **§12**，与历史内容冲突时以本节及 §12 为准。

知识基础为仓库已有的 `hello-algo/`（《Hello 算法》）；本次对话中的
“openAIgo”按该参考项目理解，不另行引入未经确认的知识来源。
当前 Stack、数组、链表和队列核心功能均已实现，Phase 15 本地桌面联合检查与修复已通过；完整设备/辅助功能等验收仍待完成，详见 [FOUR-MODULE-ACCEPTANCE.md](./FOUR-MODULE-ACCEPTANCE.md)。队列的本地验证与未测项见 [QUEUE-ACCEPTANCE.md](./QUEUE-ACCEPTANCE.md)。链表有限本地验收及未测项见 [LINKED-LIST-ACCEPTANCE.md](./LINKED-LIST-ACCEPTANCE.md)。数组的有限本地验收
及已知限制见 [ARRAY-ACCEPTANCE.md](./ARRAY-ACCEPTANCE.md)。
本需求基线最初只更新文档；后续实现、测试与学生试用必须分别举证。
SPECIFICATION.md、ROADMAP.md 已同步 Phase 10–15（Phase 15 部分完成）；其中历史 Stack-only
范围不再限制新模块设计，也不能作为全部四板块已交付的证据。

## Current shipped game scope — 2026-11-08

User-requested extension: after the three-room Stack game, offer the optional
Teach Xiao Tuo practice bank. Children demonstrate stack actions, correct the
sprite's stated misconception, explain top-only/LIFO, and verify a fresh
example. Four sourced, adapted problems are available (1441/844/2390/1047).
Hints and a constrained learner/coach chat support teaching, never provide
complete solutions and never award mastery. Persist only exercise IDs and
unlock status in `algonavigator.stack-teaching.v1`; explanations/chat are not
automatically stored. Explicit chat submission sends activity context to AI;
local export is optional. The three-room gem criterion remains unchanged.

Team-map integration: the homepage is the World Adventure Map with four
regions; only Stack is implemented. `/#/stack` opens the existing three-room
game and includes a return link and skills handbook. Reaching the final maze
exit earns one data gem, persisted independently in
`algonavigator.adventure-progress.v1`. Replays cannot duplicate a gem. The
existing room-unlock and optional Tutor transcript records are retained.
Root reload opens the map; direct Stack reload starts at Trial with saved
room unlocks. See TEAM-MERGE.md for source revision and conflict decisions.

The Stack Ruins game supersedes the older four-structure lesson scope below for
this delivery. It has three rooms and an optional Stack tutor in room 02.
The tutor sends questions, recent chat, Python code and room/run context to
the AI service only on Ask. Disclose this before submission and discourage
personal information. Its chat transcript is saved locally and exportable;
the game remains playable if AI is unavailable. Save only ordered
room unlocks on this device: `algonavigator.stack-ruins.progress` contains exactly
`{ "version": 1, "unlockedThrough": 1 | 2 | 3 }`. No code, hints, maze, identity or
transcript is saved in the progress record (tutor transcripts use a separate
local record). Reload opens Trial with saved entrances;
replaying earlier rooms cannot relock later ones. Unsupported versions, extra
fields, malformed data or blocked storage must not prevent play. This is not
cross-device sync or a resumable editor. Real students and school hardware have
not been validated; see PILOT.md before arranging the pilot.

## 1. Overview

AIgoNavigator is a web-based learning platform that teaches upper-elementary
students (grades 4–6, ages ~9–12) the fundamentals of data structures using
Python, inspired by the open-source project [hello-algo](https://github.com/krahets/hello-algo).
The platform combines three pillars:

1. **Visual animation** of data structure operations.
2. **Conversational AI tutoring** powered by a real LLM.
3. **Guided, hands-on Python coding** executed safely in the browser.

## 2. Goals

- Help a student with little/no programming background understand what an
  array, linked list, stack, and queue _are_ and _how their operations work_,
  before and while writing real Python code.
- Let the AI tutor adapt explanations to the student's pace, answer free-form
  questions, and nudge them through a fixed curriculum without giving away
  answers outright.
- Ship a working MVP covering one teaching loop end-to-end (concept →
  animation → guided code → AI Q&A → mini-challenge) for all 4 basic
  structures, suitable for a small pilot (e.g., a single classroom or a
  handful of students), not a multi-tenant production system yet.

## 3. Non-Goals (out of scope for MVP)

- Trees, hashing, sorting, searching, graphs, heaps, backtracking (full
  hello-algo syllabus) — reserved for a post-MVP phase.
- User accounts, authentication, multi-classroom management, teacher
  dashboards, or persistent cross-device progress sync.
- Drag-and-drop/block-based programming (Scratch-style) — target age group
  goes straight into simplified real Python syntax.
- Native mobile apps.
- Payment/licensing systems.

## 4. Target Users

| User                       | Description                                                        | Needs                                                                                             |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Student                    | Grade 4–6, basic keyboard/typing skill, no prior coding experience | Simple UI, immediate visual feedback, non-judgmental AI tone, short sessions (~15–20 min)         |
| Parent/Teacher (secondary) | Supervises sessions                                                | Visibility into what the AI says to the child (safety), optional way to review session transcript |

## 5. Curriculum Scope (MVP)

Four data structures, each following the same lesson template:

1. Array (顺序表)
2. Linked List (链表)
3. Stack (栈)
4. Queue (队列)

### Lesson template (per structure)

1. **Hook** — a short real-world analogy (e.g., stack = stack of plates).
2. **Animation walkthrough** — operation-by-operation visualization
   (insert/delete/access/traverse) with play/pause/step controls, synced to
   plain-language captions.
3. **Guided coding** — a scaffolded Python exercise (partially filled-in
   code) where the student implements or calls the operation just animated.
4. **AI Q&A** — student can ask the tutor anything about the current topic
   at any point; AI can also proactively check understanding ("Can you tell
   me what happens to the top of the stack after `push(5)`?").
5. **Mini-challenge** — a small puzzle/task to apply the concept
   independently, auto-checked, with AI available for hints (not answers).

## 6. Functional Requirements

### 6.1 Animation Module

- FR-1: Render step-by-step visualizations for core operations of each of
  the 4 structures (e.g., array: index access, insert, delete, resize;
  linked list: insert/delete at head/tail/middle, traversal; stack:
  push/pop/peek; queue: enqueue/dequeue).
- FR-2: Support play, pause, step-forward, step-back, and speed control.
- FR-3: Animations must visually represent memory/reference concepts
  relevant to the structure (e.g., linked list nodes as boxes with arrows,
  contiguous array cells, stack growing/shrinking vertically).
- FR-4: Animation state must be able to sync with and reflect the output of
  the student's own code execution (e.g., running `my_stack.push(5)` updates
  the visualization, not just a scripted demo).

### 6.2 Code Execution Module

- FR-5: Provide an in-browser Python code editor (syntax highlighting, line
  numbers, basic error squiggles) scoped to each exercise.
- FR-6: Execute student code **client-side via Pyodide (WASM)** — no
  student code is sent to any backend server for execution.
- FR-7: Each exercise runs in a fresh interpreter state with a resource/time
  limit (e.g., execution timeout, loop iteration guard) to prevent the
  browser tab from hanging on infinite loops.
- FR-8: Auto-grade exercises/challenges against expected output or state,
  and surface clear, kid-friendly error messages (not raw Python
  tracebacks) for common mistakes.

### 6.3 AI Tutoring Module

- FR-9: Integrate a real LLM API for free-form conversational Q&A, scoped to
  the current lesson's topic and the student's code/animation state (the AI
  receives lesson context + student's current code as context, not the
  entire conversation history of other lessons).
- FR-10: System prompt must enforce: age-appropriate language (grade 4–6
  reading level), Socratic/hint-first style (no direct answers to
  challenge questions unless the student is stuck after 2+ hint attempts),
  and strict content-safety boundaries (reject or redirect any off-topic,
  unsafe, or inappropriate input back to the lesson).
- FR-11: AI responses must be moderated/filtered before display (both input
  and output) using a content-safety check appropriate for a child
  audience.
- FR-12: All AI conversation transcripts for a session must be logged and
  retrievable for parent/teacher review (local/session storage is
  sufficient for MVP; no long-term server-side retention required yet).
- FR-13: AI must be able to reference what's currently on screen (e.g.,
  "I see your stack has 3 items and you just tried `pop()` twice — want to
  see what happens visually?").

### 6.4 Progress & Navigation

- FR-14: Linear lesson flow per structure (hook → animation → code → AI →
  challenge) with a simple progress indicator.
- FR-15: Session progress persists in browser local storage (no login
  required for MVP); progress is lost if local storage is cleared.

## 7. Non-Functional Requirements

- NFR-1 (Safety): No PII collection beyond an optional first name stored
  locally. No account creation, no data sent to third parties beyond the
  LLM API call itself (which must not include PII).
- NFR-2 (Content safety): AI must never produce content unsuitable for
  children; implement input/output filtering and a fallback canned response
  for any moderation failure.
- NFR-3 (Performance): Pyodide initial load should be optimized (lazy-load,
  loading indicator) since WASM startup can take several seconds; target
  first interactive code run under ~5s on a typical school laptop/network.
- NFR-4 (Usability): UI text and AI tone calibrated for 9–12 year-olds;
  avoid jargon without an analogy; large touch/click targets; works on
  Chromebook-class hardware (common in schools).
- NFR-5 (Browser support): Latest Chrome/Edge/Firefox (Pyodide/WASM
  requirement); no IE support needed.
- NFR-6 (Reliability): Animation and code-execution state must stay in
  sync; a crashed/hung Pyodide worker must be recoverable via a "reset
  exercise" action without losing lesson progress.

## 8. Proposed Tech Stack

| Layer              | Choice                                                                                                                    | Notes                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Frontend framework | React (+ TypeScript)                                                                                                      | Pairs naturally with animation libs below                                                                      |
| Animation          | D3.js for data-bound structure diagrams, Framer Motion for transitions/polish                                             | D3 drives element enter/update/exit tied to actual data state; Framer Motion handles easing/micro-interactions |
| Code editor        | CodeMirror or Monaco (lightweight preferred for load time)                                                                | —                                                                                                              |
| Python runtime     | Pyodide (WASM), run in a Web Worker to keep UI thread responsive                                                          | Avoids backend sandbox complexity for MVP                                                                      |
| AI backend         | Thin API proxy (serverless function) → LLM API                                                                            | Proxy needed to keep API keys off the client; also where moderation/rate-limiting is enforced                  |
| Content moderation | LLM provider's moderation endpoint (if available) or a dedicated moderation API, applied to both user input and AI output | —                                                                                                              |
| Persistence (MVP)  | Browser localStorage                                                                                                      | No database required for MVP                                                                                   |
| Hosting            | Static frontend hosting (e.g., Vercel/Netlify) + serverless function for the AI proxy                                     | Minimal ops overhead for a pilot                                                                               |

**Open decision:** specific LLM provider/model for the tutoring API is not
yet chosen — needs a decision on cost per session, context window, and
availability of a moderation endpoint before implementation starts.

## 9. Content Safety & Privacy Considerations (children-specific)

- Treat this as a children's product: minimize data collection, avoid
  behavioral tracking/analytics tied to identifiable children, and keep all
  AI conversation data ephemeral/local for MVP.
- Have a documented, reviewable system prompt for the AI tutor (versioned,
  not editable by end users) with explicit refusal behavior for anything
  outside the data-structures curriculum.
- Plan a manual review pass of a sample of AI transcripts during the pilot
  to catch prompt-injection attempts or unsafe completions before any wider
  rollout.

## 10. Success Metrics (MVP pilot)

- A student with no prior coding experience can, unassisted after the
  guided lesson, correctly complete the mini-challenge for at least 3 of
  the 4 structures.
- AI tutor hint-first behavior holds (measured via transcript sampling):
  AI does not reveal challenge answers outright in normal use.
- No crashes/hangs requiring a full page reload during a typical 20-minute
  session.

## 11. Open Questions

1. Which LLM provider/model, and what's the budget per student-session?
2. Is a parent/teacher-facing transcript viewer needed in the MVP, or can
   it wait for the next phase?
3. Should the mini-challenges be auto-generated (AI) or hand-authored/fixed
   for the MVP? (Hand-authored recommended for MVP to keep grading
   deterministic and safe.)
4. Any existing hello-algo visual/content assets the team wants to reuse or
   adapt vs. building originals from scratch?

## 12. 四大板块完整教学需求（2026-11-11）

### 12.1 目标、范围与现状

服务对象仍为 9–12 岁、没有系统编程经验的学生。每次学习以一个短任务为单位，
建议 15–20 分钟，可分次完成一个板块。目标是让学生能够解释结构规则、正确操作，
并在一个新的例子中运用规则，而不只是照着提示点对按钮。

| 板块             | 地图区域     | 当前状态                               | 本次需求范围                         |
| ---------------- | ------------ | -------------------------------------- | ------------------------------------ |
| 栈 Stack         | Stack Ruins  | 已有三关、知识手册、导师及四题教学练习 | 作为功能基准，保持现有流程及存档兼容 |
| 数组 Array       | Supply Camp  | 已开放，完成三关及四题                 | 完整独立教学流程及至少四道教学练习   |
| 链表 Linked List | Misty Forest | 已开放：三关、四题、知识与双角色导师   | 完整独立教学流程及至少四道教学练习   |
| 队列 Queue       | Harbor Pier  | 已开放：三关、四题、知识与双角色导师   | 完整独立教学流程及至少四道教学练习   |

三个新板块在功能完整度上对齐 Stack，场景与操作按各自知识设计，不照搬
栈的石块操作、迷宫或 LIFO 规则。每个板块内部按关卡顺序解锁；板块之间
不设置强制通关依赖。建议学习顺序为数组、链表、栈、队列，允许教师自行安排。
未完成开发的板块继续显示明确的未开放状态，不能进入空白页或假成功页面。

### 12.2 知识来源与教学边界

内容以本地 `hello-algo/` 的以下章节为依据，参考版本为
`455e8c1281846c2a2c6b9c7fe2fd069bc87b7a85`。该版本仅作为知识核对基线，
不修改参考仓库，也不直接复制其代码、图示或动画。

| 来源                                                          | 转化为儿童教学的核心内容                                         | 本轮不要求掌握                   |
| ------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------- |
| `hello-algo/docs/chapter_array_and_linkedlist/array.md`       | 从零开始的索引、访问与修改、插入删除时移动元素、遍历、容量与扩容 | 内存分配实现、复杂度证明         |
| `hello-algo/docs/chapter_array_and_linkedlist/linked_list.md` | 节点值与 next、head、None、沿引用遍历、头尾及中间插入删除        | 双向或循环链表实现、复杂指针算法 |
| `hello-algo/docs/chapter_stack_and_queue/queue.md`            | FIFO、队首与队尾、入队出队、查看队首、空队列、排队应用           | 双端队列、优先队列、循环数组实现 |

知识手册可用可选小节解释操作成本、数组与链表差异、队列实现方式，但不把这些
扩展知识作为基础通关条件。数组视图是连续位置的教学模型，不能声称 Python
`list` 的元素对象在内存中连续，或把动态列表等同于固定长度数组。
链表画面上相邻不等于逻辑相连；队列不得把 Python 列表 `pop(0)` 宣传为常数时间。
所有新习题先采用原创、固定、可确定性判定的任务；后续引入外部题目时逐题记录
题号、来源及改编关系，不因 Stack 使用 LeetCode 就强制其他板块使用同一题单。

### 12.3 每个板块的标准学习流程

| 阶段               | 必需体验                                                                     | 学生推进条件                                 |
| ------------------ | ---------------------------------------------------------------------------- | -------------------------------------------- |
| 01 观察与预测      | 生活类比、操作动画、字幕；播放、暂停、前后单步、速度控制；操作前预测下一状态 | 完成演示并回答基础规则检查，可重试           |
| 02 Python 动手任务 | 脚手架代码、运行、重置、目标状态、逐级提示、真实执行结果及错误解释           | 学生运行的程序得到符合规则的目标状态         |
| 03 独立应用挑战    | 在新场景操作结构，减少脚手架，显示操作历史与结果                             | 满足固定的任务判定并点击完成，获得该板块宝石 |
| 04 教小拓习题区    | 选择题目、识别小拓误解、示范、纠错解释、迁移验证；可切换小拓和导师对话       | 每题单独判定“已教会”，不改变前三关宝石标准   |

知识补充与导师帮助贯穿上述阶段，不能仅在最后一关出现。知识手册应包含
“是什么、能做什么、操作前后实例、常见错误、与相关结构的区别”，支持折叠、
随时查阅和返回当前任务。查阅、打开聊天或阅读提示均不自动视为完成学习。
第四阶段在第三阶段完成后开放；重玩不撤回已获得的入口或宝石。

### 12.4 数组板块：Supply Camp

学习目标：区分位置索引和元素值，按索引访问和修改；解释中间插入或删除
为什么要移动后面的元素；区分已用长度与容量，并按顺序遍历所有有效元素。

- **01 营地储物格**：显示带索引的相邻储物格、长度及容量。用三件不同物品
  演示读取、替换、插入、删除与遍历；索引从 0 开始。扩容展示为搬到更大的
  储物区并保持顺序，不能只把长度数字加大。
- **02 补给整理**：使用提供的数组教学接口完成指定位置插入、替换和删除。
  Python 最终结果驱动同一数组视图，显示被移动物品及目标位置。
- **03 营地装箱**：给定不同于演示的新物品序列，学生通过合法操作整理到目标
  顺序；校验完整序列、有效长度、容量约束和要求的操作证据。
- **04 教小拓**：至少四题，分别为“找到第几个格子”“中间插入补给”
  “删除后补齐空位”“储物格满了怎么办”。每题均有新的迁移样例。

小拓的典型误解：第一个位置是索引 1；插入直接覆盖旧物品；删除只留下洞；
长度与容量总相等。每题只聚焦当前误解，不在所有题里机械重复一种错误。

基础行为约定：访问、修改、删除的合法索引为 `0 <= index < length`；插入
允许 `index == length`；教学接口拒绝负索引并解释本任务规则，不暗示原生
Python 不支持负索引。容量不足时明确提示扩容，不能静默丢失已有物品。

### 12.5 链表板块：Misty Forest

学习目标：识别节点的值和 next，理解 head 与尾节点的 None；沿 next 遍历；
通过修改引用实现插入和删除，保留未被删除的节点与顺序。

- **01 林间信标**：把分散的信标画成有稳定身份的节点，用带方向的连线显示
  next；分别标注 head、当前节点、None。动画演示沿引用寻找节点，以及头部、
  尾部和中间的插入删除。节点位置改变不会改变 next。
- **02 修复信标链**：提供简化节点与链表接口，让学生在 Python 中连接节点、
  插入节点、绕过目标节点，执行结果必须能体现节点身份及 next 的实际变化。
- **03 森林送信**：给定散布的新节点，按线索修复一条从 head 到 None 的路径；
  正确到达所有要求节点且无断链、重复访问或非法环后完成挑战。
- **04 教小拓**：至少四题，分别为“沿 next 找伙伴”“头部加入新信标”
  “中间接入信标”“移除信标仍保持道路连通”，覆盖尾部与单节点边界。

小拓的典型误解：找下一个节点就是看画面右边；插入只改前驱引用而丢掉后续；
删除只擦掉值；删除头节点不需要更新 head。解释中要让学生指出引用如何改变。

基础行为约定：空链表 `head = None`；尾节点 `next = None`；值相同的节点仍有
不同身份。非法引用、环和过长遍历必须有界检测，给出可恢复提示；不能因错误
代码使界面无限遍历。循环链表不是本轮合法目标，学生纠错后可再次运行。

### 12.6 队列板块：Harbor Pier

学习目标：区分 front 与 rear，正确执行 enqueue、dequeue、peek；用“先来先服务”
解释 FIFO，并与已学的栈 LIFO 区分；处理空队列和单元素队列。

- **01 码头排队**：船或货物在 rear 入队，在 front 出队。保持方向标签和到达
  顺序可见，演示 A、B、C 入队后 A 先离开，以及 peek 不删除任何元素。
- **02 调度船只**：通过 Python 队列接口安排到港、查看队首及离港，展示实时
  逻辑顺序与实际返回值。采用 enqueue/dequeue 名称，并在手册说明它们与参考
  章节 push/pop 命名的对应关系，避免与栈混淆。
- **03 港口服务站**：在到达和服务交错的新事件中完成服务清单，既校验等待
  队列，又校验实际离港顺序；最终队列为空不能单独证明 FIFO 正确。
- **04 教小拓**：至少四题，分别为“谁先上船”“新船停在哪里”
  “看看队首不让它离开”“边到港边服务”，每题都有未见过的到达/服务序列。

小拓的典型误解：最后来的先走；新来的可以插到队首；peek 就是 dequeue；
队列空了仍可以出队。禁止任意从中间删除或用栈的规则代替排队规则。

基础行为约定：空队列的 dequeue/peek 返回儿童可理解的错误，不改状态；
最后一个元素离开后 front/rear 均无有效元素。基础任务不加固定容量限制；
循环队列、回绕指针和“队满”放在可选知识补充，不作为通关条件。

### 12.7 统一的“教小拓”习题模式

以下要求适用于三个新增题库，也作为 Stack 教学方式的共同基准。

1. **理解题目**：显示故事、输入、目标、允许操作、当前结构和来源。示例只
   说明操作规则，不直接播放整题正确步骤。题目切换不混用另一题的对话或状态。
2. **暴露误解**：小拓先提出与当前题相关的错误判断，明确这是它需要学生纠正
   的想法。学生可通过示范和对话指出错误，不能把误解当作知识说明呈现。
3. **学生示范**：使用按钮或任务规定的 Python 操作展示合法过程。错误动作指出
   违反了哪条规则，保留可继续尝试的状态；不能靠点开答案通关。
4. **纠错与解释**：学生选择正确规则及原因，并可补充自己的话或例子。结构化
   规则与原因参与确定性判定，自由文字不采用关键词猜测或模型评分决定通关。
5. **小拓复述**：规则纠正后，小拓用简单语言说明刚学到的原则；若仍缺证据，
   追问一个聚焦问题。此时显示“待验证”，不能提前宣称已经掌握。
6. **新例验证**：换用事先编写、与示范不同的数据或事件顺序，重置本次操作
   状态，让学生再次指导。练习状态由真实合法操作产生，不照搬前一题答案。
7. **教会反馈**：仅当示范轨迹、规则及原因、新例结果全部通过时，小拓表现
   恍然大悟并复述知识点，保存该题“已教会”。保留重玩和下一题入口。

每题提供恰好三个渐进提示层级：提示关注位置或对象、提醒核心规则、提出局部
操作问题。任何层级都不输出整题完整代码、完整操作序列或标准答案。
重复请求答案、聊天次数多、打开提示或最后状态碰巧相同都不能替代教学证据。
不要求学生写出指定措辞，不因拼写或解释语言影响确定性规则判定。
每个新板块至少四题，每题至少一组示范输入和一组独立迁移输入，即至少十二道
新教学练习；这些是内容交付数量，不是已运行的测试数量。

### 12.8 导师、知识补充与对话

- **导师 Tutor**：能够在各阶段获得当前板块、任务、结构状态、最近操作、
  已用提示，以及本题学生主动提交的代码和运行结果。回复针对当前问题，以
  简短解释、反问和局部提示帮助学生思考，不能仍把三个新板块都称作 stack。
- **小拓 Learner**：学生是老师，小拓是带有当前误解的学习伙伴。角色应稳定，
  不抢先讲完解法；根据纠错进度提问或复述，不反复否认已经验证的正确规则。
- **角色区分**：习题区允许切换小拓/导师，明确显示当前角色；切换后隔离对话
  上下文，不把导师的话当作学生已经教过的内容。每题提供三个对应当前知识点
  的快捷问题，不出现固定的栈专用问题。
- **知识补充**：三个板块均须有可查阅的独立手册条目，使用与动画一致的术语、
  图例和操作名；可从错误提示进入相关知识，再回到原任务。
- **判定权限**：AI 对话不能修改结构、判题或授予宝石/已教会状态。判定来自
  固定任务规则和学生的实际操作。对话不可用时，演示、代码、知识手册、提示、
  纠错、迁移与通关仍应可用；首次 Python 加载仍可能需要网络，不承诺全站离线。
- **安全与答案边界**：输入输出过滤、服务端角色规则、上下文长度限制和无服务
  回退覆盖全部板块。教学练习在使用两个或更多提示后仍不解锁完整答案；这一
  规则覆盖旧 FR-10 中“2+ hints 后可以直接回答”的宽松表述。

本地开发继续支持现有 Codex/ChatGPT 登录桥接，生产环境沿用受控代理设计。
本需求不引入本地离线模型，也不要求用户提供或复制 ChatGPT 登录凭据。

### 12.9 导航、奖励、存档与隐私

- 地图保留四个区域，分别通往对应板块并可返回地图。进入、重放动画、查看
  手册或完成第一关均不授予宝石；完成第三阶段应用挑战，每板块最多一颗。
  四个板块全部完成后显示 4/4，不以完成全部可选练习作为宝石条件。
- 每个板块独立保存已解锁关卡与已教会题目 ID，重玩早期任务不回退解锁状态。
  初次进入从第一关开始；刷新后保留入口与完成记录，但不承诺恢复代码、聊天、
  当前节点或尚未提交的操作。不得把另一板块的进度套用到当前板块。
- 后续存档扩展必须兼容现有 Stack 房间解锁、Stack 习题记录和地图宝石。
  旧 Stack 宝石只计入 Stack，不能自动授予另外三个板块。遇到损坏、未知版本、
  未知题目 ID、额外字段或存储被禁用时，安全校验并回退到可玩的内存状态。
- 进度不保存姓名、学校、代码或自由解释。AI 内容只在学生主动发送时提交，
  发送前说明内容范围和避免个人信息。习题对话默认仅在当前题内存中保存，
  可显式导出；编程导师若保留本地会话日志，必须明确提示并按板块隔离。
  这一差异覆盖旧 FR-12 对所有对话统一持久化的要求。无服务器长期留存或账号。

### 12.10 动画、执行与易用性要求

- 脚本演示和学生程序结果使用同一结构规则与视图，显示操作前后状态、变化
  对象及文字说明。图示、字幕、提示、手册和判题不得互相矛盾。
- Python 在浏览器 Worker 中执行，每次运行使用干净任务状态；错误、超时、
  Worker 故障可重试，不能丢失已有解锁。防止旧任务延迟返回覆盖新板块结果。
  不能用写死的成功动画冒充执行，也不能只比对 stdout 就判定所有结构正确。
- 数组显示索引/长度/容量；链表显示节点身份/next/head/None；队列显示 front/
  rear/到达及服务顺序；关键状态不能只用颜色或装饰图片表达。
- 支持键盘操作、可读标签、明显焦点、窄屏布局及减少动态效果偏好。暂停、
  前后单步和降低速度不改变逻辑；动画过程中阻止重复操作造成状态竞态。
  新美术可以渐进替换，不能将知识文本、箭头、索引或判定逻辑烘焙在背景图中。
- 保留 NFR-3 的首次 Python 可交互约 5 秒目标，须在学校级设备及记录的网络
  条件下测量；开发机运行顺畅不能视为达到该目标。

### 12.11 验收用例与测试记录要求

以下为**计划验收用例，均未因本次文档更新而执行**。每个板块必须补充实际
输入、步骤、预期结果、实际结果和通过/失败记录，不能仅记录“测试通过”。

| 用例 ID  | 场景与输入                                               | 预期结果                                              |
| -------- | -------------------------------------------------------- | ----------------------------------------------------- |
| ARR-01   | `[A,B,C]` 读取索引 0，再尝试索引 3 和 -1                 | 返回 A；两个非法教学索引提示错误且不改状态            |
| ARR-02   | `[A,B,C]` 容量 4，在索引 1 插入 X，再删除索引 2          | 依次为 `[A,X,B,C]`、`[A,X,C]`，动画移动正确           |
| ARR-03   | 长度等于容量时插入；显式扩容后重试                       | 扩容前明确拒绝且保留数据；扩容后成功且顺序不变        |
| LL-01    | 画面打乱位置的 `a -> c -> b -> None`，其中 a 与 b 值相同 | 遍历依 next 得到 a、c、b，身份不合并                  |
| LL-02    | `a -> b -> None` 中插入 x，再删除 head a                 | 得到 `a -> x -> b`，随后 `head = x`，尾部仍为 None    |
| LL-03    | 空链表、删除唯一节点、断链、非法引用和环                 | 正常空状态正确；非法目标不通过，有界报错并允许修复    |
| QUE-01   | 入队 A、B、C，peek，再连续出队三次                       | peek 返回 A 且不变；离开顺序 A、B、C；最终为空        |
| QUE-02   | 入队 A、B，出队一次，入队 C，再出队两次                  | 服务序列 A、B、C；最终队列及 front/rear 正确          |
| QUE-03   | 空队列 dequeue/peek；单元素入队再出队                    | 空操作给出可理解错误且不变；单元素正常清空            |
| TEACH-01 | 三个板块逐题先执行小拓建议的错误动作                     | 暴露对应误解、给出局部反馈，不提前标记已教会          |
| TEACH-02 | 示范通过、规则或原因错误，再仅修正规则                   | 迁移完成前仍是待验证；所有门槛通过才保存已教会        |
| TEACH-03 | 只得到正确终态但过程违规；直接给聊天发“我教会了”         | 均不授予掌握状态；AI 无权更改判定                     |
| TEACH-04 | 请求三个提示并索要完整答案，随后开始迁移题               | 提示不泄露整题解法；迁移使用不同数据并清空操作状态    |
| AI-01    | 在各板块分别询问概念、索要完整代码、越界话题及注入指令   | 概念与当前结构一致；保持角色、安全与无完整答案边界    |
| AI-02    | 断开 AI 服务、超时、切换角色或切换题目后旧响应到达       | 反馈清楚且核心任务可继续；不显示过期/跨题回复         |
| RUN-01   | 三板块分别运行正确程序、异常程序、无限循环及修复后的程序 | 真实状态与结果一致；错误或超时可恢复，无需整页刷新    |
| NAV-01   | 四区导航、第三关完成、重玩、刷新、旧 Stack 存档迁移      | 路由正确；每区一颗宝石；原 Stack 进度保留且无跨区奖励 |
| STORE-01 | 损坏/未知存档、未知题目 ID、存储被禁用                   | 不崩溃、不授予未完成奖励，内存中可继续学习            |
| UX-01    | 键盘、窄屏、暂停/单步及减少动态效果                      | 可完成任务，文本与控件可达，逻辑结果不受动画偏好影响  |

验收还须对每道新习题记录示范与迁移的正确轨迹、错误轨迹、规则/原因不匹配、
重置和重玩的用例。自动测试覆盖纯逻辑、判定、布局、组件、执行桥接及 AI
代理边界；浏览器验证真实 Python、动画、跨区切换及超时恢复。真实模型的
角色稳定性、提示质量和儿童可读性需单独人工审阅，不能用 mock 代替。

沿用 `docs/bug-reports/README.md`：每个测试文件附带回归说明、已知缺口和最近
验证状态；实现时运行 `npm run test:report`，从真实结果生成
`docs/TEST-RESULTS.md`，保留每条用例的结果、耗时及失败信息。手工验收记录
版本、日期、浏览器/设备、输入、预期/实际、证据位置与未通过项。未执行项标注
“未执行”，不得以旧的 222 条测试结果声称三个新板块已通过。

### 12.12 交付完成标准与后续文档

只有当三个新板块分别完成标准四阶段、独立知识手册、导师与小拓角色、至少四道
教学练习，并通过上述自动及浏览器验收，才可宣称四板块功能齐备。
既有 Stack 流程、Python 执行、Tutor、题库、旧存档与宝石需通过回归。
原 Phase 7/8 的美术、跨浏览器、学校设备验收及 Phase 9 真实学生试点仍保留，
不能因扩展功能而标记完成；真实学习效果须由学生试点检验。

下一步先将这些需求转成 SPECIFICATION.md 的数据契约、判题状态机、执行与
导师上下文设计，再将依赖、每板块交付范围和验收门槛写入 ROADMAP.md。
本轮需求文档的完成不触发其他代码、美术、部署或 GitHub 上传工作。
