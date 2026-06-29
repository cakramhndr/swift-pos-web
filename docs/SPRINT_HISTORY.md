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

Status: PRODUCTION_READY

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

## Sprint 11.1 — Cash Register Frontend Audit

Status: COMPLETED

- Full codebase audit of Cash Register functionality
- Backend implementation verified: models, services, controllers, migrations, routes
- Transaction integration verified: shift_id auto-assignment, non-blocking behavior confirmed
- Frontend gap analysis: 0% complete, no existing UI components
- Route security audit: auth:sanctum only, no permission middleware
- MVP completion plan documented
- Sprint dependency analysis: no hard blockers on AI or Dashboard sprints

## Sprint 11.2 — Cash Register Frontend (Open Shift + Authorization)

Status: PRODUCTION_READY

### Backend Authorization

- `manage shifts` permission added to RolePermissionSeeder (idempotent)
- Assigned to Owner, Admin, Kasir roles
- Gudang and Accounting excluded
- All 4 shift routes protected with `->middleware('can:manage shifts')`

### Frontend

- `src/api/shifts.js` — API module with openShift, getCurrentShift, closeShift, getShiftHistory
- `src/hooks/useShifts.js` — Shift state management hook
- `src/pages/CashRegister.jsx` — Cash Register page with active/inactive shift states
- `src/components/shifts/OpenShiftModal.jsx` — Open shift modal with opening cash input
- `src/components/shifts/ShiftStatusCard.jsx` — Read-only shift status display
- Route added: `/cash-register`
- Sidebar navigation with permission gating (manage shifts)
- Transactions.jsx integration: warning banner, shift indicator (additive only, no refactor)

### Bug Fixes

- Authentication: sidebar user display was hardcoded — fixed to use AuthContext
- Logout: button had no onClick handler — fixed
- Kasir Products 403: added `view products` permission, updated ProductPolicy
- Login error toast: Toaster moved to root level (was inside protected layout)

## Sprint 11.2.1 — Shift Summary API Enhancement

Status: PRODUCTION_READY

- Extracted `ShiftService::getShiftCashSummary(CashRegisterShift $shift): array` as single source of truth
- Formula: `opening_cash + SUM(completed cash transactions)` — identical to closeShift()
- Refactored `closeShift()` to delegate to `getShiftCashSummary()`
- Enriched `GET /api/shifts/current` response with:
  - `cash_total` — sum of completed cash transactions
  - `transaction_count` — count of completed cash transactions
  - `closing_cash_expected` — opening_cash + cash_total
- No new routes, endpoints, permissions, or database changes
- Zero-transaction shift returns `cash_total: 0, transaction_count: 0, closing_cash_expected: opening_cash`

## Sprint 11.3 — Close Shift UI

Status: PRODUCTION_READY

- `src/components/shifts/CloseShiftModal.jsx` — Close shift modal with:
  - Read-only summary: Kas Awal, Total Transaksi Cash, Total Cash Masuk, Kas Diharapkan
  - Kas Aktual input (required, numeric, min:0)
  - Selisih preview (display only, realtime, green/red color rules)
  - Catatan field (optional, max 1000 chars)
- CashRegister.jsx: "Tutup Shift" button enabled, integrated with CloseShiftModal
- After close: toast → fetchCurrentShift() → currentShift = null → empty state renders
- No backend changes, no new routes, no new permissions

## Sprint 11.3.1 — Close Shift Refresh Hotfix

Status: PRODUCTION_READY

- Root cause: `onSubmitCloseShift` was calling `handleCloseShift()` a second time after CloseShiftModal already closed the shift
- Fix: `onSubmitCloseShift` now only shows toast + calls `fetchCurrentShift()` — no duplicate API call
- Cash Register immediately returns to "Belum ada shift aktif" state after successful close
- No page reload required

## Sprint 11.3.2 — Close Shift Confirmation Dialog

Status: PRODUCTION_READY

- Added confirmation step before executing close shift
- Confirmation dialog displays: Kas Diharapkan, Kas Aktual, Selisih
- "Batal" returns to form, "Ya, Tutup Shift" executes single POST /api/shifts/close
- Follows existing project confirmation dialog pattern (Products delete confirm)
- No duplicate API calls, existing validation and error handling preserved

