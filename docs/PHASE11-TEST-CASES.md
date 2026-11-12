# Phase 11 测试用例记录

本清单按已有测试源码与实际运行结果整理，记录日期为 2026-11-11。

后续阶段会覆盖滚动的 TEST-RESULTS.md；本清单保留 20:17 的历史批次、耗时与哈希，
不随后续运行改写通过结论。当前数组阶段结果见 [ARRAY-TEST-CASES.md](./ARRAY-TEST-CASES.md)。

## 运行基线

- 结果来源：[TEST-RESULTS.md](./TEST-RESULTS.md)，生成时间 **2026-11-11 20:17**（Asia/Shanghai）。
- 执行命令：`npm run test:report`；原报告为 **39 个文件、254/254 用例通过、0 失败、0 跳过**。
- 本清单逐条展开 Phase 11 新增的 **8 个文件、32 条自动化用例**；其余 222 条既有回归仍见原始逐例报告。
- 基于 `main` 的 `300b1d0` 加本地 Phase 10/11 工作区；没有已推送提交对应本批新代码。
- 本次仅整理记录，**没有重新运行产品测试**；实际状态和耗时从原报告逐行读取，不手改其结果。
- “实际结果”表示该次通过运行中被断言验证的事实，不声称保存了未记录的原始运行日志。表内一行对应一条测试，多个子断言不另算测试数量。
- 环境：Vitest 的 Node/jsdom；Python 组使用本地真实 Pyodide，Worker 和导师代理组分别使用 Mock Worker/模型。真实浏览器另记。
- 结果报告 SHA-256：`bd28e1d03590be040cdf40ad18abb516eca9a49804edfd6217b74c4eec5e1fe9`。

## 自动化用例明细

### 结构操作与证据（6 条）

测试源码：[src/engine/modules/structures.test.ts](../src/engine/modules/structures.test.ts)。下列编号与原报告该文件内的行号一一对应。

#### P11-STRUCT-01

- 自动化名称：`multi-structure operations and evidence › shifts array identities on insertion/removal and preserves them on replacement`（文件内第 1 条）。
- 需求关联：ARR-02。
- 输入 / 前置条件：数组 [A,B,C]，容量 4。
- 步骤：在索引 1 插 X，再删除索引 2；重放轨迹并伪造 after 再校验。
- 预期结果：移除返回 B、终态 [A,X,C]；原初态不变，真实轨迹通过、伪造轨迹失败。
- 实际结果（已断言验证）：返回 B，终态 [A,X,C]，原长度仍为 3；真实重放 true，伪造重放 false。
- 测试状态：**通过**；原报告耗时 **5 ms**。

#### P11-STRUCT-02

- 自动化名称：`multi-structure operations and evidence › rejects bounds and full-capacity operations without mutation, allowing grow and retry`（文件内第 2 条）。
- 需求关联：ARR-01/03。
- 输入 / 前置条件：数组 [A]，容量 1；索引 -1、1、0.5。
- 步骤：读取非法位置；满容量尾插 B；扩容到 3 后重试。
- 预期结果：非法读取不改状态；插入报 CAPACITY_FULL，扩容后可插入。
- 实际结果（已断言验证）：非法操作后状态与初态相同；容量不足错误命中，扩容后 accepted=true。
- 测试状态：**通过**；原报告耗时 **1 ms**。

#### P11-STRUCT-03

- 自动化名称：`multi-structure operations and evidence › follows references, preserves the successor and detaches removed nodes`（文件内第 3 条）。
- 需求关联：LL-02。
- 输入 / 前置条件：a -> b -> None，散点 x。
- 步骤：a 后插入 x，再删除 head a。
- 预期结果：可达序列 x,b；被移除 a.next=None，轨迹重放通过。
- 实际结果（已断言验证）：可达序列 [x,b]，a.next=null，重放 true。
- 测试状态：**通过**；原报告耗时 **1 ms**。

#### P11-STRUCT-04

