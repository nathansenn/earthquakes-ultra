# Earthquakes Ultra - Issues & Fixes Tracker

## 🔬 Volcanic Prediction System v3.0 - DEPLOYED

**Date:** 2026-06-08

Accuracy overhaul anchored in primary-source research. Key changes over v2:

### 1. Per-volcano baseline rates (was: 3 status buckets)
Each Philippine volcano now starts from a baseline eruption rate derived from its
**actual Smithsonian GVP eruption history** (`confirmed eruptions ÷ record length`)
rather than a flat `active/potentially_active/dormant` constant. Examples:
Mayon 66 eruptions since 1616 ≈ 0.16/yr (~6 yr), Kanlaon 31 since 1866 ≈ 0.19/yr,
Taal 39 since 1572 ≈ 0.09/yr, Bulusan 25 since 1852 ≈ 0.14/yr, Pinatubo ≈ 0.011/yr.
Under-documented volcanoes fall back to a status + recency prior.

### 2. Official PHIVOLCS alert level is now an input
The alert level (0–5) is the authoritative observed-unrest signal and the strongest
near-term predictor. It contributes both a rate multiplier and a probability floor
(AL3 ⇒ ≥70% within a year, AL2 ⇒ ≥30%, AL1 ⇒ ≥8%). This is why Mayon (AL3) and
Kanlaon (AL2) now correctly surface as CRITICAL.

### 3. Poisson event model (was: rate × multiplier, hard-capped at 65%)
Probability is now `P(≥1 eruption in t) = 1 − exp(−λ·t)` with
`λ = baseRate × seismicMultipliers × alertFactor`, evaluated at 30 days and 1 year.
Capped at 98% (never claims certainty).

### 4. Data-driven completeness magnitude (was: fixed Mc = 2.0)
The b-value (Aki 1965 MLE) now uses Mc estimated by the maximum-curvature method
(Wiemer & Wyss 2000) on the actual catalogue.

### 5. Global baseline model (new)
All global volcanoes now get a principled Poisson baseline probability from
status + recency of last eruption + VEI, surfaced on `/volcanoes/global` and the
analysis dashboard (clearly labelled lower-confidence — no live seismicity).

