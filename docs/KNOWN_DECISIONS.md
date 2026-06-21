# SwiftPOS Known Decisions

Architectural decisions confirmed in code. Status values: Verified / Unverified / Partially Implemented.

---

#### Inventory Costing — Average Cost

**Current implementation:** `products.unit_cost` (`decimal(15,2)`) stores the current average cost per unit. When stock is received via Purchase Order, the new average cost is calculated from (existing*stock * existing*cost + received_qty * received_cost) / total_stock. Confirmed in `app/Http/Controllers/Api/PurchaseOrderController.php`.

**Status:** Verified

**Rationale:** Avoids per-batch cost tracking complexity. Suitable for small to medium retail operations.

---

#### Customer Returns — Stock Only, No Cash Refund

**Current implementation:** Customer returns restore product stock via InventoryLog (type: 'customer_return') and create SalesReturn/SalesReturnItem records. They do NOT create a refund transaction, modify cash balance, or generate a negative sale. Confirmed in `app/Http/Controllers/Api/SalesReturnController.php`, `app/Models/SalesReturn.php`, and the SalesReturn migration.

**Status:** Verified

**Rationale:** Cash refunds are handled outside the system. The return module tracks inventory restoration only.

---

#### Cash Register — Phase 1 Design (Optional Shift)

**Current implementation:** `transactions.shift_id` is nullable (`nullable()->constrained('cash_register_shifts')->nullOnDelete()`). `TransactionController@store` (line 179-183) resolves the user's current open shift and assigns `shift_id` via `$shift?->id` — if no open shift exists, `shift_id` remains null. No middleware enforces shift presence; the nullable design allows transactions without a shift. Shift validation is explicitly deferred to Phase 2.

**Status:** Verified (confirmed in `app/Http/Controllers/Api/TransactionController.php` lines 179-190)

**Rationale:** Non-breaking rollout. Existing POS flow continues to work without an open shift even though the backend will link shifts when they exist.

---

#### Money Precision — Decimal(15,0) for Cash Shifts, Decimal(15,2) Elsewhere

**Current implementation:** All product/transaction money columns use `decimal(15,2)`. However, `cash_register_shifts` uses `decimal(15,0)` for `opening_cash`, `closing_cash_expected`, `closing_cash_actual`, and `cash_difference`. The `opening_cash` parameter is cast to `(int)` in the controller. The model casts these fields to `integer`.

**Status:** Verified (confirmed in shift migration and ShiftController)

**Rationale:** Original doc claim of `decimal(15,0)` was correct for shifts, but `decimal(15,2)` is used everywhere else. This is a notable inconsistency: shift money is integer-based while all other money columns support 2 decimal places.

---

#### Shift Number Format

**Current implementation:** SFT-YYYYMMDD-NNNN. Sequence resets daily. Uses pessimistic locking (`lockForUpdate()`) for concurrency safety. Confirmed in `app/Services/ShiftService.php`.

**Status:** Verified

**Rationale:** Human-readable, date-sortable, collision-proof for daily operations.

---

#### RBAC — Spatie Laravel Permission

**Current implementation:** Uses `spatie/laravel-permission` ^8.0. Dashboard reports are guarded with `can:view dashboard` and `can:view reports` middleware. Confirmed in `routes/api.php` and `composer.json`.

**Status:** Verified

**Rationale:** Standard Laravel permission package. Enables role-based access controls.

---

#### Audit Trail — Spatie Activitylog

**Current implementation:** Uses `spatie/laravel-activitylog` ^5.0 plus a custom `activity_logs` table. Custom ActivityLogService provides structured logging with module/action/subject. Confirmed in `app/Services/ActivityLogService.php` (referenced in ShiftService) and `routes/api.php` (`GET /api/activity-logs`).

**Status:** Verified

**Rationale:** Dual approach: Spatie for model-level logging, custom service for business event logging.

---

#### Inventory Logs Type Enum

**Current implementation:** `inventory_logs.type` is an enum with values: `restock`, `sale`, `adjustment`, `return`, `customer_return`, `stock_opname`. The `customer_return` and `stock_opname` values were added via separate migrations (confirmed in migration files `2026_06_15_093000_add_customer_return_to_inventory_logs_type_enum.php` and `2026_06_08_000001_add_stock_opname_to_inventory_logs_type_enum.php`).

**Status:** Verified

**Rationale:** Enum provides strict type safety for inventory movement tracking.

---

#### Single-Store Architecture

**Current implementation:** All tables have `store_id`. The `stores` table exists and is referenced. No multi-store routing or store selection UI exists. `StoreController` provides get/update profile only.

**Status:** Verified

**Rationale:** Current design assumes single store. Multi-store would require store_id scoping on all queries and a store selection mechanism.

---

#### AI Assistant — Fallback Default Periode

**Current implementation:** `extractFilters()` in `AiService.php` (line 313-316) applies a default fallback of bulan berjalan (`startOfMonth()` s/d `today`) when no date keyword is detected in the user's message. This ensures manual input like "ringkasan penjualan" without explicit period keywords returns current month data rather than unbounded (lifetime) results. Applies to `sales_overview`, `product_insights`, and `customer_insights` skills. Does NOT apply to `product_condition` (which does not use `extractFilters()`). Quick Action cards are unaffected (all send explicit period keywords).

**Status:** Verified (confirmed in `app/Services/AiService.php` lines 309-316)

**Rationale:** Prevents misleading unbounded queries when users type manually without period keywords. Defaulting to current month is the safest assumption for a retail POS context.

---

#### AI Assistant — Product Insights Top 5 Ranking

**Current implementation:** `product_insights` context builder in `config/ai-skills.php` returns a `top_5` field containing the 5 best-selling products (by quantity sold) for the queried period. Each product includes: name, SKU, units_sold, revenue, profit. The `buildPrompt()` method in `AiService.php` includes an intent-specific instruction for `product_insights` that explicitly tells DeepSeek to render all 5 products as a numbered list.

**Status:** Verified (confirmed in `config/ai-skills.php` lines 197-198, `app/Services/AiService.php` lines 378-384)

**Rationale:** Single best-seller does not provide sufficient business insight. Top 5 gives store owners a more complete picture of product performance.

---

#### AI Assistant — Estimasi Hari Habis (Deferred)

**Current implementation:** Not implemented. The `product_condition` skill does NOT include any "estimated days until empty" or predictive stock depletion logic.

**Status:** Deferred

**Rationale:** Requires a predictive model and risks producing inaccurate estimates for new products or irregular sales patterns. Will be reconsidered when sales velocity data is more mature.