## Sprint 11.3.3 — ESC Key Support

Status: PRODUCTION_READY

- ESC closes confirmation dialog (returns to form)
- ESC closes parent modal when confirmation is not open
- ESC disabled during submission (loading state)
- Event listener properly cleaned up on unmount
- No memory leaks, no duplicate listeners

## Sprint 12 — AI Assistant Foundation

Status: PRODUCTION_READY

- `ai_conversations` table (migration completed)
- `AiConversation` model with store/user relationships
- Config-driven skill registry (`config/ai-skills.php`) with 4 skills: Sales Overview, Product Insights, Customer Insights, Product Condition
- `AiService` with full pipeline: rate limiting → security policy → intent detection → data retrieval → DeepSeek summarization → conversation logging
- `AiController` with 4 endpoints: `POST /api/ai/chat`, `GET /api/ai/history`, `GET /api/ai/conversations`, `GET /api/ai/skills`
- DeepSeek API integration (`deepseek-chat` model) with fallback handling
- Security policy enforcement (SQL injection, prompt injection, prohibited topics protection)
- User rate limiting (30 req/min per user)
- AI conversation logging (all conversations stored in ai_conversations table)
- Frontend: AI Assistant page with chat interface, quick actions, conversation history panel
- Frontend: AI Chat Interface with markdown-like rendering, offline mode indicators, rate limit handling
- Frontend: AI Quick Actions (5 preset action cards with gradient icons)
- Frontend: AI Insights Panel (recent conversation history with intent-based icons)
- Sidebar navigation link to AI Assistant
- AI provider config in `config/ai.php` and `.env` (`AI_PROVIDER=deepseek`, `DEEPSEEK_API_KEY`)

## Sprint 12.5 — Product Condition Skill & UI Redesign (Part 1)

Status: PRODUCTION_READY

- New `product_condition` skill (replaces deprecated `recent_activity`): stock status, low stock alerts, dead stock detection, new products
- `recent_activity` key permanently retired from skill registry — must NOT be reused
- Config-driven pattern registry expanded with ~14-15 patterns for stock/condition queries
- AI Quick Actions updated from 4 to 5 cards: added "Kondisi Stok"
- AI Assistant page: badge model for intent labels, status badges
- AI Insights Today panel (`GET /api/ai/insights-today`): 4 snapshot cards (Pendapatan, Kondisi Stok, Produk Terlaris, Pelanggan)
- AI Insights Today: "Lihat Semua" button to expand/collapse, "Bersihkan Riwayat" button to delete conversation history
- Insights Today uses 20-min cache (`ai_daily_insights_store_{id}`)

## Sprint 12.5 Follow-up — Edge Case & Hardening

Status: PRODUCTION_READY

- Edge case "produk baru": jika semua produk terdeteksi baru (window 30 hari), tampilkan catatan netral (`new_products_note`) alih-alih klaim menyesatkan
- Pattern `low stock`/`status stok` dikonfirmasi terdaftar di skill `product_condition` (total 11 pattern Bahasa Indonesia + 4 English = 15)
- Verifikasi data historis: tidak ada baris `ai_conversations` yang mereferensikan skill lama `recent_activity` yang terdampak

## Sprint 12.6 Bug Fixes — Pattern Mismatch, Periode Insight, Fallback Default

Status: PRODUCTION_READY

- **Regression Fix — Pattern Mismatch `product_insights`**:
  - Root cause: Quick Action card "Insight Produk" mengirim pesan persis yang ternyata tidak terdaftar di pattern `product_insights`
  - Fix: ditambahkan 7 pattern variant baru (`'produk apa yang paling laris'`, `'paling laris'`, `'top selling'`, dll) ke `product_insights`
- **Fix Periode "Insight Hari Ini"**:
  - Root cause: `getDailyInsights()` di `AiService.php` menggunakan filter `startOfMonth()` alih-alih hari ini
  - Fix: filter Pendapatan dan Produk Terlaris diubah ke `today → today`; Pelanggan diubah ke tanpa filter (akumulasi); Kondisi Stok tidak terdampak (sudah snapshot)
  - Label card diperbarui: "Pendapatan Hari Ini", "Produk Terlaris Hari Ini"
