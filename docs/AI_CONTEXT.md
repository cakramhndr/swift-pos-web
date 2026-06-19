# SwiftPOS — AI Context

Read this file first before making any changes. For more detail, see PROJECT_STATUS.md.

## Project Summary

SwiftPOS is a web-based Point of Sale system for small to medium retail businesses. Built with Laravel 12 + React 19, it handles sales, inventory, procurement, customer returns, and cash register shift management.

## Current Version

v1.0 Beta

## Current Sprint

Sprint 11 — Cash Register / Shift Management
Backend: BACKEND_COMPLETE
Frontend: IN_PROGRESS

## Critical Decisions

- **Customer Returns never modify cash balance.** Returns restore stock only. Cash refunds are handled outside the system.
- **Cash Register Phase 1 uses nullable shift_id.** Transactions can be created without an active shift. Mandatory validation is deferred to Phase 2.
- **Shift money uses decimal(15,0) (integer).** All other money columns use decimal(15,2). This is an intentional inconsistency — do not change without discussion.
- **Inventory Logs type is an enum.** Values: restock, sale, adjustment, return, customer_return, stock_opname. Adding new types requires a migration.
- **Single-store architecture.** All tables have store_id. No multi-store support exists yet.

## Known Constraints

- Do NOT assume shift_id is always present on transactions — Phase 1 allows null.
- Do NOT modify stock directly on product edit — stock changes only through restock, adjustment, PO receiving, transactions, and returns.
- Do NOT create refund transactions for customer returns — returns are stock-only.
- Do NOT use free-text status descriptions. Use only: PLANNED, IN_PROGRESS, BACKEND_COMPLETE, FRONTEND_COMPLETE, QA_TESTING, PRODUCTION_READY, CLOSED.

## Recent Changes

- **Sprint 11** — Cash Register / Shift Management backend complete. Frontend pending. (2026-06-16)
- **Sprint 10** — Customer Return module, inventory log integration, profit/margin fixes. (2026-06-15)
- **Sprint 9** — Reports & Analytics (revenue, profit, margin, product/customer analytics). (2026-06-13)

Full history: SPRINT_HISTORY.md
