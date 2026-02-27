# Ocean Accounts Dashboard - Deployment Guide

## Overview

This guide explains how to deploy the Generic Ocean Accounts Dashboard Framework to a new country or region. The framework is designed to be **data-driven**, meaning most customization happens through JSON configuration files rather than code changes.

## Key Principles

1. **Generic Framework First**: The `main` branch contains the framework with generic sample data
2. **Data-Driven Activation**: Features activate automatically based on data presence (no hardcoded flags)
3. **Branch-Per-Country**: Each country gets its own git branch with country-specific data
4. **Minimal Code Changes**: Deployments should only require:
   - Creating a new data directory with country data
   - Creating a country-specific branch
   - Updating `.env` to point to the country data directory
   - Configuring Amplify for the new deployment

---

## Part 1: Understanding the Framework

### Architecture Principles

**Data-Driven Design**:
- All country-specific content comes from JSON files in `public/data/[country]/`
- UI components check for data presence and render accordingly
- No hardcoded country names, flags, or specific features in code

**Optional Modules**:
- **Phase 1-3** (Ecosystem Dashboard): Core, always present
- **Phase 4** (Social Accounts): Activates when `national.social` field present
- **Phase 5** (Maritime): Activates when `maritime/` data files present
- **Phase 6** (Spatial Enhancements): Activates when `overlays[]` or `ecosystemRasters[]` in spatial.json

**Feature Activation Example**:
```javascript
// In component
if (national.social) {
  // Render social dashboard
} else {
  // Hide social features - user never sees them
}
```

### Required vs. Optional Data Files

| File | Required | Phases | Purpose |
|------|----------|--------|---------|
| `national.json` | ✅ Yes | 1-7 | National statistics, extents, optional social data |
| `subnational.json` | ✅ Yes | 1-7 | Sub-national breakdown, optional social data |
| `timeseries.json` | ✅ Yes | 1-3 | Historical ecosystem trends |
| `economic.json` | ✅ Yes | 1-3 | GDP, tourism, sectoral data |
| `narrative.json` | ✅ Yes | 1-2 | Text content and images |
| `spatial.json` | ✅ Yes | 1,5-6 | Boundaries, locations, overlays, rasters |
| `socioeconomic.json` | ⚪ Optional | 4 | Social indicators, island profiles |
| `maritime/*.json` (4 files) | ⚪ Optional | 5 | Fleet, crew, traffic, overview |

---

## Part 2: Step-by-Step Deployment Process

### Step 1: Prepare Country Data

#### 1.1 Create Data Directory Structure
```bash
# From repository root
mkdir -p public/data/[country-code]
# Where [country-code] is ISO 3166-1 alpha-3 (e.g., "fji" for Fiji)
```

#### 1.2 Prepare Core Data Files

Create the following JSON files in `public/data/[country-code]/`:

**1. `national.json`**
- Required fields: `properties` (name, area_km2, population), `ecosystems` (extent by type)
- Optional: `economic` (GDP contribution, tourism), `social` (indicators, tier data)
- See `data_descriptors.md` Section 2.1 for complete schema

**2. `subnational.json`**
- FeatureCollection of sub-national areas (provinces, islands, districts)
- Each feature: id, name, area_km2, ecosystem extents
- Optional: social indicators per area if Phase 4 enabled
- See `data_descriptors.md` Section 2.2 for complete schema

**3. `timeseries.json`**
- Historical data for each ecosystem type (1990 to present)
- Annual or quarterly granularity
- At minimum: coral reef, seagrass, mangroves
- See `data_descriptors.md` Section 2.3 for complete schema

**4. `economic.json`**
- Economic indicators: GDP %, tourism revenue, fisheries employment, etc.
- Sector data: fisheries, tourism, manufacturing, agriculture, etc.
- Time series with annual data points
- See `data_descriptors.md` Section 2.5 for complete schema

**5. `narrative.json`**
- Text content sections (introduction, findings, recommendations)
- Image references (path to images in `public/data/[country-code]/assets/`)
- Figure captions and descriptions
- See `data_descriptors.md` Section 2.6 for complete schema

**6. `spatial.json`**
- GeoJSON features for national and sub-national boundaries
- **CRITICAL**: Normalize coordinates crossing 180° meridian to [0, 360) range
  - If longitude < 0, add 360 to normalize for MapLibre rendering
  - Use utility: `normalizeGeometryCoordinates()` from `src/lib/rasterUtils.ts`