- 自动化名称：`multi-structure operations and evidence › detects cycles with bounded traversal while allowing link repair`（文件内第 4 条）。
- 需求关联：LL-03。
- 输入 / 前置条件：a -> b -> None。
- 步骤：将 b.next 指向 a，遍历；再改回 None 并遍历。
- 预期结果：形成环时有界报 CYCLE，修复后可遍历 a,b。
- 实际结果（已断言验证）：环遍历抛 CYCLE；修复后顺序 [a,b]。
- 测试状态：**通过**；原报告耗时 **2 ms**。

#### P11-STRUCT-05

- 自动化名称：`multi-structure operations and evidence › records FIFO service and leaves peek unchanged even with duplicate values`（文件内第 5 条）。
- 需求关联：QUE-01/03。
- 输入 / 前置条件：空队列，依次入队两个值均为 A 的物品。
- 步骤：peek；dequeue；验证身份及重放；另在空队列 dequeue。
- 预期结果：peek 不变，最早 ID 先服务，空出队报 EMPTY。
- 实际结果（已断言验证）：peek 前后状态相同；服务 ID=new-0，重放 true；空出队 EMPTY。
- 测试状态：**通过**；原报告耗时 **1 ms**。

#### P11-STRUCT-06

- 自动化名称：`multi-structure operations and evidence › rejects unknown fields, invalid references, nonfinite values and fabricated histories`（文件内第 6 条）。
- 需求关联：ARR/LL/QUE 边界。
- 输入 / 前置条件：含额外 learned 字段的数组、Infinity 队列值、不存在的 head、缺字段事件。
- 步骤：分别调用状态校验和事件重放。
- 预期结果：所有异常状态和伪造轨迹均被拒绝。
- 实际结果（已断言验证）：四组校验均为 false；未扩展到所有可能非法输入。
- 测试状态：**通过**；原报告耗时 **1 ms**。

### 进度迁移与存储恢复（6 条）

测试源码：[src/engine/modules/progress.test.ts](../src/engine/modules/progress.test.ts)。下列编号与原报告该文件内的行号一一对应。

#### P11-STORE-01

- 自动化名称：`four-module progress migration and memory recovery › does not hide a quota failure when a subscriber rereads progress`（文件内第 1 条）。
- 需求关联：STORE-01。
- 输入 / 前置条件：getItem 正常、setItem 抛 quota；订阅者收到通知后重新 read。
- 步骤：完成数组；检查失败状态及内存完成；恢复写入后保存并重新读取。
- 预期结果：读操作不得掩盖写失败；内存保留，恢复后可持久化。
- 实际结果（已断言验证）：首次 complete=false、available=false、内存完成=true；恢复后写入 true，新 store 读到完成。
- 测试状态：**通过**；原报告耗时 **7 ms**。

#### P11-STORE-02

- 自动化名称：`four-module progress migration and memory recovery › migrates all three Stack records and leaves the legacy evidence unchanged`（文件内第 2 条）。
- 需求关联：NAV-01/STORE-01。
- 输入 / 前置条件：旧房间 level=2；旧教学 unlocked=true、mastered=[build,unknown,build]；旧 Stack 宝石=true。
- 步骤：读取迁移；更新数组解锁到 2；读取旧记录。
- 预期结果：Stack 保留宝石/入口/已知题目，数组不获宝石，旧记录不被覆盖。
- 实际结果（已断言验证）：Stack level=3、completed=true、题库开放且 mastered=[build]；数组 completed=false；旧 level 仍为 2。
- 测试状态：**通过**；原报告耗时 **4 ms**。

#### P11-STORE-03

- 自动化名称：`four-module progress migration and memory recovery › merges monotonically, retains other modules and never duplicates gems or mastery`（文件内第 3 条）。
- 需求关联：NAV-01/STORE-01。
- 输入 / 前置条件：空存储。
- 步骤：完成数组和 Stack；重复掌握 array-index；尝试降低数组解锁；向队列写数组题 ID。
- 预期结果：进度单调、掌握去重、奖励不重复、模块 ID 隔离。
- 实际结果（已断言验证）：数组 level=3，mastered 仅一个 array-index；完成模块数 2；队列错误题 ID 被拒绝。
- 测试状态：**通过**；原报告耗时 **5 ms**。

