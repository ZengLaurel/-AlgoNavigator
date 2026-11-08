# World-map completion integration

Tests isolate the application reward boundary with a mock GameStage final
completion callback. They verify exactly one persistent gem, repeat-callback
deduplication and an in-session gem plus warning when storage is blocked.
ForkedPathRoom separately verifies that the callback only fires at the exit.
App tests exercise the real map and first room, including no early gem.