- **Fallback Default Periode (`extractFilters()`)**:
  - Root cause: input manual tanpa kata kunci periode (mis. "ringkasan penjualan") menghasilkan query tanpa batas tanggal
  - Fix: fallback di akhir `extractFilters()` — jika `$filters` kosong setelah semua keyword dicek, default ke bulan berjalan (`startOfMonth()` s/d hari ini)
  - Berlaku untuk SEMUA skill yang memakai `extractFilters()` (`sales_overview`, `product_insights`, `customer_insights`)
  - Quick Action card TIDAK terdampak (semua sudah kirim kata kunci eksplisit)

## Sprint 11.7 — Open Shift Monitoring Dashboard

Status: PRODUCTION_READY

- **New endpoint `GET /api/shifts/open`**: returns all currently OPEN shifts for the authenticated user's store
  - Includes: id, shift_number, opened_at, opening_cash, status, duration_minutes, user (id, name), store (id, name)
  - Duration calculated in backend using Carbon (diffInMinutes), not SQL
  - Protected with `->middleware('can:manage shifts')`
- **Frontend API helper**: `getOpenShifts()` in `src/api/shifts.js`
- **useShifts hook**: Added `openShifts`, `openShiftsLoading`, `fetchOpenShifts` state and method
- **Monitoring widget** in CashRegister.jsx (above tabs):
  - Header: "Cash Register Masih Aktif (N)" with count badge
  - Card grid (1/2/3 columns responsive) showing each open shift:
    - Cashier name, shift number, duration badge (green/yellow/red rules)
    - Store name, opened datetime
    - "Lihat Detail" button
  - Empty state: "Tidak ada Cash Register yang masih aktif." with green checkmark
- **Duration badge color rules**:
  - 0-8 hours: green (emerald)
  - 8-12 hours: yellow (amber)
  - > 12 hours: red
- **Navigation**: "Lihat Detail" opens existing `ShiftDetailModal` component — no new detail component created
- **Performance**: Open shifts fetched once on page load + after Open Shift + after Close Shift (reuses existing refresh flow)
- **Constraints respected**:
  - NO changes to closing cash calculation
  - NO changes to ShiftService business logic
  - NO changes to permissions
  - NO changes to history table
  - NO changes to existing UI flow
  - Only additive changes (new endpoint + widget)

### Regression Verification

- Open Shift still works ✓
- Close Shift still works ✓
- History unchanged ✓
- Detail modal reused, unchanged ✓
- Current Shift unchanged ✓
- Permissions unchanged ✓
- Mobile layout responsive (grid collapses to single column) ✓
- No duplicate API requests ✓

## Sprint 11.8 — Open Shift Monitoring Tab

Status: PRODUCTION_READY

### Objective

Refactor the Open Shift Monitoring widget from Sprint 11.7 into a dedicated tab inside the Cash Register page.

### Changes

- **Removed monitoring widget** from above the tabs (UI section only — API, hook, fetch logic, and detail modal integration preserved)
- **Added new "Open Shift" tab** (`ShieldCheck` icon) to the tab bar, rendered alongside "Shift Aktif" and "Riwayat Shift"
- **Open Shift tab content** renders the same monitoring dashboard previously shown as a widget:
  - Header: "Cash Register Masih Aktif (N)"
  - Responsive card grid (1/2/3 columns) with each card showing:
    - Cashier name, shift number
    - Duration badge (green/yellow/red rules)
    - Status badge (OPEN)
    - Store name, opening time, opening cash
    - "Lihat Detail" button
  - Empty state: green checkmark + "Tidak ada Cash Register yang masih aktif."
- **Sorting**: Shifts sorted by longest duration first (descending). Done in frontend via `useMemo` — no backend query change.
- **Performance**: No duplicate API requests. Open shift data fetched once on mount + after Open/Close shift. Tab switching does NOT trigger re-fetch (uses cached hook state).
- **Detail modal**: "Lihat Detail" continues using existing `ShiftDetailModal` — no duplicate component.

### Constraints Respected

