# Ocean Accounts Dashboard - Agentic coding guide

## Project Overview

This is a **Generic Ocean Accounts Dashboard Framework** for the Global Ocean Accounts Partnership (GOAP). It's a configurable React + Next.js web application that displays environmental accounting and environmental-economic data for marine ecosystems. The framework is built generically and configured through data files, enabling rapid country-specific deployments.

**Tech Stack**: React 18+ | Next.js 14+ | TypeScript | Tailwind CSS | D3.js | MapLibre GL JS

## Documentation Structure

All project documentation is located in the `/instructions` directory. Before working on any features or making changes, please read these files in order:

### 1. **fresh_instructions.md** - Start Here
**Purpose**: Project workflow and session management
**Contains**:
- Project background and objectives
- Key context about the dashboard framework architecture
- File familiarization guidelines
- Build and deployment check procedures
- Session wrap-up instructions

### 2. **build_specifications.md** - Complete Product Requirements
**Purpose**: Comprehensive technical and design specifications
**Contains**:
- Technical architecture and technology stack
- Complete feature requirements (7 phases documented)
- Data format and configuration requirements
- Design system (colors, typography, layout)
- Development and testing requirements (scripts, validation, quality checks)
- Performance, accessibility, and browser support requirements
- Deployment configuration for AWS Amplify

### 3. **project_plan.md** - Development Roadmap
**Purpose**: Structured development phases and task breakdown
**Contains**:
- 9 development phases with priority levels
- Phases 1-7 marked complete ✅
- Detailed task checklists for each phase
- Phase dependencies and parallel work opportunities
- Architecture decision rationale
- Risk management strategy
- Success metrics and quality gates

### 4. **data_descriptors.md** - Data Format Specifications
**Purpose**: JSON data structure documentation
**Contains**:
- Complete JSON schemas for all data files
- Field descriptions and validation rules
- Automated validation procedures (`pnpm run validate-data`)
- Data preparation workflow
- Quality checks and troubleshooting guide

### 5. **deployment_guide.md** - Country Deployment Instructions
**Purpose**: Step-by-step guide for deploying to new countries
**Contains**:
- Framework architecture principles
- Data preparation checklist
- Environment configuration
- Amplify deployment setup
- Testing and verification procedures
- Real-world deployment example
- Troubleshooting guide

### 6. **risks.md** - Active Risk Register
**Purpose**: Consolidated risk and mitigation notes
**Contains**:
- High and medium priority risks identified during spec review
- Recommended mitigation actions and ownership guidance
- Highlights of current strengths that support delivery

## Quick Start for Development

### Local Development
```bash
# Install dependencies (requires Node.js 18+ or 20.x LTS)
pnpm install
# or
npm install

# Start development server
pnpm run dev
# or
npm run dev
# App runs at http://localhost:3000

# Run all quality checks
pnpm run lint          # Check code quality
pnpm run type-check    # Verify TypeScript
pnpm run test          # Run test suite
pnpm run validate-data # Validate JSON data
```

### Data Location
- Generic sample data: `public/data/generic/`
- Country-specific data: `public/data/[country-code]/`

### Before Making Changes
1. Read **fresh_instructions.md** for workflow understanding
2. Review **build_specifications.md** section relevant to your task
3. Check **project_plan.md** for phase context and dependencies
4. Consult **data_descriptors.md** if working with data structures
5. Review **risks.md** to stay aligned with known risks and mitigations

### Before Committing
- ✅ Run `pnpm run lint` (no errors)
- ✅ Run `pnpm run type-check` (no errors)
- ✅ Run `pnpm run test` (all pass, 80%+ coverage)
- ✅ Run `pnpm run validate-data` (all data valid)
- ✅ Run `pnpm run build` (build succeeds)

## Key Design Principles

1. **Generic Framework**: All functionality is data-driven, no hardcoded country specifics
2. **Type Safety**: Strict TypeScript with no errors
3. **Data Validation**: All data files validated against schemas
4. **Responsive Design**: Works on desktop, tablet, and mobile
5. **Accessibility**: WCAG 2.1 Level AA compliance
6. **Performance**: Fast load times, optimized bundles

## Feature Module Registry

### Implementation Status: Suggested phases for implementation and validation

