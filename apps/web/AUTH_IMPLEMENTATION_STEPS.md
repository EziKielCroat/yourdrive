# Login/Register Auth – Quick Implementation Steps

These steps match the fixes applied so you can verify or re-apply them quickly.

---

## 1. Fix 404 on `/api/auth/device/current`

**Cause:** Backend returns 404 when there is no `deviceId` cookie (e.g. first visit or after clearing cookies). The frontend was logging this as an error.

**Changes:**
- **`store/authStore.ts`** – In `fetchCurrentDevice`, treat 404 as “no current device”: set `currentDevice` to `null` and return without `console.warn`. Log only for non-404 errors.
- **`lib/axios.ts`** – Add `"/auth/device/current"` to `noRetryEndpoints` so 404 from this endpoint does not trigger token refresh.

**Result:** No console error for the expected “no device” case; sidebar and dashboard still work.

---

## 2. Stop Logging Out on Page Switch

**Cause:**  
- Auth state from localStorage (Zustand persist) was not rehydrated before the router ran, so `isAuthenticated` was false and the app redirected to login.  
- `requireAuthentication` was calling `checkAuth()` (which calls `/auth/me`). On failure or cross-origin cookie issues, auth was cleared and you were logged out on every protected navigation.

**Changes:**

### A. Wait for auth rehydration before showing the router (`main.tsx`)
- Import `authRehydratedPromise` from `authStore`.
- Use local state, e.g. `authReady`, initially `false`.
- In `useEffect`, run `authRehydratedPromise.then(() => setAuthReady(true))`.
- Render `RouterProvider` (and the rest of the app) only when `authReady` is true; otherwise render `null` (or a small “Loading…”).
- **`store/authStore.ts`**: Export `authRehydratedPromise` and in the persist config set `onRehydrateStorage: () => (state, err) => { ...; resolveRehydrated(); }` so the promise resolves when rehydration finishes.

**Result:** When the router runs, `isAuthenticated` and `accessToken` are already restored from localStorage, so protected routes no longer redirect to login just because rehydration wasn’t done yet.

### B. Simplify `requireAuthentication` (`router/router.tsx`)
- Remove any `checkAuth()` call and all `isAuthReady` logic.
- Keep only: read `isAuthenticated` from `useAuthStore.getState()`; if `!isAuthenticated`, `throw redirect({ to: ROUTES.LOGIN })`.
- Rely on:
  - **Persisted state** after login/register (and after rehydration).
  - **Axios response interceptor** for 401: try refresh; if refresh fails, call `logout()` (which clears store and `localStorage` and reloads or redirects).

**Result:** Navigating between Dashboard, Your Files, Settings, etc. no longer re-runs `/auth/me` on every transition, so you don’t get logged out on page switch.

---

## 3. Use Same-Origin API So Cookies Work

**Cause:** If `VITE_API_URL` is set to a full URL (e.g. `http://192.168.1.2:3000`), requests are cross-origin and the `refreshToken` cookie may not be sent. Then `/auth/me` and `/auth/refresh` fail and you get logged out.

**Steps for you:**
1. In the **web app** root, ensure `.env` (or `.env.local`) does **not** set `VITE_API_URL` to a full URL when you want cookie-based auth.
2. For local dev, either:
   - Leave `VITE_API_URL` unset so the app uses `baseURL: "/api"`, and in **Vite** `vite.config.ts` proxy `/api` to your backend (e.g. `target: "http://localhost:3000"` or your API URL).  
   **or**
   - Set `VITE_API_URL=/api` so all requests stay same-origin and the proxy is used.
3. Restart the dev server after changing env.

**Result:** `refreshToken` (and `deviceId`) cookies are sent with requests; refresh and `/auth/me` work; no spurious logouts.

---

## 4. Summary Checklist

- [ ] **authStore**: `fetchCurrentDevice` handles 404 silently; `authRehydratedPromise` + `onRehydrateStorage` resolve when persist has rehydrated.
- [ ] **main.tsx**: Wait for `authRehydratedPromise` before rendering `RouterProvider`; show nothing (or “Loading…”) until then.
- [ ] **router**: `requireAuthentication` only checks `isAuthenticated` (no `checkAuth`).
- [ ] **axios**: `noRetryEndpoints` includes `"/auth/device/current"`; only 401 triggers refresh; on refresh failure, clear token and call logout.
- [ ] **Env**: For local dev, use `/api` (proxy) so cookies are same-origin; avoid full `VITE_API_URL` unless you’ve configured CORS and cookie domain for that origin.

After these, login/register should persist across reloads, and switching between Your Files and other dashboard pages should no longer log you out. The only console message for “no device” should be gone.
