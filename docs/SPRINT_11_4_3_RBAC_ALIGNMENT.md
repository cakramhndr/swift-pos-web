# Sprint 11.4.3 — Permission Matrix Alignment & AI Assistant Access

## Background

Audit findings from the previous RBAC implementation revealed misaligned permission assignments:

- **Dashboard** route required `view dashboard`, but Kasir and Gudang roles lacked this permission
- **Transactions** worked for Kasir because they had `view transactions`, but the Dashboard showed zero values because the frontend received 403 and fell back to default state
- **AI Assistant** had NO dedicated permission — it was accessible to any authenticated user with no backend or frontend protection
- No permission naming inconsistencies existed (`manage shifts` was consistent across seeder, routes, and sidebar)

Business decision approved:

- Dashboard access: Owner ✅, Admin ✅, Kasir ✅, Gudang ✅, Accounting ✅
- AI Assistant access: Owner ✅, Admin ✅, Accounting ✅, Kasir ❌, Gudang ❌

## Audit Findings

| Check                                 | Finding                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| RolePermissionSeeder.php              | 18 permissions. Kasir & Gudang lacked `view dashboard`. No `use ai assistant` permission existed. |
| AI Assistant routes (api.php:121-128) | 7 routes with NO permission middleware — accessible to any authenticated user.                    |
| AI Assistant sidebar                  | In `systemNav` array with NO `permission` field — visible to everyone.                            |
| AI Assistant page                     | No permission check — reachable by anyone authenticated.                                          |
| Dashboard route (api.php:58)          | Protected by `can:view dashboard` middleware. Already correct.                                    |

## Changes Made

### 1. Dashboard Permission Alignment

**Permission**: `view dashboard`

**Roles updated**:

- Kasir: Added `view dashboard` (previously only had: access pos, view transactions, manage customers, manage shifts, view products)
- Gudang: Added `view dashboard` (previously only had: manage products, manage stock, view inventory logs)
- Accounting: Already had `view dashboard` — no change needed

### 2. AI Assistant Permission System

**Created permission**: `use ai assistant`

Created using `firstOrCreate()` — idempotent, no duplicate entries.

**Assigned to**:

- Owner ✅ (via `Permission::all()`)
- Admin ✅ (explicitly added to `givePermissionTo()` array)
- Accounting ✅ (explicitly added)

**Not assigned to**:

- Kasir ❌
- Gudang ❌

### 3. Backend Middleware Protection

File: `routes/api.php` lines 122-128

All 7 AI Assistant routes now have `->middleware('can:use ai assistant')`:

```
GET    /api/ai/status
POST   /api/ai/chat
GET    /api/ai/history
GET    /api/ai/conversations
DELETE /api/ai/conversations
GET    /api/ai/skills
GET    /api/ai/insights-today
```

Unauthorized roles (Kasir, Gudang) receive **403 Forbidden** with Laravel's default `AuthorizationException` response.

### 4. Frontend Sidebar Protection

File: `src/components/layout/AppSidebar.jsx`

- Added `permission: "use ai assistant"` to the AI Assistant nav item in `systemNav`
- Created `visibleSystemNav` mapping that filters items by `userPermissions` (same pattern used by `mainNav`)
- Sidebar now correctly hides AI Assistant for Kasir/Gudang

Previously only `mainNav` items had permission filtering. The `systemNav` array was rendered directly without any permission check.

### 5. Permission Matrix Documentation

Created `docs/PERMISSION_MATRIX.md` with:

- 19 modules mapped to required permissions
- Complete Owner/Admin/Accounting/Kasir/Gudang matrix
- Enforcement points (backend middleware, frontend guards)
- Idempotency guarantee

## Verification Results

```text
Dashboard:
✅ Owner — via Permission::all()
✅ Admin — explicitly assigned
✅ Kasir — verified in database: has view dashboard
✅ Gudang — verified in database: has view dashboard
✅ Accounting — verified in database: has view dashboard

AI Assistant:
✅ Owner — via Permission::all()
✅ Admin — explicitly assigned
✅ Accounting — verified in database: has use ai assistant
❌ Kasir — verified NOT assigned
❌ Gudang — verified NOT assigned
```

## Files Modified

| File                                                         | Change                                                                                                                             |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `../swift-pos-api/database/seeders/RolePermissionSeeder.php` | Added `use ai assistant` permission. Added `view dashboard` to Kasir and Gudang. Added `use ai assistant` to Admin and Accounting. |
| `../swift-pos-api/routes/api.php`                            | Added `->middleware('can:use ai assistant')` to all 7 AI routes.                                                                   |
| `src/components/layout/AppSidebar.jsx`                       | Added `permission: "use ai assistant"` to AI Assistant nav item. Created `visibleSystemNav` filtering.                             |
| `docs/PERMISSION_MATRIX.md`                                  | Created. Full permission matrix with enforcement points.                                                                           |

## Deployment Notes

1. Run the seeder to apply database changes:
   ```bash
   php artisan db:seed --class=RolePermissionSeeder
   ```
2. The seeder is idempotent — can be re-run safely.
3. No frontend rebuild required for backend middleware changes.
4. Frontend changes require a rebuild (`npm run build`).

## Idempotency

All permission seeding uses `firstOrCreate()` — running the seeder multiple times will not create duplicate entries. The `givePermissionTo()` method is also idempotent (Spatie skips already-assigned permissions).
