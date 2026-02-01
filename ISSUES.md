# Earthquakes Ultra - Issue Audit
Generated: 2026-02-01

## Critical Issues

### 1. ✅ FIXED: 0.0 Magnitude Earthquakes Showing
- **Status:** Fixed in commit a3cfb0a
- **Issue:** JMA API returned entries with null/undefined magnitude, falling back to 0
- **Fix:** Added filter to skip invalid magnitudes before mapping, plus safety filter in aggregator

### 2. 🔴 MISSING: Individual Volcano Detail Pages
- **Status:** NEEDS FIX
- **Issue:** Links to `/volcanoes/[slug]` return 404 - no page exists
- **Location:** `src/app/volcanoes/global/page.tsx` links to individual volcanoes
- **Impact:** All volcano detail links are broken
- **Fix:** Create `src/app/volcanoes/[slug]/page.tsx` with volcano details

### 3. 🔴 MISSING: Country History Pages May Fail
- **Status:** NEEDS VERIFICATION
- **Issue:** `/country/[country]/history` exists but may have API issues
- **Location:** `src/app/country/[country]/history/page.tsx`

## Medium Issues

### 4. 🟡 Volcano Page Uses USGS API Directly
- **Status:** NEEDS REVIEW
- **Issue:** `/volcanoes` page fetches from `fetchAllPhilippineEarthquakes` (USGS only)
- **Impact:** Missing PHIVOLCS data for volcanic assessment
- **Location:** `src/app/volcanoes/page.tsx`
- **Fix:** Use local database API instead

### 5. 🟡 Globe Page May Have Performance Issues
- **Status:** NEEDS VERIFICATION
- **Issue:** Loads all global earthquakes for 3D visualization
- **Location:** `src/app/globe/page.tsx`

## Low Priority

### 6. 🟢 Alerts Page - No Backend
- **Status:** UI Only
- **Issue:** Alert signup form doesn't connect to backend
- **Location:** `src/app/alerts/page.tsx`

### 7. 🟢 Depth Fallback to 0
- **Status:** Cosmetic
- **Issue:** Some pages use `depth || 0` which could show 0km for unknown depths
- **Locations:** Multiple pages

## Pages Verified Working
- ✅ Homepage (`/`)
- ✅ Map (`/map`) - Now uses local DB
- ✅ Near Me (`/near-me`) - Now uses local DB for PH
- ✅ Earthquakes List (`/earthquakes`)
- ✅ Philippines (`/philippines`)
- ✅ Countries (`/countries`)
- ✅ Preparedness (`/preparedness`)
- ✅ Volcanoes List (`/volcanoes`)
- ✅ Volcanoes Global (`/volcanoes/global`)
- ✅ Volcanoes Analysis (`/volcanoes/analysis`)