#### P11-STORE-04

- 自动化名称：`four-module progress migration and memory recovery › rejects inconsistent modules and unknown fields while filtering unknown exercise IDs`（文件内第 4 条）。
- 需求关联：STORE-01。
- 输入 / 前置条件：queue.completed=true 但未解锁第三关；数组题 ID 含未知和重复项；顶层带 privateCode。
- 步骤：解析记录。
- 预期结果：矛盾模块回退；未知 ID 过滤并去重；顶层额外字段不接受。
- 实际结果（已断言验证）：queue.completed=false；数组掌握仅 array-index；含 privateCode 的记录回退初态。
- 测试状态：**通过**；原报告耗时 **1 ms**。

#### P11-STORE-05

- 自动化名称：`four-module progress migration and memory recovery › keeps memory progress on read/write failure and persists it after storage recovers`（文件内第 5 条）。
- 需求关联：STORE-01。
- 输入 / 前置条件：存储访问函数先抛 denied，之后恢复正常。
- 步骤：完成队列；读取内存；恢复后更新 Stack 并以新 store 重载。
- 预期结果：读写受阻不丢本次进度，恢复后写入包括内存进度。
- 实际结果（已断言验证）：初次保存 false，内存队列完成 true；恢复后保存 true，新 store 保留队列完成。
- 测试状态：**通过**；原报告耗时 **1 ms**。

#### P11-STORE-06

- 自动化名称：`four-module progress migration and memory recovery › does not overwrite an unsupported future format and retries failed migration writes`（文件内第 6 条）。
- 需求关联：STORE-01。
- 输入 / 前置条件：新进度 key 内为 version=99 且含 private=preserve。
- 步骤：尝试完成 Stack；再移除未知版本记录并重试。
- 预期结果：不覆盖未来格式；格式障碍移除后可重试。
- 实际结果（已断言验证）：首次写入 false，原 preserve 内容还在；移除后保存成功且 version=2。
- 测试状态：**通过**；原报告耗时 **1 ms**。

### 教小拓教学门槛（3 条）

测试源码：[src/engine/modules/teaching.test.ts](../src/engine/modules/teaching.test.ts)。下列编号与原报告该文件内的行号一一对应。

#### P11-TEACH-01

- 自动化名称：`deterministic teaching gates › requires observed evidence, correct rule and reason, then an independent transfer`（文件内第 1 条）。
- 需求关联：TEACH-02/03/04。
- 输入 / 前置条件：queue-peek 示范 A、迁移 K；规则 peek-keeps，原因 inspect-not-remove。
- 步骤：空证据提交；peek 后提交；选错原因再修正；提前提交迁移；启动迁移并 peek K 再提交；重玩。
- 预期结果：每个门槛按序通过；迁移独立；只在新例通过后 learned。
- 实际结果（已断言验证）：无证据仍 demonstrate；示范后 correct-rule；错原因不通过；正确后 transfer-ready；新例清空事件，返回 K 后 learned；Replay 回 intro。
- 测试状态：**通过**；原报告耗时 **24 ms**。

#### P11-TEACH-02

- 自动化名称：`deterministic teaching gates › cannot grant mastery through hints, disallowed actions or a correct terminal state alone`（文件内第 2 条）。
- 需求关联：TEACH-03/04。
- 输入 / 前置条件：相同教学夹具，只允许 peek。
- 步骤：请求提示 10 次；start 后尝试 dequeue；直接提交迁移。
- 预期结果：提示不授予掌握，非法动作不变；不能凭终态或越级提交成功。
- 实际结果（已断言验证）：hintLevel=3、起初仍 intro；dequeue 返回原会话；越级提交后仍 demonstrate。
- 测试状态：**通过**；原报告耗时 **6 ms**。

#### P11-TEACH-03

