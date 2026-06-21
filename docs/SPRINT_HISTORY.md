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