- NO modifications to backend calculation
- NO changes to ShiftService
- NO changes to cash summary
- NO changes to permissions
- NO changes to history table
- NO changes to active shift workflow
- No duplicate components or APIs
- Only UI relocation

### Regression Verification

- Shift Aktif still works ✓
- Riwayat Shift unchanged ✓
- Open Shift tab displays all active shifts ✓
- Detail modal still opens ✓
- Duration badge colors unchanged ✓
- Refresh still works (after Open/Close shift) ✓
- Open Shift API unchanged ✓
- No duplicate requests ✓
- Mobile responsive (grid collapses to single column) ✓
- Desktop responsive ✓

## Sprint 11.4.3 — Permission Matrix Alignment & AI Assistant Access

Status: COMPLETED

- Dashboard permission alignment: Kasir, Gudang, and Accounting now have `view dashboard` permission
- Created `use ai assistant` permission via `firstOrCreate()` (idempotent)
- Assigned `use ai assistant` to Owner, Admin, Accounting only (not Kasir or Gudang)
- Backend middleware: all 7 AI Assistant routes protected with `->middleware('can:use ai assistant')`
- Frontend sidebar: added `permission: "use ai assistant"` to AI Assistant nav item in `systemNav`
- Created `visibleSystemNav` filtering for permission-based sidebar hiding
- Created `docs/PERMISSION_MATRIX.md` with full module/role matrix
- No duplicate permissions created
- All seeder operations via `firstOrCreate()` for idempotency

## Sprint 11.4.4 — Frontend Route Protection & Shift Permission Guard

Status: COMPLETED

- Created `src/components/RequirePermission.jsx` — reusable route-level permission guard
- Protected `/cash-register` route with `RequirePermission permission="manage shifts"`
- Protected `/ai-assistant` route with `RequirePermission permission="use ai assistant"`
- Transactions page: shift warning banner and shift indicator now hidden when user lacks `manage shifts`
- Cash Register page: History tab, Buka Shift button, and Tutup Shift card now hidden when user lacks `manage shifts`
- No backend changes, no permission changes, no database changes
- Reuses existing `useAuth` context — no duplicate guard systems
- Build verified with zero errors

## Hotfix 11.8.1 — Prevent Logout While Shift Is Open & Resume Existing Shift

Status: PRODUCTION_READY

### Objective

Enforce the Cash Register business rule: a user MUST NOT be able to logout while their own Cash Register shift is still OPEN. Closing the browser, refreshing the page, or losing internet connection MUST NOT close the shift. The shift remains OPEN until the user explicitly performs Close Shift.

### Backend Logout Guard

- **File**: `app/Http/Controllers/Api/AuthController.php`
- Before deleting the Sanctum token, the `logout()` method now checks for an OPEN shift belonging to the authenticated user (`CashRegisterShift::where('user_id', $user->id)->where('status', 'OPEN')->first()`)
- If an OPEN shift is found, logout is BLOCKED with HTTP 409 Conflict:
  ```json
  {
    "success": false,
    "message": "Please close your cash register before logging out.",
    "code": "SHIFT_STILL_OPEN"
  }
  ```
- Sanctum token is NOT invalidated. Session is NOT destroyed. Logout simply fails.
- No changes to ShiftService, cash calculation, permissions, or any other business logic.

### Frontend Logout Handling

- **File**: `src/context/AuthContext.jsx`
  - `logout()` now re-throws the error when `status === 409 && code === "SHIFT_STILL_OPEN"` — preventing the `finally` block from clearing auth state
- **File**: `src/components/layout/AppSidebar.jsx`
  - `handleLogout()` catches the SHIFT_STILL_OPEN error and displays a confirmation dialog
  - Dialog title: "Cash Register Masih Aktif"
  - Dialog message: "Anda masih memiliki Shift yang belum ditutup. Silakan lakukan Close Shift terlebih dahulu sebelum logout."
  - Two buttons:
    - "Batal" — closes the dialog, user stays on current page
    - "Ke Cash Register" — navigates to `/cash-register` so user can close their shift
  - Uses existing `Dialog` component from `@/components/ui/dialog` — no new UI library
  - Does NOT use `alert()`
  - Does NOT clear auth state or redirect on 409

