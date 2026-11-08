# Practice-bank unlock integration

Last verified: 2026-11-08 — 2/2 passing (`npm run test:report`).

| Case | Expected |
| --- | --- |
| Before final exit | Room 04 unavailable even if room 03 is unlocked |
| At exit | Persist bank unlock; preserve original completion callback; Continue opens the bank |
| Reload | Bank remains accessible from saved unlock |
| Existing completion | Previously earned world-map Stack gem grants bank access |

The first three assertions run as one integration case, using a mock maze
boundary and real GameStage/practice room. Individual case results and
timing are in [TEST-RESULTS.md](../TEST-RESULTS.md). Real-maze exit traversal
is also recorded in [TEACHING-ACCEPTANCE.md](../TEACHING-ACCEPTANCE.md).