- Location points: capital, research sites (coordinates, name, type)
- GEE embed URL for spatial explorer
- Legend: ecosystem color definitions
- See `data_descriptors.md` Section 2.7 for complete schema

#### 1.3 Optional: Prepare Phase 4 Data (Social Accounts)

If deploying social accounts module:

**7. `socioeconomic.json`**
- Indicator metadata: names, units, tier definitions, icon symbols
- National metrics: summary statistics by indicator with tier classifications
- Island profiles: population, employment, food security, coastal resilience
- See `data_descriptors.md` Section 2.8 for complete schema

**Update `national.json` and `subnational.json`**:
- Add `social` object to `national.json` with atoll/area summaries
- Add `social` object to each `subnational.json` feature with island-level data

#### 1.4 Optional: Prepare Phase 5 Data (Maritime)

If deploying maritime module:

Create `public/data/[country-code]/maritime/` directory with:

**8. `maritime/overview.json`**
- Fleet KPIs: total vessels, active count, gross tonnage, crew count, etc.
- Strategic metrics: fleet value, GDP contribution, employment
- See schema in `schemas/overview.schema.json`

**9. `maritime/fleet.json`**
- Vessel array with: MMSI, flag, type, tonnage, crew, home port, status
- Ownership and operational details
- See schema in `schemas/fleet.schema.json`

**10. `maritime/crew.json`**
- Crew composition: rank distribution, nationality breakdown
- Skills and certifications summary
- See schema in `schemas/crew.schema.json`

**11. `maritime/traffic.json`**
- Port-level data: monthly arrivals, departures, cargo volumes
- Vessel type and flag breakdowns per port
- See schema in `schemas/traffic.schema.json`

#### 1.5 Optional: Prepare Phase 6 Data (Spatial Enhancements)

If using ecosystem rasters or geographic overlays:

**Update `spatial.json`**:
- Add `ecosystemRasters` array with cloud-optimised GeoTIFF definitions
  - Each raster: id, label, source URL, color, opacity, optional description
- Add `overlays` array with geographic layer definitions
  - Each overlay: id, name, type (geojson/vector), URL, fill/outline colors, opacity

See `spatial.json` sample in `public/data/generic/spatial.json` for format.

#### 1.6 Optional: Add Country Assets

Create `public/data/[country-code]/assets/` directory:
- Country flag (e.g., `flag.png`)
- Logos or emblems
- Images referenced in narrative.json
- Sankey diagrams or custom visualizations (as images)

---

### Step 2: Validate Data

Before proceeding, verify all data is correct:

```bash
# Run data validation against schemas
pnpm run validate-data [country-code]

# Example for Fiji:
pnpm run validate-data fji
```

**Expected Output**:
```
✔ National data valid
✔ Subnational data valid
✔ Time Series data valid
✔ Economic data valid
✔ Narrative data valid
✔ Spatial data valid
```