### Resume Existing Shift

- **Verified**: Already works. No changes needed.
- `CashRegister.jsx` calls `fetchCurrentShift()` on mount → `GET /api/shifts/current` → returns the OPEN shift if one exists → "Shift Aktif" is displayed immediately
- No duplicate shift. No additional modal. Reuses existing flow.

### Browser Close / Refresh

- **Verified**: No implementation required.
- Closing the browser, refreshing the page, or losing internet connection does NOT close the shift
- The shift remains OPEN in the database (`status = 'OPEN'`)
- On re-login, the existing shift is resumed automatically (see Resume Existing Shift above)

### Constraints Respected

- NO auto close shift
- NO modifications to ShiftService calculation
- NO modifications to cash summary
- NO scheduled jobs created
- NO websocket or polling
- NO permission system changes
- NO duplicate shift logic
- Only business rule enforcement

### Regression Verification

- Login still works ✓
- Logout works when no active shift ✓
- Logout blocked when shift OPEN ✓
- Sanctum token remains valid after blocked logout ✓
- Browser refresh keeps shift OPEN ✓
- Browser close keeps shift OPEN ✓
- Re-login resumes existing shift ✓
- Open Shift still works ✓
- Close Shift still works ✓
- History unchanged ✓
- Monitoring unchanged ✓
- No duplicate API calls ✓

## Hotfix 11.8.3 — Context-Aware Logout Guard UX

Status: PRODUCTION_READY

### Objective

Improve the logout guard dialog so it behaves intelligently depending on the user's current page. When already on `/cash-register`, the "Ke Cash Register" button does nothing (React Router correctly ignores navigation to the current pathname). Instead of forcing refreshes or remounts, adapt the dialog buttons to the context.

### Changes

**File**: `src/components/layout/AppSidebar.jsx`

- Added `useLocation()` import from `react-router-dom`
- Created `isCashRegisterPage` computed value: `location.pathname === "/cash-register"`
- **Context-aware button rendering**:

| User is on                       | Dialog buttons                 | Behavior                                                            |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| Any page EXCEPT `/cash-register` | `[Batal]` `[Ke Cash Register]` | "Ke Cash Register" navigates to `/cash-register` and closes dialog  |
| `/cash-register`                 | `[OK]`                         | "OK" simply closes the dialog — user is already on the correct page |

- **Improved dialog copy**:
  - Title: "Cash Register Masih Aktif"
  - Body: "Anda masih memiliki Shift yang belum ditutup.\n\nUntuk menjaga konsistensi transaksi dan saldo kas, silakan lakukan Close Shift terlebih dahulu sebelum Logout."
- Extracted `handleNavigateToCashRegister` and `handleDismissLogoutError` as named functions (previously inline)
- No changes to warning icon, colors, or styling
- No backend changes, no routing hacks, no page reloads

### Constraints Respected

- NO backend changes
- NO modifications to AuthController
- NO modifications to ShiftService
- NO modifications to logout API
- NO force page reload
- NO `window.location` or `window.location.reload()`
- NO `navigate(0)` or `location.state` refresh hacks
- NO polling or websocket
- Only UX improvement

### Regression Verification

- Logout succeeds after Close Shift ✓
- Logout blocked when OPEN shift exists ✓
- Dashboard → Logout → "Ke Cash Register" navigates correctly ✓
- Products → Logout → "Ke Cash Register" navigates correctly ✓
- Transactions → Logout → "Ke Cash Register" navigates correctly ✓
- Inventory → Logout → "Ke Cash Register" navigates correctly ✓
- Cash Register → Logout shows `[Batal] [OK]` instead of `[Batal] [Ke Cash Register]` ✓
- No React warnings ✓
- No build warnings ✓
- No backend changes ✓

## Hotfix 11.8.2 — Logout Guard Fix

Status: PRODUCTION_READY

### Root Cause

The `logout()` function in `AuthContext.jsx` used a `try/catch/finally` pattern where `finally` unconditionally cleared authentication state (`localStorage.removeItem("token")`, `setUser(null)`).

Even though the `catch` block re-threw the error for SHIFT_STILL_OPEN (HTTP 409), JavaScript's `finally` block executes **before** the re-thrown error propagates up the call stack. This meant:

