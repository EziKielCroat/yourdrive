# Bug Fix Session — UI/UX Issues

## Status: ✅ All Complete

### Fixes Applied

- [x] **Icon import path bug (9 files)** — All preview components (`TextPreview`, `CodePreview`, `PDFPreview`, `DocumentPreview`, `VideoPreview`, `AudioPreview`, `ArchivePreview`, `DefaultPreview`, `UnsupportedState`) had `../../../../icons/index` which resolved to a non-existent path. Fixed to `../../../icons/index` → `components/shared/icons/index`.

- [x] **Dark/light mode background flash** — `userUiPreferencesStore` initialized `resolvedTheme: "light"` hardcoded, ignoring cached preference. Added localStorage persistence (`yd_resolved_theme` key) — theme is now written on every hydrate/set and read on store init, so the correct theme is applied immediately without waiting for API response.

- [x] **Settings section title icon alignment** — `SectionTitle` was a plain `h2` without flex layout, causing icons to sit misaligned. Added `display: flex; align-items: center; gap: 0.4rem` to the styled component. Removed inline `verticalAlign: "middle"` hacks from `SharingSection`, `PreferencesNotificationsPrivacy`, `TwoFactorSettings`.

- [x] **Spotlight tour — sidebar toggle overlap with QuickSearch** — `data-tour="tour-search"` was on `SearchContainer` which wrapped the `SidebarToggle`. Moved the attribute to `InputWrapper` only, so tour highlights just the search input. Added `closeSidebar: true` to relevant steps so the sidebar is closed when showcasing the toggle button. Added `closeSidebar` handling to `useLayoutEffect` with 200ms delay.

- [x] **Spotlight tour — "skrivanje otkrivanje sidebara" not underlined** — Updated `sidebar-toggle` step `body` from plain string to JSX with `<u>otvara i zatvara</u>` emphasis. Changed step title to "Skrivanje i otkrivanje izbornika". Changed `TourStep.body` type to `React.ReactNode`.

- [x] **Sidebar icon sizes + min-width** — Sidebar width increased from 180px → 200px, nav item max-width from 165px → 190px, UpgradeWrapper max-width from 165px → 190px. NavItem padding reduced and labels now use `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`. Icons in `NavigationMenu` reduced from default 24px → 16px.

- [x] **Navbar icon sizes** — `PlusIcon`, `SettingsIcon`, `LogOutIcon` reduced from default 24px → 16px so they fit naturally in 35×35px `NavButton`.

- [x] **README auto-preview on first load** — Added `README_NAMES` constant and `hasAutoOpenedReadme` ref to `YourFiles`. After `fetchFiles()` loads the file list, it checks for a README file by name and auto-opens it in `FilePreview` on first load only.

## Review

All 7 issues resolved with minimal, targeted changes. No new dependencies introduced.
