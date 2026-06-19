# SwiftPOS Roadmap

Last Updated: 2026-06-19

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

Backend: BACKEND_COMPLETE
Frontend: IN_PROGRESS

- [x] `cash_register_shifts` table with shift_number, opening/closing cash, status
- [x] Shift number generation (SFT-YYYYMMDD-NNNN, concurrency-safe)
- [x] Open Shift API (`POST /api/shifts/open`)
- [x] Current Shift API (`GET /api/shifts/current`)
- [x] Close Shift API (`POST /api/shifts/close`)
- [x] Shift History API (`GET /api/shifts/history`)
- [x] Expected cash calculation: opening_cash + SUM(cash transactions)
- [x] Audit trail: SHIFT_OPENED, SHIFT_CLOSED, SHIFT_DIFFERENCE
- [x] `transactions.shift_id` column added (nullable, Phase 1 — auto-populated by TransactionController@store when an open shift exists)
- [ ] Frontend Cash Register page with shift management UI (open/close modals, shift history table)
- [ ] POS checkout UI: display active shift to cashier, block/warn when no shift is open
- [ ] Mandatory shift validation (Phase 2 — require open shift before allowing POS transactions)

---

# Current Priorities

## High Priority

- [ ] Cash Register Frontend UI
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