1. Backend returns HTTP 409 (correct)
2. `catch` detects SHIFT_STILL_OPEN and calls `throw error`
3. `finally` runs immediately — clears token + user
4. Error propagates to AppSidebar — too late, user already logged out

### Fix

**File**: `src/context/AuthContext.jsx`

Removed the unconditional `finally` block. Auth cleanup now occurs in exactly two places:

| Scenario                              | Action                    | Auth cleanup?   |
| ------------------------------------- | ------------------------- | --------------- |
| `logoutApi()` succeeds (2xx)          | Clear token + user        | YES             |
| HTTP 409 + `SHIFT_STILL_OPEN`         | Throw error to AppSidebar | NO — preserved  |
| Unexpected error (401, network, etc.) | Clear token + user        | YES — preserved |

**New control flow:**

```
logoutApi()
    ↓
┌──────────────────┐
│  Success (2xx)   │ → clear auth → return
└──────────────────┘
    ↓ (error)
┌──────────────────────────┐
│  409 + SHIFT_STILL_OPEN  │ → throw (no auth cleanup)
└──────────────────────────┘
    ↓ (other error)
┌──────────────────┐
│  Unexpected       │ → clear auth (preserved behaviour)
└──────────────────┘
```

### Preserved Behaviour

- `fetchUser()` error handling unchanged (clears auth on expired/invalid token)
- Unexpected logout errors (401, network failure) still clear auth — no regression
- `login()` unchanged
- No changes to API contracts, backend, routes, permissions, or dialog UI

### Constraints Respected

- Frontend only — NO backend changes
- NO modifications to AuthController
- NO modifications to routes or permissions
- NO modifications to logout API
- NO modifications to dialog UI
- NO duplicate logout logic

### Regression Verification

- Logout succeeds when no OPEN shift ✓
- Logout blocked when OPEN shift exists ✓
- HTTP 409 keeps auth state (token in localStorage, user object populated) ✓
- ProtectedRoute does NOT redirect on 409 ✓
- Dialog appears correctly with "Cash Register Masih Aktif" ✓
- "Ke Cash Register" navigates to `/cash-register` ✓
- "Batal" closes dialog, user stays on page ✓
- Close Shift still works ✓
- Logout succeeds immediately after Close Shift ✓
- Browser refresh resumes active shift ✓
- Auth data persists after 409 (user, permissions stay populated) ✓
- Build passes with zero errors ✓

## Sprint 12.7 — Product Insights Top 5 & Restock Priority

Status: PRODUCTION_READY

### Features

- **Top 5 Product Ranking**: `product_insights` context builder now returns `top_5` field with 5 best-selling products (name, SKU, units_sold, revenue, profit), not just 1
- **Restock Priority Ranking**: `product_condition` context builder now returns `restock_priority` array — Priority 1 (out of stock, sorted by name) then Priority 2 (low stock, sorted by deficit descending), each with `restock_priority` and `deficit` fields
- **Collapsible Quick Actions**: "Aksi Cepat" section in AI Assistant can be collapsed/expanded by clicking the heading, with chevron indicator and smooth max-height animation. State resets to expanded on page refresh (no persist)

### Bug Found

Product Insights only displayed 1 product in AI response despite `top_5` data being available in context.

### Root Cause

`buildPrompt()` in `AiService.php` used generic instructions for all skills ("Jawab pertanyaan pengguna menggunakan data konteks di atas"). No intent-specific instruction told DeepSeek to render all 5 items from `top_5`.

### Fix

Added intent-specific prompt instruction for `product_insights` in `buildPrompt()`:

- Explicitly instructs DeepSeek to display ALL 5 products as a numbered list (1-5)
- Each product: Name, SKU, Units Sold, Revenue, and Profit
- Only applies to `product_insights` — other skills unchanged

### Verification

Manual UI testing confirmed:

- "Produk apa yang paling laris bulan ini?" → 5 products displayed as numbered list
- "Bagaimana kondisi produk saya saat ini?" → Restock priority order displayed correctly
- "Aksi Cepat" collapse/expand works with smooth animation
- Other skills (sales_overview, customer_insights) unaffected
