# SwiftPOS Sprint History

All completed sprints, oldest to newest. Each sprint's status uses the Sprint Status Convention.

---

## Sprint 8 — Stock Opname & Inventory Logs

Status: PRODUCTION_READY

- Stock Opname module (create, start, complete, cancel)
- Stock Opname items tracking
- Inventory Logs integration with stock opname type
- Inventory Logs page (frontend)
- Product stock history view

## Sprint 9 — Reports & Analytics

Status: PRODUCTION_READY

- Revenue Reports
- Profit Reports
- Margin Reports
- Product Analytics
- Customer Analytics
- Inventory Valuation Reports
- Report access permission guard (`can:view reports`)
- Payment method breakdown reports
- Sales trends reports

## Sprint 10 — Customer Return

Status: PRODUCTION_READY

- Customer Return module (create, list, detail)
- Sales Return items tracking
- Inventory Log integration (customer_return type)
- Return Status tracking on transactions (no_return / partially_returned / fully_returned)
- Profit Calculation Fix
- Margin Calculation Fix
- Asia/Jakarta Timezone Standardization
- Low Stock Widget Fix
- Audit Trail Integration for returns

## Sprint 11 — Cash Register / Shift Management

Backend: BACKEND_COMPLETE
Frontend: IN_PROGRESS

- `cash_register_shifts` table (migration confirmed)
- Shift number format: SFT-YYYYMMDD-NNNN (concurrency-safe, daily reset via pessimistic locking)
- Open Shift API (`POST /api/shifts/open`)
- Current Shift API (`GET /api/shifts/current`)
- Close Shift API (`POST /api/shifts/close`)
- Shift History API (`GET /api/shifts/history`)
- Expected cash calculation: opening_cash + SUM(cash transaction totals)
- Audit trail: SHIFT_OPENED, SHIFT_CLOSED, SHIFT_DIFFERENCE
- `transactions.shift_id` column added (nullable, Phase 1 — auto-populated by TransactionController@store when an open shift exists)
- Customer Returns excluded from cash calculation (stock-only)
- Mandatory shift validation deferred to Phase 2
- Frontend UI not yet implemented (no Cash Register page, no shift modals)
