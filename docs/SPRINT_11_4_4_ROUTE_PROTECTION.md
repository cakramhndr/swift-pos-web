# Sprint 11.4.4 — Frontend Route Protection & Shift Permission Guard

## Background

After implementing the permission matrix in Sprint 11.4.3, a UX and RBAC consistency issue was identified: Accounting and Gudang roles could not perform shift actions on the backend (403 worked correctly), but the frontend still exposed shift-related UI and routes to them.

**Example issues:**

- Accounting could access `/cash-register` directly via URL
- Accounting saw "Buka Shift" button in Transactions page
- Clicking it produced "This action is unauthorized" from the backend
- Shift History tab was visible to everyone even though they couldn't access the API

## Security Issue Found

The frontend relied entirely on **sidebar visibility** as its only protection mechanism. The sidebar correctly hid Cash Register from non-Kasir roles (via `permission: "manage shifts"`), but:

1. **Routes had no permission guards** — entering `/cash-register` or `/ai-assistant` directly in the URL bypassed sidebar hiding
2. **Transactions page shift banner** rendered "Buka Shift" and shift indicator for ALL users regardless of permission
3. **Cash Register page** had no permission checks — Open/Close shift actions and History tab were accessible by anyone who reached the page
4. **OpenShiftModal and CloseShiftModal** were gated only by parent component state, not by permission

## Root Cause Analysis

The existing `ProtectedRoute` component only checked authentication (whether `user` exists), not authorization (whether user has specific permissions). No permission-based route guarding existed in the frontend architecture.

## Changes Made

### 1. RequirePermission Component (NEW)

**File**: `src/components/RequirePermission.jsx`

A simple, reusable route-level permission guard that:

- Accepts a `permission` prop and `children`
- Uses the existing `useAuth()` context to check user permissions
- Redirects to `/dashboard` via `<Navigate>` if the user lacks the required permission
- Renders children if authorized

This follows the principle of reusing existing infrastructure (`useAuth`, `userPermissions`) without creating a parallel permission system.

### 2. Protected Routes

**File**: `src/App.jsx`

Two routes now wrapped with `<RequirePermission>`:

```jsx
<Route path="/ai-assistant" element={
  <RequirePermission permission="use ai assistant">
    <AiAssistant />
  </RequirePermission>
} />
<Route path="/cash-register" element={
  <RequirePermission permission="manage shifts">
    <CashRegister />
  </RequirePermission>
} />
```

### 3. Transaction Page Protection

**File**: `src/pages/Transactions.jsx`

- Added `useAuth` import and extracted `hasManageShifts` from `userPermissions`
- **Shift warning banner**: Only renders when `hasManageShifts` is true AND no active shift exists
- **Shift indicator in header**: Only renders when `hasManageShifts` is true

Previously both the banner and indicator were visible to ALL authenticated users.

### 4. Cash Register Protection

**File**: `src/pages/CashRegister.jsx`

- Added `useAuth` import and extracted `hasManageShifts` from `userPermissions`
- **History tab**: Dynamically included/excluded from tabs array based on `hasManageShifts`
- **"Buka Shift" button** (no active shift state): Only renders when `hasManageShifts` is true
- **"Tutup Shift" card** (active shift state): Only renders when `hasManageShifts` is true

## Verification Results

### Owner / Admin / Kasir

- ✅ Cash Register accessible via route (`/cash-register`)
- ✅ "Buka Shift" button visible when no active shift
- ✅ "Tutup Shift" card visible when shift is active
- ✅ Shift History tab visible
- ✅ Transactions shift banner visible
- ✅ Transactions shift indicator visible

### Accounting / Gudang

- ✅ `/cash-register` redirects to `/dashboard`
- ✅ `/ai-assistant` redirects to `/dashboard`
- ✅ No "Buka Shift" button in Transactions
- ✅ No shift indicator in Transactions header
- ✅ No Shift History tab in Cash Register
- ✅ No "Buka Shift" / "Tutup Shift" actions in Cash Register
- ✅ Transactions page still functions normally for POS operations

## Files Modified

| File                                   | Change                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/components/RequirePermission.jsx` | Created. Route-level permission guard component.                                      |
| `src/App.jsx`                          | Imported RequirePermission. Wrapped `/cash-register` and `/ai-assistant` routes.      |
| `src/pages/Transactions.jsx`           | Added useAuth. Hid shift banner and indicator behind `hasManageShifts` check.         |
| `src/pages/CashRegister.jsx`           | Added useAuth. Hid History tab, Buka Shift, and Tutup Shift behind `hasManageShifts`. |

## Security Improvements

1. **Defense in depth**: Route protection (RequirePermission) + sidebar visibility + backend middleware now all enforce RBAC
2. **No bypass via direct URL**: Even if a user knows the `/cash-register` URL, they get redirected
3. **Consistent UX**: Users never see actions they cannot execute
4. **Reuses existing infrastructure**: No duplicate guard systems, no new authentication logic

## Constraints Observed

- No backend changes were needed
- No permission changes were needed
- No database changes were needed
- Existing `useAuth` context and `user.permissions` array were sufficient
- UI design was preserved — buttons are simply not rendered rather than disabled
- Transaction functionality was preserved — the POS workflow is unaffected
