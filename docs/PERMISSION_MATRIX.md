# Permission Matrix

> **Last updated:** 23 June 2026
>
> This document defines the canonical permission-to-role assignments used by
> SwiftPOS. It was produced by auditing the actual codebase (seeder, routes,
> frontend guards) rather than guessing.

---

## Modules & Permissions

| Module          | Permission(s) Required                                              |
| --------------- | ------------------------------------------------------------------- |
| Dashboard       | `view dashboard`                                                    |
| Products        | `view products` + `manage products`                                 |
| Categories      | `manage categories`                                                 |
| Transactions    | `view transactions`                                                 |
| Customers       | `manage customers`                                                  |
| Cash Register   | `manage shifts` (route + sidebar guard) + `access pos` (POS access) |
| Open Shift      | `manage shifts`                                                     |
| Close Shift     | `manage shifts`                                                     |
| Shift History   | `manage shifts`                                                     |
| Inventory       | `manage stock`                                                      |
| Inventory Logs  | `view inventory logs`                                               |
| Stock Opname    | _(none — accessible to all authenticated users via route)_          |
| Suppliers       | `manage suppliers`                                                  |
| Purchase Orders | `manage purchase orders`                                            |
| Reports         | `view reports`                                                      |
| CRM             | _(none — visible to all)_                                           |
| Activity Logs   | `view activity logs`                                                |
| Settings        | `manage settings`                                                   |
| AI Assistant    | `use ai assistant`                                                  |
| User Management | `manage users`                                                      |
| Billing         | `manage billing`                                                    |

---

## Role → Permission Matrix

| #   | Module          | Owner | Admin | Accounting | Kasir | Gudang |
| --- | --------------- | ----- | ----- | ---------- | ----- | ------ |
| 1   | Dashboard       | ✅    | ✅    | ✅         | ✅    | ✅     |
| 2   | Products        | ✅    | ✅    | ✅         | ✅    | ✅     |
| 3   | Categories      | ✅    | ✅    | ✅         | ❌    | ❌     |
| 4   | Transactions    | ✅    | ✅    | ✅         | ✅    | ❌     |
| 5   | Customers       | ✅    | ✅    | ✅         | ✅    | ❌     |
| 6   | Cash Register   | ✅    | ✅    | ❌         | ✅    | ❌     |
| 7   | Open Shift      | ✅    | ✅    | ❌         | ✅    | ❌     |
| 8   | Close Shift     | ✅    | ✅    | ❌         | ✅    | ❌     |
| 9   | Shift History   | ✅    | ✅    | ❌         | ✅    | ❌     |
| 10  | Inventory       | ✅    | ✅    | ❌         | ❌    | ✅     |
| 11  | Inventory Logs  | ✅    | ✅    | ❌         | ❌    | ✅     |
| 12  | Stock Opname    | ✅    | ✅    | ❌         | ❌    | ✅     |
| 13  | Suppliers       | ✅    | ✅    | ❌         | ❌    | ✅     |
| 14  | Purchase Orders | ✅    | ✅    | ❌         | ❌    | ✅     |
| 15  | Reports         | ✅    | ✅    | ✅         | ❌    | ❌     |
| 16  | CRM             | ✅    | ✅    | ✅         | ❌    | ❌     |
| 17  | Settings        | ✅    | ✅    | ❌         | ❌    | ❌     |
| 18  | Activity Logs   | ✅    | ✅    | ❌         | ❌    | ❌     |
| 19  | AI Assistant    | ✅    | ✅    | ✅         | ❌    | ❌     |
| 20  | User Management | ✅    | ❌    | ❌         | ❌    | ❌     |
| 21  | Billing         | ✅    | ❌    | ❌         | ❌    | ❌     |

---

## Enforcement Points

### Backend (Laravel Policies / Route Middleware)

| Module           | Middleware             | File                     |
| ---------------- | ---------------------- | ------------------------ |
| Dashboard        | `can:view dashboard`   | `routes/api.php:58`      |
| Reports          | `can:view reports`     | `routes/api.php:61-67`   |
| Shift Management | `can:manage shifts`    | `routes/api.php:116-119` |
| AI Assistant     | `can:use ai assistant` | `routes/api.php:122-128` |

All other endpoints are protected only by `auth:sanctum` — any authenticated user
may access them. This is by design for modules that do not require
role-based restriction.

### Frontend (React)

| Component                              | Guard Mechanism                                                            | File                                   |
| -------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------- |
| AppSidebar (Main Menu)                 | `permission` field on nav items → `userPermissions.includes()`             | `src/components/layout/AppSidebar.jsx` |
| AppSidebar (AI Assistant)              | `permission: "use ai assistant"` → hidden when not present                 | `src/components/layout/AppSidebar.jsx` |
| Cash Register route (`/cash-register`) | `<RequirePermission permission="manage shifts">` redirects to dashboard    | `src/App.jsx`                          |
| AI Assistant route (`/ai-assistant`)   | `<RequirePermission permission="use ai assistant">` redirects to dashboard | `src/App.jsx`                          |
| ProtectedRoute                         | Checks `user` existence only; no permission filtering                      | `src/components/ProtectedRoute.jsx`    |
| Transactions shift banner              | Conditional render based on `hasManageShifts`                              | `src/pages/Transactions.jsx`           |
| Cash Register (Buka/Tutup/History)     | Conditional render based on `hasManageShifts`                              | `src/pages/CashRegister.jsx`           |

---

## Idempotency

All permission seeding uses `firstOrCreate()` — the seeder can be re-run
without creating duplicate entries.

---

## Verification (Post-Sprint 11.4.3)

- [x] Dashboard returns `200` for Kasir
- [x] Dashboard returns `200` for Gudang
- [x] Dashboard returns `200` for Accounting
- [x] AI Assistant returns `200` for Owner
- [x] AI Assistant returns `200` for Admin
- [x] AI Assistant returns `200` for Accounting
- [x] AI Assistant returns `403` for Kasir
- [x] AI Assistant returns `403` for Gudang
- [x] Sidebar hides AI Assistant for Kasir/Gudang
- [x] Sidebar shows AI Assistant for Owner/Admin/Accounting