- 自动化名称：`deterministic teaching gates › rejects identical transfer data and evidence from another exercise`（文件内第 3 条）。
- 需求关联：TEACH-04/隔离。
- 输入 / 前置条件：把迁移初态替换为示范数据；把当前 exerciseId 改为 queue-first。
- 步骤：创建相同数据的新会话；向错题会话发 start。
- 预期结果：同数据迁移被拒绝；另一题的会话不被推进。
- 实际结果（已断言验证）：创建相同迁移抛错；错题会话保持原样。
- 测试状态：**通过**；原报告耗时 **6 ms**。

### 真实 Python 执行（6 条）

测试源码：[src/engine/pyodide/moduleExecution.test.ts](../src/engine/pyodide/moduleExecution.test.ts)。下列编号与原报告该文件内的行号一一对应。

#### P11-PY-01

- 自动化名称：`real Pyodide multi-module harnesses › executes array in Python and validates independently replayed state`（文件内第 1 条）。
- 需求关联：RUN-01/ARR-02。
- 输入 / 前置条件：array-code/main 初始 [A,B,C]，容量 4。
- 步骤：真实 Pyodide 执行 insert(1,X)、set(3,D)、remove(2)、打印 traverse。
- 预期结果：终态 [A,X,D]；无错误、事件非空且独立重放校验成功。
- 实际结果（已断言验证）：error=null，最终值 [A,X,D]，validModuleResult=true 且事件数 > 0。
- 测试状态：**通过**；原报告耗时 **38 ms**。

#### P11-PY-02

- 自动化名称：`real Pyodide multi-module harnesses › executes queue in Python and validates independently replayed state`（文件内第 2 条）。
- 需求关联：RUN-01/QUE-02。
- 输入 / 前置条件：queue-code/main 空队列。
- 步骤：真实执行 enqueue A/B、peek、dequeue、enqueue C。
- 预期结果：剩余 [B,C]；无错误且事件可验证。
- 实际结果（已断言验证）：error=null，waiting 值 [B,C]，validModuleResult=true 且事件非空。
- 测试状态：**通过**；原报告耗时 **14 ms**。

#### P11-PY-03

- 自动化名称：`real Pyodide multi-module harnesses › executes linked-list in Python and validates independently replayed state`（文件内第 3 条）。
- 需求关联：RUN-01/LL-02。
- 输入 / 前置条件：linked-list-code/main：a -> b，散点 x。
- 步骤：真实执行 insertAfter(a,x)、removeHead、visit(x)。
- 预期结果：head=x、x.next=b；无错误且事件可验证。
- 实际结果（已断言验证）：error=null，[head,next]=[x,b]，validModuleResult=true 且事件非空。
- 测试状态：**通过**；原报告耗时 **15 ms**。

#### P11-PY-04

- 自动化名称：`real Pyodide multi-module harnesses › starts fresh, clears variables after exceptions and rejects object replacement or tampering`（文件内第 4 条）。
- 需求关联：RUN-01/执行隔离。
- 输入 / 前置条件：先设置 previous_secret=42 并空出队；随后新 Run；再分别替换 array 对象与直接修改其内部 items。
- 步骤：运行失败样例、新运行断言旧变量不存在、分别提交两种篡改。
- 预期结果：异常不污染下次命名空间；直接替换/内部篡改不能伪造合法操作证据。
- 实际结果（已断言验证）：空出队 EMPTY；新 Run 无旧变量且只有一次事件；两种篡改均 INVALID_EVIDENCE。
- 测试状态：**通过**；原报告耗时 **56 ms**。

#### P11-PY-05

- 自动化名称：`real Pyodide multi-module harnesses › allows a caught invalid operation followed by repair, and rejects unknown fixtures`（文件内第 5 条）。
- 需求关联：RUN-01/ARR-01。
- 输入 / 前置条件：array-code/main；另用 queue 模块配 array-code 任务。
- 步骤：捕获 get(-1) 的 ValueError 后 get(0)；提交跨区 fixture。
- 预期结果：允许改正后继续；未知组合在执行前拒绝。
- 实际结果（已断言验证）：修复 Run 无错误，accepted 序列 [false,true]；跨区组合 INVALID_REQUEST。
- 测试状态：**通过**；原报告耗时 **15 ms**。

