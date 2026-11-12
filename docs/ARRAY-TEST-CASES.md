# Phase 12 数组测试用例记录

结果批次：2026-11-11 at 20:59.（Asia/Shanghai）。命令 `npm run test:report`。

本批全量 **41 文件、271/271 通过、0 失败、0 跳过**。本页展开新增 17 条：数组内容 11、页面 4、地图入口 1、本地导师目录回归 1。
状态及耗时取自 [TEST-RESULTS.md](./TEST-RESULTS.md)，输入/步骤和预期取自相应用例源码；“实际通过”表示本批全部对应断言成立，并非另造运行日志。

## ARR-A01 — 六类动画与预测

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 1 条。
- 自动化名称：`Array curriculum and teaching evidence › covers all six operation families and prediction checks with a trusted Python initial state`。
- 输入与步骤：读取六个演示步骤与预测，并对照执行初态。
- 预期：操作为 get/set/insert/remove/traverse/grow；均合法且有字幕；预测数 6；与 Python fixture 初态一致。
- 实际：**通过**，对应断言全部成立；耗时 **9 ms**。

## ARR-A02 — Python 完成证据

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 2 条。
- 自动化名称：`Array curriculum and teaching evidence › requires actual insert/set/remove evidence and correct retained identities for Python completion`。
- 输入与步骤：[A,B,C] 容量4；插 X1、原 C 改D、删B；再提交空证据和伪造身份。
- 预期：正确轨迹通过；终态碰巧正确但无证据、身份不匹配都失败。
- 实际：**通过**，对应断言全部成立；耗时 **4 ms**。

## ARR-A03 — 独立应用判定

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 3 条。
- 自动化名称：`Array curriculum and teaching evidence › requires growth, preserved supplies, removal and a final observation in Camp Packing`。
- 输入与步骤：grow5、insert(1,map)、remove(2)、traverse；另删去遍历或清空事件。
- 预期：rope/map/lamp 及全部要求证据通过；少遍历或无证据失败。
- 实际：**通过**，对应断言全部成立；耗时 **3 ms**。

## ARR-A04 — array-index 教学正例

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 4 条。
- 自动化名称：`Array curriculum and teaching evidence › 'array-index' needs demonstration, structured correction and fresh transfer`。
- 输入与步骤：get(0) 返回 A；先选错原因，再纠正；新例 get(2) 返回 M。
- 预期：空示范不通过；错原因不通过；正确规则后仍待验证；新例证据清空、完成后 learned；三个提示存在。
- 实际：**通过**，对应断言全部成立；耗时 **5 ms**。

## ARR-A05 — array-insert 教学正例

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 5 条。
- 自动化名称：`Array curriculum and teaching evidence › 'array-insert' needs demonstration, structured correction and fresh transfer`。
- 输入与步骤：[A,B,C] 插 X1；先选错原因，再纠正；新例 [K,L] 插 M1。
- 预期：空示范不通过；错原因不通过；正确规则后仍待验证；新例证据清空、完成后 learned；三个提示存在。
- 实际：**通过**，对应断言全部成立；耗时 **2 ms**。

## ARR-A06 — array-remove 教学正例

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 6 条。
- 自动化名称：`Array curriculum and teaching evidence › 'array-remove' needs demonstration, structured correction and fresh transfer`。
- 输入与步骤：[A,B,C,D] 删除1，返回B；先选错原因，再纠正；新例 [K,L,M] 删除0，返回K。
- 预期：空示范不通过；错原因不通过；正确规则后仍待验证；新例证据清空、完成后 learned；三个提示存在。
- 实际：**通过**，对应断言全部成立；耗时 **2 ms**。

## ARR-A07 — array-grow 教学正例

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 7 条。
- 自动化名称：`Array curriculum and teaching evidence › 'array-grow' needs demonstration, structured correction and fresh transfer`。
- 输入与步骤：[A,B] 扩4，尾插C；先选错原因，再纠正；新例 [K,L,M] 扩5，尾插N。
- 预期：空示范不通过；错原因不通过；正确规则后仍待验证；新例证据清空、完成后 learned；三个提示存在。
- 实际：**通过**，对应断言全部成立；耗时 **2 ms**。

## ARR-A08 — array-index 教学反例

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 8 条。
- 自动化名称：`Array curriculum and teaching evidence › 'array-index' cannot learn from hints, unrequested outcomes or replay`。
- 输入与步骤：提示请求5次；越界或不符合题意操作；提交；Reset 与 Replay。
- 预期：hintLevel=3 且不授掌握；示范未完成不推进；Reset 清事件，Replay 回 intro。
- 实际：**通过**，对应断言全部成立；耗时 **2 ms**。

## ARR-A09 — array-insert 教学反例

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 9 条。
- 自动化名称：`Array curriculum and teaching evidence › 'array-insert' cannot learn from hints, unrequested outcomes or replay`。
- 输入与步骤：提示请求5次；越界或不符合题意操作；提交；Reset 与 Replay。
- 预期：hintLevel=3 且不授掌握；示范未完成不推进；Reset 清事件，Replay 回 intro。
- 实际：**通过**，对应断言全部成立；耗时 **1 ms**。

