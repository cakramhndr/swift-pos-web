For quick context, read AI_CONTEXT.md first.

# SwiftPOS

## Project Information

**Version:** v1.0 Beta

### Frontend

- React 19
- Vite 8
- Tailwind CSS 4
- react-router-dom v7
- Recharts (charts)
- jsPDF (PDF generation)
- Axios (HTTP client)

### Backend

- Laravel 12
- MySQL
- PHP ^8.2
- Laravel Sanctum (auth)
- Spatie Laravel Permission (RBAC)
- Spatie Laravel Activitylog
- DomPDF (PDF generation)
- picqer/php-barcode-generator

### Current Sprint

**Sprint 11 — Cash Register / Shift Management**
Backend: BACKEND_COMPLETE
Frontend: IN_PROGRESS

### Latest Completed Sprint

**Sprint 10 — Customer Return**
Status: PRODUCTION_READY (verified in code)

---

## Completed Features

### Core System

- Authentication (login/logout/me)
- Dashboard (sales overview, charts, KPIs)
- Branding (store profile/header)
- Audit Trail (activity logs)
- RBAC permissions (via Spatie)

### Master Data

- Products (CRUD, images, barcodes)
- Product Variants
- Categories (CRUD)
- Customers (CRUD, quick add)
- Suppliers (CRUD)

### Inventory

- Inventory Management (restock, adjustment)
- Inventory Logs (with type enum: restock, sale, adjustment, return, customer_return, stock_opname)
- Barcode System (generation, labels)
- Stock Opname (create, start, complete, cancel)

### Procurement

- Purchase Orders (CRUD, cancel, PDF download)
- Receiving Stock (partial/full)
- Cancellation Protection (prevent receive after cancel)

### Sales

- POS Transactions (cart, checkout, invoice, stock validation)
- Out of Stock Protection

### Returns

- Customer Returns (with inventory log integration)
- Return Status tracking (no_return / partially_returned / fully_returned)

### Reporting

- Sales Reports (revenue, trends, payment methods)
- Inventory Reports (valuation, logs)
- Profit & Margin Reports
- Product & Customer Analytics
- Report access guarded by `can:view reports` permission

### Cash Register / Shift Management (Sprint 11 — Backend)

- `cash_register_shifts` table (migration confirmed)
- Shift number format: SFT-YYYYMMDD-NNNN (concurrency-safe, daily reset)
- Open/Close/Current/History API endpoints
- Expected cash calculation: opening_cash + SUM(cash transaction totals)
- Audit trail: SHIFT_OPENED, SHIFT_CLOSED, SHIFT_DIFFERENCE
- `transactions.shift_id` (nullable, Phase 1 — auto-populated by TransactionController@store when an open shift exists)
- Customer Returns excluded from cash calculation

## Production Ready Features [UNVERIFIED]

The following features are claimed Production Ready but have not been fully verified against all edge cases. Listed as reported:

- Authentication
- Dashboard
- Products
- Categories
- Customers
- Suppliers
- Inventory
- Purchase Orders
- Stock Opname
- Barcode System
- POS Transactions
- Customer Returns
- Reports
- Branding
- Audit Trail

## Known Issues

### Average Cost Recalculation

Status: PLANNED

Example: Existing stock 7 @ 320,000 + Received 3 @ 500,000 should produce average cost 374,000. Priority backlog item.

### Cash Register Frontend

Status: IN_PROGRESS — Backend is complete, including automatic shift_id assignment on POS transactions (TransactionController@store). Frontend UI (Cash Register page, shift open/close modals) has not been implemented yet.

---

## Roadmap Summary

| Phase   | Focus                                                    | Status                                  |
| ------- | -------------------------------------------------------- | --------------------------------------- |
| Phase 1 | Foundation (Auth, Store, Dashboard)                      | PRODUCTION_READY                        |
| Phase 2 | Master Data (Products, Categories, Customers, Suppliers) | PRODUCTION_READY                        |
| Phase 3 | POS (Cart, Checkout, Invoices)                           | PRODUCTION_READY                        |
| Phase 4 | Inventory (Logs, Stock Opname, Barcodes)                 | PRODUCTION_READY                        |
| Phase 5 | Procurement (POs, Receiving)                             | PRODUCTION_READY                        |
| Phase 6 | Costing (Average Cost, Valuation)                        | PRODUCTION_READY                        |
| Phase 7 | Reports (Revenue, Profit, Analytics)                     | PRODUCTION_READY                        |
| Phase 8 | Audit Trail                                              | PRODUCTION_READY                        |
| Phase 9 | Cash Register / Shift Management                         | BACKEND_COMPLETE, Frontend: IN_PROGRESS |

See ROADMAP.md for full detail.

---

## Next Sprint

Sprint 12 — AI Assistant Foundation / Cash Register Frontend (tentative)

---

## Maintenance Rules

Every time a sprint is completed:

1. Update PROJECT_STATUS.md
2. Update SPRINT_HISTORY.md
3. Update KNOWN_DECISIONS.md if new decisions are made
4. Update ROADMAP.md if priorities change
5. Update AI_CONTEXT.md if Critical Decisions, Known Constraints, or Current Sprint changed

A sprint is NOT considered complete until documentation is updated. Never leave documentation outdated. If a status can't be verified in code, mark it `[UNVERIFIED]` rather than guessing.

### Commit documentation together with feature code

Never commit feature code without updating docs when sprint status changes. Documentation changes are not a separate, later commit — they ship in the same commit as the feature/sprint work they describe.

```
git add .
git commit -m "feat: sprint 11 cash register shift management"
```

If docs and code drift apart by even one sprint, this rule has failed — fix the process, not just the docs, when that happens.
