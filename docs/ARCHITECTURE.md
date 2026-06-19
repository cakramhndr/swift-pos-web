# SwiftPOS Architecture

## Backend Stack

| Component                        | Version | Notes                       |
| -------------------------------- | ------- | --------------------------- |
| Laravel                          | ^12.0   | Confirmed via composer.json |
| PHP                              | ^8.2    | Confirmed via composer.json |
| MySQL                            | —       | Laragon default             |
| Sanctum                          | ^4.3    | API token auth              |
| Spatie Permission                | ^8.0    | RBAC                        |
| Spatie Activitylog               | ^5.0    | Audit trail                 |
| DomPDF (barryvdh/laravel-dompdf) | ^3.1    | PDF generation              |
| picqer/php-barcode-generator     | ^3.2    | Barcode generation          |

## Frontend Stack

| Component        | Version | Notes                        |
| ---------------- | ------- | ---------------------------- |
| React            | ^19.2.6 | Confirmed via package.json   |
| Vite             | ^8.0.12 | Build tool                   |
| Tailwind CSS     | ^4.3.0  | Styling                      |
| react-router-dom | ^7.15.1 | Routing                      |
| Recharts         | ^3.8.1  | Charts                       |
| jsPDF            | ^4.2.1  | PDF generation (client-side) |
| Axios            | ^1.17.0 | HTTP client                  |
| Sonner           | ^2.0.7  | Toast notifications          |

---

## Core Modules

Only modules with confirmed routes + controllers + models are listed:

| Module           | Routes                                                                                                  | Controller                | Model             | Status           |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------- | ---------------- |
| Auth             | `POST /login`, `POST /logout`, `GET /me`                                                                | AuthController            | User              | PRODUCTION_READY |
| Products         | CRUD at `/api/products`                                                                                 | ProductController         | Product           | PRODUCTION_READY |
| Categories       | CRUD at `/api/categories`                                                                               | CategoryController        | Category          | PRODUCTION_READY |
| Customers        | CRUD at `/api/customers`                                                                                | CustomerController        | Customer          | PRODUCTION_READY |
| Suppliers        | CRUD at `/api/suppliers`                                                                                | SupplierController        | Supplier          | PRODUCTION_READY |
| Transactions     | CRUD at `/api/transactions`                                                                             | TransactionController     | Transaction       | PRODUCTION_READY |
| Dashboard        | `GET /api/dashboard`                                                                                    | DashboardController       | —                 | PRODUCTION_READY |
| Reports          | `GET /api/reports/*`                                                                                    | ReportController          | —                 | PRODUCTION_READY |
| Purchase Orders  | CRUD + receive/cancel/pdf at `/api/purchase-orders/*`                                                   | PurchaseOrderController   | PurchaseOrder     | PRODUCTION_READY |
| Stock Adjustment | `POST /api/stock-adjustments`                                                                           | StockAdjustmentController | —                 | PRODUCTION_READY |
| Stock Opname     | CRUD + start/complete/cancel at `/api/stock-opnames/*`                                                  | StockOpnameController     | StockOpname       | PRODUCTION_READY |
| Inventory Logs   | `GET /api/inventory-logs`                                                                               | InventoryLogController    | InventoryLog      | PRODUCTION_READY |
| Sales Returns    | CRUD at `/api/sales-returns`                                                                            | SalesReturnController     | SalesReturn       | PRODUCTION_READY |
| Store Profile    | `GET/PUT /api/store/profile`                                                                            | StoreController           | Store             | PRODUCTION_READY |
| Barcode          | `GET /api/products/{id}/barcode`                                                                        | ProductBarcodeController  | —                 | PRODUCTION_READY |
| Activity Logs    | `GET /api/activity-logs`                                                                                | ActivityLogController     | ActivityLog       | PRODUCTION_READY |
| Shift Management | `POST /api/shifts/open`, `GET /api/shifts/current`, `POST /api/shifts/close`, `GET /api/shifts/history` | ShiftController           | CashRegisterShift | BACKEND_COMPLETE |

---

## Major Table Relationships

