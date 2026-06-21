# SwiftPOS — AI Context

Read this file first before making any changes. For more detail, see PROJECT_STATUS.md.

## Project Summary

SwiftPOS is a web-based Point of Sale system for small to medium retail businesses. Built with Laravel 12 + React 19, it handles sales, inventory, procurement, customer returns, and cash register shift management.

## Current Version

v1.0 Beta

## Current Sprint

Sprint 12.7 — Product Insights Top 5 & Restock Priority (completed)
Next: Sprint 12.8 — AI Assistant RBAC Protection (tentative)

## Critical Decisions

- **Customer Returns never modify cash balance.** Returns restore stock only. Cash refunds are handled outside the system.
- **Cash Register Phase 1 uses nullable shift_id.** Transactions can be created without an active shift. Mandatory validation is deferred to Phase 2.
- **Shift money uses decimal(15,0) (integer).** All other money columns use decimal(15,2). This is an intentional inconsistency — do not change without discussion.
- **Inventory Logs type is an enum.** Values: restock, sale, adjustment, return, customer_return, stock_opname. Adding new types requires a migration.
- **Single-store architecture.** All tables have store_id. No multi-store support exists yet.
- **AI Assistant is read-only.** No LLM-generated SQL is ever executed. All data retrieval uses predefined skills in the skill registry. DeepSeek only summarizes data, it never generates or executes queries.
- **AI conversation logging is silent-fail.** Logging failure must never break the user experience. Uses try/catch around all AiConversation::create calls.
- **AI rate limiting uses Laravel Cache.** 30 requests per user per minute. Uses Cache::add + Cache::increment pattern.
- **AI skill registry has 4 active skills:** `sales_overview`, `product_insights`, `product_condition`, `customer_insights`. The old `recent_activity` skill is permanently retired.
- **AI `extractFilters()` fallback default periode.** If no date keyword is detected in user message, defaults to bulan berjalan (`startOfMonth()` → `today`). Prevents unbounded lifetime queries on manual input. Applies to `sales_overview`, `product_insights`, `customer_insights` only.
- **AI Insights Today uses `today → today` filter.** `getDailyInsights()` uses `today` period for Pendapatan and Produk Terlaris cards (not `startOfMonth()`). Pelanggan card uses lifetime accumulation. Kondisi Stok uses snapshot (no date filter).

## Known Constraints

- Do NOT assume shift_id is always present on transactions — Phase 1 allows null.
- Do NOT modify stock directly on product edit — stock changes only through restock, adjustment, PO receiving, transactions, and returns.
- Do NOT create refund transactions for customer returns — returns are stock-only.
- Do NOT use free-text status descriptions. Use only: PLANNED, IN_PROGRESS, BACKEND_COMPLETE, FRONTEND_COMPLETE, QA_TESTING, PRODUCTION_READY, CLOSED.
- AI Assistant requires DEEPSEEK_API_KEY in .env for full functionality. Without it, the system operates in fallback (offline) mode with template-based responses.
- AI `extractFilters()` fallback default periode applies to `sales_overview`, `product_insights`, `customer_insights` — NOT to `product_condition` (which does not use date filters).
- Quick Action cards always send explicit period keywords and are NOT affected by the `extractFilters()` fallback.

## Recent Changes

- **Sprint 12.7** — Product Insights Top 5 ranking, Product Condition Restock Priority, Collapsible Quick Actions, intent-specific prompt instruction for `product_insights`. Manual UI verification completed. (2026-06-22)
- **Sprint 12.6** — Bug fixes: pattern mismatch `product_insights` (7 new patterns), Insight Hari Ini periode fix (`today` instead of `startOfMonth()`), fallback default periode in `extractFilters()`. (2026-06-21)
- **Sprint 12.5 Follow-up** — Edge case "produk baru" netral note, pattern count verification, historical data verification for retired `recent_activity` skill. (2026-06-21)
- **Sprint 12.5** — Product Condition skill, UI redesign (badge model, Insights Today panel, Lihat Semua/Bersihkan Riwayat). (2026-06-20)
- **Sprint 12** — AI Assistant Foundation: DeepSeek integration, skill registry, conversation logging, security policy, rate limiting, frontend chat UI, quick actions, insights panel. (2026-06-19)
- **Sprint 11** — Cash Register / Shift Management backend complete. Frontend pending. (2026-06-16)
- **Sprint 10** — Customer Return module, inventory log integration, profit/margin fixes. (2026-06-15)
- **Sprint 9** — Reports & Analytics (revenue, profit, margin, product/customer analytics). (2026-06-13)

Full history: SPRINT_HISTORY.md