**If validation fails**:
- Check error messages for missing or misformatted fields
- Review `data_descriptors.md` for field definitions
- Verify schema compliance with `schemas/*.schema.json`
- Common issues:
  - Missing required fields (see schema `required` array)
  - Coordinate values outside valid ranges (lon: -180 to 180, lat: -90 to 90)
  - Incorrect geometry types (Polygon vs. MultiPolygon)
  - Missing color definitions (#RRGGBB format)

---

### Step 3: Create Country-Specific Branch

```bash
# From main branch
git checkout -b [country-code]
# Example:
git checkout -b fji

# Confirm you're on the new branch
git branch
```

---

### Step 4: Configure Environment Variables

#### 4.1 Create `.env.local` File

In the repository root:

```bash
# .env.local (development)
NEXT_PUBLIC_DATA_PATH=generic
# or for country deployment:
# NEXT_PUBLIC_DATA_PATH=fji
```

#### 4.2 Update `next.config.js` (if needed)

The framework uses `NEXT_PUBLIC_DATA_PATH` to determine which data directory to load. The config already supports this pattern—usually no changes needed.

To verify:
```javascript
// src/lib/config.ts should have:
const dataPath = process.env.NEXT_PUBLIC_DATA_PATH || 'generic';
// This loads from public/data/[dataPath]/*.json
```

---

### Step 5: Test Locally

```bash
# Install dependencies (if not already done)
pnpm install

# Set environment variable
export NEXT_PUBLIC_DATA_PATH=[country-code]
# Example:
export NEXT_PUBLIC_DATA_PATH=fji

# Start development server
pnpm run dev
# App runs at http://localhost:3000

# In another terminal, run quality checks
pnpm run lint          # Check code quality
pnpm run type-check    # Verify TypeScript
pnpm run validate-data fji  # Validate data
pnpm run build         # Test production build
```

**Expected Results**:
- ✅ Dev server starts, dashboard loads with country data
- ✅ All pages render (/, /spatial, etc.)
- ✅ Area selector shows sub-national regions
- ✅ Charts display with country data
- ✅ Map shows correct boundaries
- ✅ No console errors
- ✅ Linting, type-check, and build all succeed

---

### Step 6: Commit Country Data

```bash
# Stage all new data files
git add public/data/[country-code]/
git add .env.local
git add any other country-specific files

# Create commit message
git commit -m "Add [Country Name] deployment data

- Added national and subnational data files
- Added spatial configuration with GeoJSON boundaries
- Added economic indicators and time series
- Added narrative content and images
- Validated against all schemas
- Ready for Amplify deployment

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Verify commit
git log --oneline -3
```

---

### Step 7: Configure Amplify Deployment

#### 7.1 Set Environment Variables in Amplify

In AWS Amplify Console:

1. Go to **App Settings → Environment variables**
2. Add variable:
   - **Name**: `NEXT_PUBLIC_DATA_PATH`
   - **Value**: `[country-code]` (e.g., `fji` for Fiji)
3. Save and redeploy

#### 7.2 Configure Build Settings (if needed)

Default `amplify.yml` already configured. Verify it includes:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
        - pnpm run validate-data generic  # Validates generic data
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
```

For country deployments, the validation can be updated:
```yaml
- pnpm run validate-data $NEXT_PUBLIC_DATA_PATH
```

#### 7.3 Deploy Branch

1. In Amplify Console, connect the country branch (e.g., `fji`)
2. Configure branch settings:
   - **Branch**: [country-code]
   - **Environment variables**: Set `NEXT_PUBLIC_DATA_PATH=[country-code]`
3. Amplify automatically builds and deploys on branch push
4. Monitor build logs for errors

---

### Step 8: Verify Deployment

After Amplify deployment completes:

1. **Visual Check**:
   - Visit deployed URL
   - Verify country name appears in header
   - Check data is displayed (stats, charts, maps)
   - Confirm all pages load without errors

2. **Functional Check**:
   - Area selector shows correct sub-national regions
   - Charts respond to area changes
   - Map displays correct boundaries and locations
   - Links between pages work
   - Responsive design works on mobile

3. **Performance Check**:
   - Page load time < 3 seconds
   - No console JavaScript errors
   - Map rendering smooth
   - Charts interactive and responsive

4. **Data Check**:
   - Numbers match source data
   - Colors match ecosystem definitions
   - Optional modules (social, maritime) show only if data present
   - GEE embed loads correctly (if URL provided)

---

## Part 3: Real-World Example (Template Country)

### Scenario: Deploying "Northern Archipelago" Country

#### 1. Prepare Data

```bash
mkdir -p public/data/ntarch/assets
# Create these files:
# public/data/ntarch/national.json
# public/data/ntarch/subnational.json
# public/data/ntarch/timeseries.json
# public/data/ntarch/economic.json
# public/data/ntarch/narrative.json
# public/data/ntarch/spatial.json
```

#### 2. Example: `national.json`
```json
{
  "properties": {
    "country": "Northern Archipelago",
    "area_km2": 25000,
    "population": 450000
  },
  "ecosystems": {
    "coralReef": 15000,
    "mangroves": 8500,
    "seagrass": 12000
  },
  "economic": {
    "oceanGdpContribution": 23.5,
    "tourismRevenue": 450000000,
    "fisheriesEmployment": 12000
  }
}
```

#### 3. Example: `spatial.json` (with dateline handling)
```json
{
  "mapConfig": {
    "center": { "latitude": -15, "longitude": 178 },
    "defaultZoom": 8
  },
  "boundaries": {
    "national": {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [170, -14],  // West side
          [190, -14],  // East side (> 180, normalized form)
          [190, -16],
          [170, -16],
          [170, -14]
        ]]
      }
    }
  }
}
```

**Note**: Coordinates are normalized to [0, 360) range for MapLibre compatibility.

#### 4. Validate
```bash
pnpm run validate-data ntarch
# Expected: All data valid
```

#### 5. Create Branch
```bash
git checkout -b ntarch
```

#### 6. Set Environment
```bash
export NEXT_PUBLIC_DATA_PATH=ntarch
pnpm run dev
```

#### 7. Verify
- Visit http://localhost:3000
- Confirm "Northern Archipelago" displays
- Check all data loads correctly

#### 8. Deploy
```bash
git add public/data/ntarch/
git commit -m "Add Northern Archipelago deployment data"
git push origin ntarch
# Configure Amplify for ntarch branch with NEXT_PUBLIC_DATA_PATH=ntarch
# Amplify auto-deploys
```

---

## Part 4: Feature Selection Guide

### Activating Optional Features

**Social Accounts Module (Phase 4)**:
```bash
# Add to national.json:
{
  ...
  "social": {
    "atolls": [
      { "name": "Central Atoll", "population": 50000, "indicators": [...] }
    ]
  }
}