These are a set of phases that might be followed to implement different features - and you may want to update the status from complete to pending or data deficient for example.

### Phase 1-3: Ecosystem Dashboard (Core)
**Status**: ✅ Complete
**Always Present**: Yes
**Activation**: Always enabled (core features)
**Files**: src/app/page.tsx, src/components/dashboard/*, public/data/generic/

**Features**:
- Ecosystem Statistics (headline cards with ecosystem extents)
- Area Selector (sub-national region dropdown)
- Distribution Charts (pie charts comparing national vs. selected area)
- Time Series Chart (temporal trends 1990-present)
- Economic Indicators (GDP, tourism, fisheries metrics)
- Priority Monitoring Areas (study site cards with ecosystem breakdown)
- Spatial Visualization (MapLibre map with boundaries and GEE embed)

### Phase 4: Social Accounts Module
**Status**: ✅ Complete
**Activation**: Automatic when `national.social` and `subnational[].social` fields present in data
**Files**: src/components/dashboard/social/*, public/data/generic/socioeconomic.json

**Activation Pattern**:
```typescript
// In component
if (national.social) {
  return <SocialDashboard data={national.social} />;
}
// If no social data, component never renders (graceful hiding)
```

**Data Activation**:
- Add `social` section to `national.json` → Social module activates
- Include `social` in `subnational.json` features → Island-level profiles appear
- Omit social data → Module stays hidden

**Features**:
- Social Indicators with Icon Scales (emoji-based visualization)
- Tier System (low/moderate/high with percentiles)
- Island-Level Socioeconomic Profiles
- Seagrass Percent Change Chart
- Collapsible Card Components
- Export to PNG functionality

### Phase 5: Maritime Infrastructure
**Status**: ✅ Complete
**Activation**: Automatic when maritime data files present in `public/data/generic/maritime/`
**Files**: src/lib/dataLoader.ts (maritime loaders), schemas/crew|fleet|overview|ports|strategic|traffic.schema.json

**Activation Pattern**:
```typescript
// Maritime data loaders check for file existence
const maritime = await loadMaritimeOverview();
if (maritime) {
  // Render maritime dashboard and pages
}
```

**Data Activation**:
- Create `public/data/[country]/maritime/` directory
- Add `overview.json`, `fleet.json`, `crew.json`, `traffic.json`
- Dashboard automatically detects and renders maritime features
- Omit maritime data → Module stays hidden

**Infrastructure Ready For** (Phase 5.2 component integration):
- Fleet KPI Grid (total vessels, tonnage, crew, fleet value)
- Fleet Scope Toggle (domestic-only vs. all-vessels)
- Vessel Registry (searchable grid with filters)
- Crew Panel (rank and nationality breakdown)
- Port Traffic Panel (monthly arrivals/departures)
- Strategic Page (/strategic - fleet economics and workforce)
- Maritime Spatial Page (port popups, heat layers)

**Data Files**:
- `maritime/overview.json` - Fleet KPIs and strategic metrics
- `maritime/fleet.json` - Vessel specifications (MMSI, flag, tonnage, crew)
- `maritime/crew.json` - Crew composition and nationality breakdown
- `maritime/traffic.json` - Port traffic and vessel movements

### Phase 6: Spatial Enhancements
**Status**: ✅ Complete
**Activation**: Automatic when `ecosystemRasters[]` or `overlays[]` in spatial.json
**Files**: src/lib/rasterUtils.ts, src/components/spatial/LayerControl.tsx, public/data/generic/spatial.json

**Activation Pattern**:
```typescript
// Layer grouping in LayerControl
if (rasters && rasters.length > 0) {
  // Display "Ecosystem Rasters" section with amber badges
}
if (overlays && overlays.length > 0) {
  // Display "Spatial Overlays" section with blue badges
}
```

**Data Activation**:
- Add `ecosystemRasters[]` to `spatial.json` → Raster layers appear in layer control
- Add `overlays[]` to `spatial.json` → Overlay layers appear in layer control
- Omit layers → Layer control shows only boundaries

**Features**:
- Cloud-Optimised GeoTIFF Raster Support (coral, seagrass, mangrove extents)
- GeoJSON & Vector Tile Overlays (Marine Protected Areas, Fishing Zones)
- Type-Based Layer Grouping in UI
  - Geographic Boundaries (slate badges)
  - Ecosystem Rasters (amber badges)
  - Spatial Overlays (blue badges)
- Cross-Dateline Coordinate Normalization (for 180° meridian rendering)
- Layer Metadata Tooltips

**Raster Utilities Library** (`src/lib/rasterUtils.ts`):
- `normalizeLongitude(lon)` - Wrap coordinates to [0, 360) range
- `normalizeGeometryCoordinates(coords)` - Recursive geometry normalization
- `isValidCoordinate(lon, lat)` - Validate coordinate ranges
- `getRasterLayerControls(rasters, visible)` - Generate raster UI list
- `getOverlayLayerControls(overlays, visible)` - Generate overlay UI list
- `getAllLayerControls(rasters, overlays, visible)` - Combined layer list
- `getRasterLayerMetadata(rasterId, rasters)` - Raster metadata lookup
- `getOverlayLayerMetadata(overlayId, overlays)` - Overlay metadata lookup

### Phase 7: Validation & Documentation
**Status**: ✅ Complete

**Deliverables**:
- All data files pass validation (0 errors)
- ESLint check passes (0 errors)
- TypeScript strict mode passes (0 errors)
- Production build succeeds (2.5s compile time)
- Complete deployment guide created
- Feature registry documented (this section)
- All documentation updated

**Validation Results**:
- ✅ National data valid
- ✅ Subnational data valid
- ✅ Time Series data valid
- ✅ Economic data valid
- ✅ Narrative data valid
- ✅ Spatial data valid
- ✅ Code quality: 0 errors
- ✅ Type safety: 0 errors
- ✅ Production build: successful

---

## Data-Driven Feature Activation Summary

The framework implements a **data presence = feature enabled** pattern:

| Module | Activation Trigger | Graceful Hiding |
|--------|-------------------|-----------------|
| Ecosystem Dashboard | Always (core) | N/A |
| Social Module | `national.social` present | Yes - component not rendered |
| Maritime Module | `public/data/[country]/maritime/` exists | Yes - pages not mounted |
| Spatial Overlays | `spatial.json.overlays[]` non-empty | Yes - section hidden |
| Raster Layers | `spatial.json.ecosystemRasters[]` non-empty | Yes - section hidden |

**Benefits**:
- No environment variables or config flags
- Simple feature selection (just include/exclude data files)
- Supports multiple features per deployment
- Easy testing (swap data directories)
- Backward compatible (works with or without optional data)

---

## Current Project State

**Status**: Phases 1-7 complete ✅

The framework is production-ready with:
- ✅ All 59 features integrated
- ✅ Data-driven architecture (no hardcoded country specifics)
- ✅ Full type safety (0 TypeScript errors)
- ✅ Comprehensive validation (all checks passing)
- ✅ Deployment documentation (step-by-step guide)
- ✅ Feature registry and activation patterns
- ✅ Comprehensive documentation package


**Possible Next Steps**:
- Phase 8: Enhanced testing and performance optimization
- Phase 9: Multi-country deployment examples and templates

Check recent git commits and the active branch for current development status.

## Getting Help

- **Architecture questions**: Reference **build_specifications.md** Section 2
- **Implementation order**: Reference **project_plan.md** (Phases 1-9)
- **Data format questions**: Reference **data_descriptors.md**
- **Deployment questions**: Reference **deployment_guide.md**
- **Testing requirements**: Reference **build_specifications.md** Section 9.4
- **Feature activation**: Reference this file's "Feature Module Registry"

## For Deploying to a New Country

1. Read **deployment_guide.md** - Complete step-by-step instructions
2. Prepare data files per **data_descriptors.md** schemas
3. Run validation: `pnpm run validate-data [country-code]`
4. Create branch: `git checkout -b [country-code]`
5. Configure environment variables
6. Test locally: `pnpm run dev`
7. Verify all quality checks pass
8. Deploy to Amplify

---

**Remember**:
- This is a generic framework. Never hardcode country-specific information in components
- All country data comes from JSON files in the data directory
- Features activate automatically based on data presence
- Check `/instructions/` for detailed guidance on any aspect

