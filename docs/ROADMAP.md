# SwiftPOS Roadmap

Last Updated: 2026-06-22

---

# Phase 1 — Foundation

Status: PRODUCTION_READY

- [x] Laravel API
- [x] React + Vite Frontend
- [x] Authentication
- [x] Store Management
- [x] Dashboard Layout

# Phase 2 — Master Data

Status: PRODUCTION_READY

## Products

- [x] Product Management
- [x] Product Images
- [x] Product Variants
- [x] Product Detail Page

## Categories

- [x] Category Management

## Customers

- [x] Customer Management
- [x] Quick Add Customer

## Suppliers

- [x] Supplier Management

# Phase 3 — POS

Status: PRODUCTION_READY

- [x] Cart
- [x] Checkout
- [x] Transaction History
- [x] Invoice Generation
- [x] Stock Validation
- [x] Out of Stock Protection

# Phase 4 — Inventory

Status: PRODUCTION_READY

- [x] Inventory Dashboard
- [x] Restock
- [x] Adjustment
- [x] Inventory Logs
- [x] Stock Opname
- [x] Low Stock Monitoring

## Inventory Protection

- [x] Product Edit cannot modify stock
- [x] Stock changes only through:
  - Inventory Restock
  - Inventory Adjustment
  - Purchase Order Receiving
  - Transactions

# Phase 5 — Procurement

Status: PRODUCTION_READY

## Purchase Orders

- [x] Create PO
- [x] Edit PO
- [x] PO Detail
- [x] PDF Download

## Receiving

- [x] Partial Receiving
- [x] Full Receiving

## Cancellation

- [x] Cancel Purchase Order
- [x] Cancel Validation
- [x] Cancel Activity Log
- [x] Cancelled PO Receive Protection

# Phase 6 — Costing

Status: PRODUCTION_READY

- [x] Average Cost Recalculation
- [x] Inventory Valuation

# Phase 7 — Reports

Status: PRODUCTION_READY

- [x] Revenue Reports
- [x] Profit Reports
- [x] Margin Reports
- [x] Product Analytics
- [x] Customer Analytics
- [x] Inventory Valuation Reports

# Phase 8 — Audit Trail

Status: PRODUCTION_READY

- [x] Activity Logs
- [x] Inventory Logs
- [x] Product Stock History
- [x] Purchase History
- [x] Sales History

# Phase 9 — Cash Register / Shift Management

Status: PRODUCTION_READY

- [x] `cash_register_shifts` table with shift_number, opening/closing cash, status
- [x] Shift number generation (SFT-YYYYMMDD-NNNN, concurrency-safe)
- [x] Open Shift API (`POST /api/shifts/open`)
- [x] Current Shift API (`GET /api/shifts/current`) — enriched with cash_total, transaction_count, closing_cash_expected
- [x] Close Shift API (`POST /api/shifts/close`)
- [x] Shift History API (`GET /api/shifts/history`)
- [x] Expected cash calculation: opening_cash + SUM(cash transactions)
- [x] Audit trail: SHIFT_OPENED, SHIFT_CLOSED, SHIFT_DIFFERENCE
- [x] `transactions.shift_id` column added (nullable, Phase 1 — auto-populated by TransactionController@store when an open shift exists)
- [x] `manage shifts` permission with RBAC (Owner, Admin, Kasir)
- [x] `view products` permission for Kasir POS access
- [x] Frontend Cash Register page with Open Shift modal
- [x] Frontend Close Shift modal with expected cash preview, actual cash input, difference preview, notes
- [x] Frontend Close Shift confirmation dialog
- [x] Frontend ESC key support for modal dismissal
- [x] POS checkout UI: shift indicator and warning banner in Transactions page
- [ ] Shift History table (Sprint 11.4)
- [ ] Mandatory shift validation (Phase 2 — require open shift before allowing POS transactions)

---

# Phase 10 — AI Assistant Foundation

Status: PRODUCTION_READY

- [x] `ai_conversations` table (migration completed)
- [x] `AiConversation` model with store/user relationships
- [x] Config-driven skill registry (`config/ai-skills.php`) with 4 skills: `sales_overview`, `product_insights`, `customer_insights`, `product_condition`
- [x] `AiService` with full pipeline (rate limiting → security policy → intent detection → data retrieval → DeepSeek summarization → conversation logging)
- [x] `AiController` with 6 endpoints (chat, history, conversations, delete conversations, skills, insights-today)
- [x] DeepSeek API integration (`deepseek-chat` model) with fallback handling
- [x] Security policy enforcement (SQL injection, prompt injection, prohibited topics)
- [x] User rate limiting (30 req/min per user)
- [x] AI conversation logging
- [x] Frontend: AI Assistant page with chat interface, quick actions, conversation history panel
- [x] Frontend: AI Chat Interface with markdown-like rendering, offline mode indicators, rate limit handling
- [x] Frontend: AI Quick Actions (5 preset action cards with gradient icons)
- [x] Frontend: AI Insights Panel (recent conversation history with intent-based icons)
- [x] Frontend: AI Insights Today panel (4 snapshot cards)
- [x] Frontend: "Lihat Semua" / "Bersihkan Riwayat" buttons
- [x] Sidebar navigation link to AI Assistant
- [x] `product_condition` skill replacing deprecated `recent_activity`
- [x] `extractFilters()` fallback default periode (bulan berjalan)
- [x] Edge case "produk baru" netral note
- [x] Pattern mismatch fix: 7 new patterns to `product_insights`
- [x] Insight Hari Ini periode fix: `today` instead of `startOfMonth()`

# Sprint 12.7 — Product Insights Top 5 & Restock Priority

Status: COMPLETED

- [x] Product Insights Top 5 ranking (top_5 field in context builder)
- [x] Product Condition Restock Priority (restock_priority array with priority 1/2)
- [x] Collapsible Quick Actions (click heading to collapse/expand)
- [x] Intent-specific prompt instruction for product_insights (render all 5 products)
- [x] Manual UI verification completed

# Sprint 12.8 — AI Assistant RBAC Protection

Status: PLANNED

# Current Priorities

## High Priority

- [ ] Sprint 11.4 — Shift History (list, detail, date filters)
- [ ] Sprint 12.8 — AI Assistant RBAC Protection
- [ ] Print PO using generated PDF (replace window.print)
- [ ] Export Activity Logs
- [ ] Export Inventory Logs
- [ ] Supplier Delete Protection

## Medium Priority

- [ ] Roles & Permissions UI
  - [ ] Admin
  - [ ] Manager
  - [ ] Cashier
  - [ ] Purchasing
  - [ ] Inventory
- [ ] Dashboard Improvements
- [ ] Average Cost Recalculation fix

## Future

- [ ] Multi Store
- [ ] Warehouse Transfers
- [ ] Multi Warehouse
- [ ] Marketplace Integration
- [ ] Accounting Module