#### P11-PY-06

- 自动化名称：`real Pyodide multi-module harnesses › keeps bounded output labelled and refuses an unbounded operation trace`（文件内第 6 条）。
- 需求关联：RUN-01/资源限制。
- 输入 / 前置条件：print 5000 个 x；另运行 129 次 get(0)。
- 步骤：分别真实运行输出与操作超限程序。
- 预期结果：长输出明确截断；超限操作不得被当成完整有效轨迹。
- 实际结果（已断言验证）：输出含 [Output truncated]；129 次操作报 EVIDENCE_LIMIT。
- 测试状态：**通过**；原报告耗时 **37 ms**。

### Worker 生命周期（2 条）

测试源码：[src/engine/pyodide/moduleRunner.test.ts](../src/engine/pyodide/moduleRunner.test.ts)。下列编号与原报告该文件内的行号一一对应。

#### P11-WORKER-01

- 自动化名称：`module Worker lifecycle › ignores stale identities, settles once and permits a clean subsequent run`（文件内第 1 条）。
- 需求关联：RUN-01/请求隔离。
- 输入 / 前置条件：Mock Worker，当前 session=test；另发 session=old 的结果。
- 步骤：并发提交、ready、过期结果、有效结果、重复结果；再启动新会话并取消。
- 预期结果：并发 BUSY；错身份不结算；重复结果只结算一次；取消明确返回。
- 实际结果（已断言验证）：BUSY；过期结果后仍 busy；有效结果无错误且 terminate 一次；新会话返回 CANCELLED。
- 测试状态：**通过**；原报告耗时 **34 ms**。

#### P11-WORKER-02

- 自动化名称：`module Worker lifecycle › terminates hung or crashed workers and recovers without losing the caller task`（文件内第 2 条）。
- 需求关联：RUN-01/故障恢复。
- 输入 / 前置条件：三个依次创建的 Mock Worker。
- 步骤：第一轮 ready 后假时钟推进 5000ms；第二轮抛 error；第三轮初始化假时钟推进 30000ms。
- 预期结果：TIMEOUT、WORKER_ERROR、INIT_TIMEOUT；每次都可建立下一轮 Worker。
- 实际结果（已断言验证）：对应三个错误码均命中；首个 Worker terminate 一次，总创建三个；不是学校设备耗时测量。
- 测试状态：**通过**；原报告耗时 **25 ms**。

### 导师代理边界（5 条）

测试源码：[api/tutor/moduleTutor.test.ts](../api/tutor/moduleTutor.test.ts)。下列编号与原报告该文件内的行号一一对应。

#### P11-AI-01

- 自动化名称：`registered module tutor boundary › chooses reviewed array knowledge without displaying raw model output or code`（文件内第 1 条）。
- 需求关联：AI-01。
- 输入 / 前置条件：array-code/main；模型 mock 返回含额外 code=full solution 的 intent JSON。
- 步骤：发送提问并检查系统提示、回复和 requestId。
- 预期结果：使用数组知识，额外模型代码不渲染，保留请求身份。
- 实际结果（已断言验证）：200，requestId=test-request；回复不含 full solution；系统提示含 Module: array，不含旧栈提示。
- 测试状态：**通过**；原报告耗时 **21 ms**。

#### P11-AI-02

- 自动化名称：`registered module tutor boundary › chooses reviewed linked-list knowledge without displaying raw model output or code`（文件内第 2 条）。
- 需求关联：AI-01。
- 输入 / 前置条件：linked-list-code/main；同样的额外 code mock。
- 步骤：发送链表提问并检查提示与回复。
- 预期结果：使用链表知识，原始模型代码不显示。
- 实际结果（已断言验证）：200，身份回传；回复无 full solution；提示含 Module: linked-list，未使用旧栈提示。
- 测试状态：**通过**；原报告耗时 **5 ms**。

#### P11-AI-03

