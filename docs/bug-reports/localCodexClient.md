# Local Codex tutor bridge

Mock-process tests verify that questions travel through stdin, never shell
arguments, tool restrictions/read-only mode are passed, Chinese final text
is parsed from JSONL, and failed processes do not yield partial answers.
Live acceptance also submitted “pop是什么？” in the room-02 browser and
received a Chinese hint referencing the starter code's base stone.
Unit tests do not prove account availability, network connectivity, CLI
compatibility with future versions or general tutor response quality.

## Phase 12 verification

2026-11-11：新增默认 CODEX_HOME 与显式覆盖回归；本批全量 271/271 通过。输入、步骤、预期、实际和耗时见 [数组用例记录](../ARRAY-TEST-CASES.md)，浏览器及在线模型证据见 [数组验收](../ARRAY-ACCEPTANCE.md)。