# Add to each subnational feature:
{
  "properties": { ... },
  "social": {
    "population": 25000,
    "employment": { ... },
    "foodSecurity": { ... }
  }
}
```

When social data present → Social dashboard auto-renders

**Maritime Module (Phase 5)**:
```bash
# Create: public/data/[country]/maritime/
# Add files: overview.json, fleet.json, crew.json, traffic.json
```

When maritime files present → Maritime pages auto-render

**Spatial Enhancements (Phase 6)**:
```bash
# Update spatial.json to include:
{
  ...
  "ecosystemRasters": [
    {
      "id": "coral-extent-2024",
      "label": "Coral Extent 2024",
      "source": "https://example.com/coral.tif",
      "color": "#87CEEB",
      "opacity": 0.7
    }
  ],
  "overlays": [
    {
      "id": "protected-areas",
      "name": "Protected Areas",
      "type": "geojson",
      "url": "https://example.com/mpas.geojson"
    }
  ]
}
```

When raster/overlay data present → Layer controls auto-expand with new layer types

---

## Part 5: Troubleshooting

### Common Issues & Solutions

#### Issue: Data validation fails

**Check**:
1. JSON syntax errors: Use JSON validator (jsonlint.com)
2. Required fields missing: Review schema in `data_descriptors.md`
3. Coordinate ranges: Longitude [-180, 180], Latitude [-90, 90]
4. Geometry types: Must be Polygon or MultiPolygon (no Point in boundaries)

#### Issue: Map doesn't render

**Check**:
1. Spatial.json has valid GeoJSON with proper structure
2. Coordinates are normalized to [0, 360) if crossing dateline
3. No NaN or null coordinates
4. Ring coordinates close (first = last coordinate)

#### Issue: Data doesn't appear in charts

**Check**:
1. Timeseries.json has data for all required years
2. Economic.json has all required fields
3. Subnational areas referenced in timeseries match subnational.json IDs

#### Issue: Build fails on Amplify

**Check**:
1. All data files valid: Run `pnpm run validate-data [country-code]` locally
2. Environment variable set: `NEXT_PUBLIC_DATA_PATH=[country-code]`
3. TypeScript errors: Run `pnpm run type-check` locally
4. Check Amplify build logs for specific errors

#### Issue: Optional features don't appear

**Check**:
1. Social module: Confirm `national.social` field present in data
2. Maritime module: Confirm `public/data/[country]/maritime/` directory exists
3. Overlays/rasters: Confirm `spatial.json` has `overlays[]` or `ecosystemRasters[]`

---

## Part 6: Maintenance

### Regular Updates

#### Data Updates
```bash
# Update existing data file (e.g., new timeseries.json)
# 1. Update file in public/data/[country-code]/
# 2. Validate: pnpm run validate-data [country-code]
# 3. Commit: git commit -am "Update timeseries data for 2025"
# 4. Push to country branch: git push origin [country-code]
# 5. Amplify auto-deploys
```

#### Framework Updates (if merging new features from main)
```bash
# When main branch has new features
git fetch origin
git merge origin/main [country-code]
# Resolve any conflicts
# Re-validate data
pnpm run validate-data [country-code]
git commit -m "Merge latest framework features"
git push origin [country-code]
```

### Performance Monitoring

1. Check Lighthouse scores regularly
2. Monitor bundle size with `pnpm run build`
3. Review web performance in Amplify Console
4. Monitor error rates in browser console

---

## Summary Checklist

- ✅ Data prepared and validated
- ✅ Branch created
- ✅ Environment variables configured
- ✅ Local testing passed
- ✅ Data committed
- ✅ Amplify configured
- ✅ Deployment verified
- ✅ All pages functional
- ✅ Data displays correctly
- ✅ Optional features appropriately activated

**Deployment complete!** 🚀

For ongoing support, see the maintenance section above and review documentation in `/instructions/` directory.
