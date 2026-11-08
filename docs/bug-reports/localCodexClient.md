# Local Codex tutor bridge

Mock-process tests verify that questions travel through stdin, never shell
arguments, tool restrictions/read-only mode are passed, Chinese final text
is parsed from JSONL, and failed processes do not yield partial answers.
Live acceptance also submitted “pop是什么？” in the room-02 browser and
received a Chinese hint referencing the starter code's base stone.
Unit tests do not prove account availability, network connectivity, CLI
compatibility with future versions or general tutor response quality.