| Table                | Relates To                          | Relationship Type    | Key Notes                          |
| -------------------- | ----------------------------------- | -------------------- | ---------------------------------- |
| products             | store_id → stores                   | belongsTo            | Cascade on delete                  |
| products             | category_id → categories            | belongsTo (nullable) | Null on delete                     |
| transactions         | store_id → stores                   | belongsTo            | Cascade on delete                  |
| transactions         | customer_id → customers             | belongsTo (nullable) | Null on delete                     |
| transactions         | user_id → users                     | belongsTo (nullable) | Null on delete                     |
| transactions         | shift_id → cash_register_shifts     | belongsTo (nullable) | Null on delete, Phase 1            |
| transaction_items    | transaction_id → transactions       | belongsTo            | Cascade on delete                  |
| transaction_items    | product_id → products               | belongsTo (nullable) | Null on delete                     |
| cash_register_shifts | store_id → stores                   | belongsTo            | Cascade on delete                  |
| cash_register_shifts | user_id → users                     | belongsTo            | Cascade on delete                  |
| cash_register_shifts | → transaction.shift_id              | hasMany              | Via shift_id                       |
| inventory_logs       | store_id → stores                   | belongsTo            | Cascade on delete                  |
| inventory_logs       | product_id → products               | belongsTo (nullable) | Null on delete                     |
| inventory_logs       | user_id → users                     | belongsTo (nullable) | Null on delete                     |
| sales_returns        | store_id → stores                   | belongsTo            | Cascade on delete                  |
| sales_returns        | transaction_id → transactions       | belongsTo            | Parent transaction                 |
| sales_returns        | customer_id → customers             | belongsTo            | —                                  |
| sales_return_items   | sales_return_id → sales_returns     | belongsTo            | Cascade on delete                  |
| sales_return_items   | product_id → products               | belongsTo (nullable) | Null on delete                     |
| purchase_orders      | store_id → stores                   | belongsTo            | Cascade on delete                  |
| purchase_orders      | supplier_id → suppliers             | belongsTo            | —                                  |
| purchase_order_items | purchase_order_id → purchase_orders | belongsTo            | —                                  |
| stock_opnames        | store_id → stores                   | belongsTo            | —                                  |
| stock_opname_items   | stock_opname_id → stock_opnames     | belongsTo            | —                                  |
| store                | —                                   | singleton            | One store per app (current design) |

---

## Transaction Flow

1. **User adds products to cart** → Frontend (React state)
2. **User completes checkout** → `POST /api/transactions` (TransactionController@store)
   - Validates stock availability
   - Calculates subtotal, discount, total, change
   - Creates Transaction record
   - Creates TransactionItem records (with cost_snapshot)
   - Deducts product stock
   - Creates InventoryLog (type: 'sale')
   - Shift association via shift_id (nullable, Phase 1)
3. **Invoice generated** → Frontend renders receipt from response data

## Inventory Flow

1. **Restock** → `POST /api/stock-adjustments` with type 'restock' → increases stock, creates InventoryLog
2. **Adjustment** → `POST /api/stock-adjustments` with type 'adjustment' → adjusts stock, creates InventoryLog
3. **Purchase Order Receiving** → `POST /api/purchase-orders/{id}/receive` (PurchaseOrderController@receive) → increases stock, creates InventoryLog
4. **Sale** → `POST /api/transactions` (TransactionController@store) → decreases stock, creates InventoryLog (type: 'sale')
5. **Customer Return** → `POST /api/sales-returns` (SalesReturnController@store) → increases stock, creates InventoryLog (type: 'customer_return')

## Return Flow

1. **Customer returns items** → `POST /api/sales-returns` (SalesReturnController@store)
   - Validates original transaction exists
   - Validates return quantity doesn't exceed original quantity
   - Creates SalesReturn and SalesReturnItem records
   - Restores product stock
   - Creates InventoryLog (type: 'customer_return')
   - Does NOT modify cash balance or create refund transaction
2. **Return status** tracked on Transaction via `return_status` and `return_total` accessors

## Cash Register Flow (Sprint 11 — Backend Only)

1. **Open Shift** → `POST /api/shifts/open` (ShiftController@open via ShiftService@openShift)
   - Validates no existing OPEN shift for this user
   - Generates shift number (SFT-YYYYMMDD-NNNN, concurrency-safe)
   - Creates CashRegisterShift with status OPEN
   - Logs SHIFT_OPENED audit event
2. **POS Transaction** → shift_id saved if active shift exists (nullable, Phase 1)
3. **Close Shift** → `POST /api/shifts/close` (ShiftController@close via ShiftService@closeShift)
   - Calculates expected cash: opening_cash + SUM of completed cash transactions
   - Calculates cash difference: actual - expected
   - Updates shift with closing data, sets status CLOSED
   - Logs SHIFT_CLOSED and SHIFT_DIFFERENCE (if non-zero) audit events

---

## Key Files Reference

| Purpose                  | Path                                                                           | Lines |
| ------------------------ | ------------------------------------------------------------------------------ | ----- |
| API Routes               | `routes/api.php`                                                               | 1-124 |
| Shift Service            | `app/Services/ShiftService.php`                                                | 1-220 |
| Shift Controller         | `app/Http/Controllers/Api/ShiftController.php`                                 | 1-152 |
| CashRegisterShift Model  | `app/Models/CashRegisterShift.php`                                             | 1-51  |
| Transaction Model        | `app/Models/Transaction.php`                                                   | 1-78  |
| Shift Migration          | `database/migrations/2026_06_16_045400_create_cash_register_shifts_table.php`  | 1-36  |
| Shift ID on Transactions | `database/migrations/2026_06_16_045500_add_shift_id_to_transactions_table.php` | 1-27  |
| Web Routes               | `src/App.jsx`                                                                  | 1-91  |