## ARR-A10 — array-remove 教学反例

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 10 条。
- 自动化名称：`Array curriculum and teaching evidence › 'array-remove' cannot learn from hints, unrequested outcomes or replay`。
- 输入与步骤：提示请求5次；越界或不符合题意操作；提交；Reset 与 Replay。
- 预期：hintLevel=3 且不授掌握；示范未完成不推进；Reset 清事件，Replay 回 intro。
- 实际：**通过**，对应断言全部成立；耗时 **1 ms**。

## ARR-A11 — array-grow 教学反例

- 源码：[src/content/modules/array.test.ts](../src/content/modules/array.test.ts)，文件内第 11 条。
- 自动化名称：`Array curriculum and teaching evidence › 'array-grow' cannot learn from hints, unrequested outcomes or replay`。
- 输入与步骤：提示请求5次；越界或不符合题意操作；提交；Reset 与 Replay。
- 预期：hintLevel=3 且不授掌握；示范未完成不推进；Reset 清事件，Replay 回 intro。
- 实际：**通过**，对应断言全部成立；耗时 **1 ms**。

## ARR-A12 — 观察推进门槛

- 源码：[src/components/game/ArrayGame.test.tsx](../src/components/game/ArrayGame.test.tsx)，文件内第 1 条。
- 自动化名称：`Array playable rooms › keeps Python locked until all demonstrations and predictions are completed`。
- 输入与步骤：依次回答六个预测并逐帧前进。
- 预期：未完成时第二关继续按钮禁用；全部完成后回调恰好一次。
- 实际：**通过**，对应断言全部成立；耗时 **5343 ms**。

## ARR-A13 — 应用失败与恢复

- 源码：[src/components/game/ArrayGame.test.tsx](../src/components/game/ArrayGame.test.tsx)，文件内第 2 条。
- 自动化名称：`Array playable rooms › does not award an application gem before complete evidence and supports correction`。
- 输入与步骤：先直接检查；满容量插入；再扩5/插map1/删food2；检查；最后 traverse 并检查。
- 预期：早期无宝石；满容量提示；缺遍历不通过；完整证据只触发一次完成，显示宝石。
- 实际：**通过**，对应断言全部成立；耗时 **1905 ms**。

## ARR-A14 — 可见教学流程

- 源码：[src/components/game/ArrayGame.test.tsx](../src/components/game/ArrayGame.test.tsx)，文件内第 3 条。
- 自动化名称：`Array playable rooms › renders the learner correction gate and only awards a taught activity after the fresh case`。
- 输入与步骤：索引题示范 get0；选规则和原因；新例 get2。
- 预期：规则提交后不保存掌握；新例通过才回调 array-index 并显示学会。
- 实际：**通过**，对应断言全部成立；耗时 **1714 ms**。

## ARR-A15 — Python 错态与取消

- 源码：[src/components/game/ArrayGame.test.tsx](../src/components/game/ArrayGame.test.tsx)，文件内第 4 条。
- 自动化名称：`Array playable rooms › rejects a wrong Python result and cancels a pending run when the room closes`。
- 输入与步骤：Mock 返回未改变的初态；再次发起挂起 Run，关闭组件。
- 预期：错误结果不开放下一关；卸载调用 cancel；不触发完成。
- 实际：**通过**，对应断言全部成立；耗时 **1114 ms**。

## ARR-A16 — 地图直达且无 Stack 前置

- 源码：[src/App.test.tsx](../src/App.test.tsx)，文件内第 1 条。
- 自动化名称：`App › opens Array from the map without requiring Stack completion`。
- 输入与步骤：零存档，从 Supply Camp 按钮进入。
- 预期：进入 Camp storage slots；Python、题库仍按数组内部进度锁定。
- 实际：**通过**，对应断言全部成立；耗时 **1031 ms**。

## ARR-A17 — 本地导师默认目录与显式覆盖

- 源码：[api/tutor/localCodexClient.test.ts](../api/tutor/localCodexClient.test.ts)，文件内第 1 条。
- 自动化名称：`local Codex tutor › passes the canonical Codex directory when the desktop environment omits it, preserving explicit overrides`。
- 输入与步骤：先省略 CODEX_HOME，再指定测试专用覆盖值；Mock CLI 两次调用。
- 预期：CLI 子进程收到用户规范目录；显式覆盖原样保留；应用不读取认证文件。
- 实际：**通过**，对应断言全部成立；耗时 **59 ms**。

## 浏览器与覆盖边界

真实 CodeMirror、Python、六个操作动画、四题的全部新例、重载、宝石、键盘手册、窄屏、导师/小拓问答与故障回退见 [ARRAY-ACCEPTANCE.md](./ARRAY-ACCEPTANCE.md)。
本批仍运行全部旧 Stack 及 Phase 11 回归。Mock 组件验证不替代真实 Worker/模型；OS 动态偏好、广浏览器、学校设备性能和真实儿童学习效果不在本批通过结论内。