### 6. Corrected ground-truth data
- Fixed scrambled/placeholder GVP volcano numbers (e.g. the dataset tagged Taal
  with Mayon's GVP id `273030`); links now use verified GVP numbers.
- Updated last-eruption years (Mayon/Kanlaon 2026, Bulusan 2025) and confirmed
  current alert levels against PHIVOLCS bulletins (Mayon AL3, Kanlaon AL2, Taal AL1, Bulusan AL1).

### Verified output (2026-06-08 snapshot)
```
Mayon     AL3  CRITICAL  ~98%/yr      Bulusan  AL1  HIGH  ~34%/yr
Kanlaon   AL2  CRITICAL  ~81%/yr      Taal     AL1  HIGH  ~29%/yr
(all others: LOW / BACKGROUND)
```

### Corrected references
| Model | Correct citation | Finding used |
|-------|------------------|--------------|
| Nishimura (2017) | *Geophys. Res. Lett.* **44**, 7750–7756 | M≥7.5, ≤200 km ⇒ +~50% eruption prob. for 5 yr |
| Jenkins, Rust & Biggs (2024) | *Volcanica* **7**(1), 165–179 | M≥7, ≤750 km ⇒ ~1.25× rate, strongest yr 1, elevated 2–4 yr |
| Wiemer & Wyss (2000) | *BSSA* **90**, 859–869 | Maximum-curvature magnitude of completeness |
| Marzocchi & Bebbington (2012) | *Bull. Volcanol.* **74** | Poisson/renewal eruption-probability framework |

> **Note:** v2 mis-cited Nishimura (2017) as "JGR Solid Earth 122(3)"; the correct
> venue is *Geophysical Research Letters* **44**. Corrected here.

---

## 🔬 Volcanic Prediction System v2.0 - DEPLOYED

**Date:** 2026-02-02

### Scientific Models Integrated

| Model | Reference | Parameters | Purpose |
|-------|-----------|------------|---------|
| **Nishimura (2017)** | Geophys. Res. Lett., 44 | M≥7.5, ≤200km, 5yr decay | Static stress triggering |
| **Jenkins et al. (2024)** | Volcanica, 7(1) | M≥7.0, ≤750km, 4yr decay | Regional eruption rate increase |
| **Manga & Brodsky (2006)** | Annu. Rev. Earth Planet. Sci. | M≥8.0, ≤5000km, 1yr effect | Dynamic/teleseismic triggering |
| **Roman & Cashman (2006)** | Geology, 34(6) | Depth trend analysis | Magma ascent detection |
| **Kilburn (2003)** | J. Volcanol. Geotherm. Res. | Inverse rate method | Failure forecast modeling |
| **Gutenberg-Richter (1944)** | BSSA | b-value, a-value | Stress state estimation |
| **Aki (1965)** | Maximum likelihood | b = log10(e)/(M̄-Mc) | b-value calculation |
| **Bebbington (2020)** | J. Volcanol. Geotherm. Res. | Renewal models | Base probability rates |

### Analysis Components

1. **Triggering Analysis**
   - Static stress: Nishimura model for M7.5+ within 200km
   - Regional: Jenkins model for M7.0+ within 750km
   - Dynamic: Manga-Brodsky for M8.0+ within 5000km
   - Coulomb stress change estimation (bars)

2. **Depth Migration Analysis**
   - 14-day sliding window
   - Linear regression on hypocenter depths
   - Shallowing rate ≥0.5 km/day = significant
   - Shallowing rate ≥2.0 km/day = critical

3. **b-Value Analysis**
   - Maximum likelihood estimator (Aki 1965)
   - b < 0.7: High stress (larger event potential)
   - b = 0.8-1.2: Normal tectonic
   - b > 1.3: Fluid involvement/swarm

4. **Acceleration Analysis**
   - Daily event binning
   - Linear, exponential, power-law fits
   - Failure Forecast Method (FFM) projection
   - R² confidence scoring

5. **Cluster Analysis**
   - Spatial-temporal grouping (30km, 72hr)
   - Azimuthal sector analysis (8 directions)
   - Swarm detection (low magnitude variance)
   - Migration tracking within clusters
   - Bracketing factor (opposing clusters)

### Risk Levels

| Level | P(1-year) | Action |
|-------|-----------|--------|
| CRITICAL | ≥50% | Immediate review, verify plans |
| VERY_HIGH | ≥35% | Heightened awareness |
| HIGH | ≥20% | Review preparedness |
| ELEVATED | ≥10% | Stay informed |
| MODERATE | ≥5% | Standard awareness |
| LOW | ≥2% | Background level |
| BACKGROUND | <2% | General awareness |

### Multiplier Factors

| Factor | Range | Condition |
|--------|-------|-----------|
| Triggering | 1.0-1.5 | Recent M7+ within range |
| Depth Migration | 1.0-2.5 | Shallowing detected |
| b-Value | 1.0-1.3 | Anomalous b-value |
| Acceleration | 1.0-2.0 | Accelerating seismicity |
| Cluster | 1.0-3.0 | Bracketing, swarms, migration |
| Hydrothermal | 1.0-2.0 | Activity level (0-3) |
| Recent Activity | 1.0-1.5 | Near-field shallow events |

### Latest Analysis Results (2026-02-02)

```
Volcano               Risk       P(1yr)  Multiplier
Leonard Kniaseff      HIGH       26%     2.6x
Taal                  HIGH       20%     2.0x
Mayon                 ELEVATED   15%     1.5x
Pinatubo             ELEVATED   15%     1.5x
Bulusan              ELEVATED   15%     1.5x
Canlaon              ELEVATED   15%     1.5x
...
Mount Apo            LOW        4%      2.0x
```

---

## ✅ Fixed Issues

### Issue #11: Mount Apo Page Missing (2026-02-02)
- **Problem:** `/volcanoes/mount-apo` returned 404
- **Fix:** Added all 24 Philippine volcanoes to static generation
- **Commit:** 0440eec

### Issue #10: Analysis Page Styling (2026-02-02)
- **Problem:** Broken mobile layout, overflow issues
- **Fix:** Improved responsive grids, fixed text overflow
- **Commit:** 0440eec

### Issue #9: Added Satellite Monitoring Links (2026-02-02)
- Added Zoom Earth, NASA Worldview, FIRMS, Sentinel Hub
- Direct links to official PHIVOLCS
- **Commit:** 0440eec

### Issue #8: Volcanic Prediction System v2 (2026-02-02)
- Complete rebuild with peer-reviewed models
- Added depth migration, b-value, acceleration analysis
- 7 risk levels with scientific multipliers
- **Commit:** fa0b903

### Issue #7: All PH Pages Using PHIVOLCS (2026-02-01)
- Migrated volcanoes, region, city pages to local DB
- 1000+ PHIVOLCS earthquakes vs 27 from USGS
- **Commit:** 56edfc9

### Issue #6: Map Missing PHIVOLCS Data (2026-02-01)
- Map now fetches from local DB API
- Shows full 1000+ earthquake dataset
- **Commit:** 10cc51c

### Issue #5: Endtime Bug (2026-02-01)
- Removed endtime parameter from USGS calls
- Was excluding current day's earthquakes
- **Commit:** 10cc51c

### Issue #4: 0.0 Magnitude Earthquakes (2026-02-01)
- JMA API returning invalid magnitudes
- Added filter for M < 0.1
- **Commit:** a3cfb0a

### Issue #3: Volcano Detail Pages 404 (2026-02-01)
- Created `/volcanoes/[slug]` for 250+ volcanoes
- Philippine volcanoes with PHIVOLCS alert levels
- **Commit:** e6bbaff

---

## 📊 Data Sources

| Source | Coverage | Update Freq |
|--------|----------|-------------|
| PHIVOLCS (local DB) | Philippines M1+ | 15 min |
| USGS | Global M2.5+ | Real-time |
| EMSC | Europe/Med M2+ | Real-time |
| JMA | Japan M1+ | Real-time |
| GeoNet | New Zealand M1+ | Real-time |

---

## 🔧 CLI Tools

```bash
# Run volcanic analysis
npx tsx scripts/run-volcanic-analysis.ts

# Check build
npm run build
```

---

## ⚠️ Known Limitations

1. **Not a prediction system** - Statistical probabilities only
2. **Confidence varies** - Depends on monitoring station count
3. **Base rates from GVP** - May not reflect local conditions
4. **No volcanic monitoring data** - Seismic only (no deformation, gas)
5. **PHIVOLCS is authoritative** - Always defer to official bulletins

---

*Last updated: 2026-02-02T19:20:00+08:00*