- 自动化名称：`registered module tutor boundary › chooses reviewed queue knowledge without displaying raw model output or code`（文件内第 3 条）。
- 需求关联：AI-01。
- 输入 / 前置条件：queue-code/main；同样的额外 code mock。
- 步骤：发送队列提问并检查提示与回复。
- 预期结果：使用队列知识，原始模型代码不显示。
- 实际结果（已断言验证）：200，身份回传；回复无 full solution；提示含 Module: queue，未使用旧栈提示。
- 测试状态：**通过**；原报告耗时 **2 ms**。

#### P11-AI-04

- 自动化名称：`registered module tutor boundary › rejects cross-module tasks, unsafe questions and oversize bodies before a provider call`（文件内第 4 条）。
- 需求关联：AI-01/请求限制。
- 输入 / 前置条件：queue 配 array-code；索取 system prompt；body 中 junk 长度 33000。
- 步骤：分别请求代理并检查 provider 调用次数。
- 预期结果：非法任务和大请求拒绝；注入请求被过滤；都不调用模型。
- 实际结果（已断言验证）：跨区任务 400；注入 moderationFlag=true；大 body 413；模型调用次数 0。
- 测试状态：**通过**；原报告耗时 **4 ms**。

#### P11-AI-05

- 自动化名称：`registered module tutor boundary › returns module-specific failure and never gives a reward or raw generated prose`（文件内第 5 条）。
- 需求关联：AI-02。
- 输入 / 前置条件：array-code/main，模型 mock 抛 private credential。
- 步骤：调用代理并检查回退正文。
- 预期结果：模块回退不泄露内部错误，不输出掌握/奖励。
- 实际结果（已断言验证）：502，回复含 array，不含 private credential 或 learned。
- 测试状态：**通过**；原报告耗时 **3 ms**。

### 聊天异步隔离（2 条）

测试源码：[src/tutor/scopedTutor.test.ts](../src/tutor/scopedTutor.test.ts)。下列编号与原报告该文件内的行号一一对应。

#### P11-CHAT-01

- 自动化名称：`scoped tutor requests › cancels the previous role/task request and ignores its late response`（文件内第 1 条）。
- 需求关联：AI-02。
- 输入 / 前置条件：两个延迟 fetch：first 旧角色、second 小拓角色。
- 步骤：先发旧请求再发新请求；先解决新请求，再解决旧请求。
- 预期结果：新请求取消旧请求，旧回复不能混入当前对话。
- 实际结果（已断言验证）：旧 signal.aborted=true；新回复 Which end is front?；旧 ask 返回 null。
- 测试状态：**通过**；原报告耗时 **36 ms**。

#### P11-CHAT-02

- 自动化名称：`scoped tutor requests › rejects a mismatched response identity and uses a module-specific offline fallback`（文件内第 2 条）。
- 需求关联：AI-02。
- 输入 / 前置条件：queue-code/main；先返回 requestId=stale，再模拟网络抛 offline。
- 步骤：分别检查错身份与断网结果。
- 预期结果：拒绝错身份，队列失败反馈不出现栈专用说明。
- 实际结果（已断言验证）：错身份 ok=false；断网回复含 queue、不含 stack。
- 测试状态：**通过**；原报告耗时 **6 ms**。

### 通用关卡与播放（2 条）

测试源码：[src/components/game/ModuleStage.test.tsx](../src/components/game/ModuleStage.test.tsx)。下列编号与原报告该文件内的行号一一对应。

#### P11-SHELL-01

- 自动化名称：`shared module shell and snapshot playback › keeps stages ordered, provides knowledge/tutor and awards only from third-stage completion`（文件内第 1 条）。
- 需求关联：NAV-01/知识与导师。
- 输入 / 前置条件：数组共用壳，房间内容为测试回调；清空存档。
- 步骤：第一关尝试 complete；两次已验证 advance；第三关 complete。
- 预期结果：第二关初始锁定；第一关不授奖；第三关完成才开练习；知识和导师存在。
- 实际结果（已断言验证）：初始 Python 按钮 disabled；第一关 completed=false；第三关 completed=true，第四关按钮启用；可找到知识标题和导师文本（此断言未验证折叠内容的实际可见性）。
- 测试状态：**通过**；原报告耗时 **787 ms**。

#### P11-SHELL-02

- 自动化名称：`shared module shell and snapshot playback › replays arbitrary queue snapshots without executing or changing the data`（文件内第 2 条）。
- 需求关联：UX-01/播放逻辑。
- 输入 / 前置条件：队列快照 [A,B] 与 [B]，假时钟。
- 步骤：Play；推进 1200ms；Step back；比对原始快照。
- 预期结果：展示后态和前态，播放不重新执行操作、不改输入数据。
- 实际结果（已断言验证）：出现 After service；后退显示 A,B；快照序列化内容与初始相同。
- 测试状态：**通过**；原报告耗时 **166 ms**。

## 既有 Stack 回归与浏览器记录

以下是既有流程在本批运行中的回归入口，不计入新增 32 条。

| 自动化文件                                                                | 本批结果 | 回归内容                                                     |
| ------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| [AppCompletion.test.tsx](../src/AppCompletion.test.tsx)                   | 2/2 通过 | 终关奖励去重与 v2 持久化、重载保留宝石、禁用存储后的会话进度 |
| [PracticeUnlock.test.tsx](../src/components/game/PracticeUnlock.test.tsx) | 2/2 通过 | 出口前题库锁定、出口后开放并写入 v2、旧宝石玩家仍可进入      |
| [GameStage.test.tsx](../src/components/game/GameStage.test.tsx)           | 5/5 通过 | 房间顺序、回退不重锁、重载入口及重玩单调性                   |

六项真实浏览器用例的输入、步骤、预期、实际与时间记录在 [PHASE11-ACCEPTANCE.md 的 Browser checks](./PHASE11-ACCEPTANCE.md#browser-checks)：

| 浏览器用例 ID | 检查内容                                                             | 已记录状态                   |
| ------------- | -------------------------------------------------------------------- | ---------------------------- |
| P11-RUN-1     | 数组、链表、队列在真实 Worker 中运行并验证非空事件证据               | 通过，20:08:38               |
| P11-RUN-2     | 无限循环超时后重建 Worker，再运行队列样例                            | 通过，20:10:07               |
| P11-RUN-3     | 500ms 后取消当前运行                                                 | 通过，20:10:49               |
| P11-NAV-1     | 原玩家 1/4 宝石保留、新区域仍锁定                                    | 通过，原记录未单独保存时分秒 |
| P11-STACK-1   | 旧房间 02/03 和教小拓入口保留，进入时从 Trial 开始                   | 通过，原记录未单独保存时分秒 |
| P11-STACK-2   | 实际 CodeMirror 编辑与 Python 运行，得到 base/moon/star 精确目标匹配 | 通过，原记录未单独保存时分秒 |

浏览器环境为本地 Windows 上的 Codex 内置 Chromium；证据目录为 `artifacts/phase11/`，不随 Git 上传。
其中 `browser-results.txt/png` 记录前三项 PASS；`stack-regression.txt/png` 记录 Stack 目标匹配。完整限制沿用验收文档。

## 未执行与覆盖边界

- 三个新板块的完整关卡和十二题 UI 尚未交付，不能把基础层通过记录当成全部学习体验通过。
- 真实模型角色/语气与提示质量、全部十二题的独立迁移验收、独立 Edge/Firefox、学校设备冷启动、最终美术与真实学生试点仍未执行。
- P11-STRUCT-01 的测试名称含 replacement，但该用例实际断言只覆盖插入、删除、原状态与事件重放；真实 Python 的 set 组合路径在 P11-PY-01 覆盖，不能据名称推断单独验证了 set 的身份保持。
- Mock Worker 生命周期和假时钟推进不代表真实耗时或性能结果；真实超时恢复另有浏览器记录。
- 上述期望属于教学功能验证，不是对恶意脚本的防作弊认证。

## 后续维护

新增测试时在对应阶段清单登记稳定用例 ID、源码位置、输入、步骤、预期、实际和证据。运行 `npm run test:report` 后再同步清单，保留原报告批次时间；未执行、失败、阻塞与通过分开记录，不复制上一批的通过结论。
