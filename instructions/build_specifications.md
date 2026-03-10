# Ocean Accounts Dashboard - Build Specifications

## 1. Overview

The Global Ocean Accounts Partnership (GOAP) Spatial Data Framework dashboard is a generic, configurable web application that displays environmental accounting and environmental-economic data for marine ecosystems. The framework is designed to be country/jurisdiction-agnostic, with specific deployments configured through data files rather than code changes.

### 1.1 Core Design Principles

- **Generic Framework**: All functionality is built generically and configured through data files
- **Country-Specific Deployments**: Each jurisdiction deployment uses a separate data directory and git branch
- **Full Transparency**: All data sources and transformations are documented and reproducible
- **Standards Alignment**: Adherence to global statistical standards for environmental-economic accounting
- **Modular Architecture**: Components can be integrated with existing systems
- **Accessibility**: Responsive design supporting desktop, tablet, and mobile devices

### 1.2 Key Stakeholders

- National statistics offices
- Environmental agencies
- Marine spatial planning authorities
- Sustainable finance organizations
- Climate change response teams
- Research and academic institutions

## 2. Technical Architecture

### 2.1 Technology Stack

- **Frontend Framework**: React 18+ with Next.js 14+
- **Node.js**: Version 20.x LTS (specified in Amplify build settings)
- **Package Manager**: pnpm (preferred) or npm
- **Styling**: Tailwind CSS with custom theme
- **Data Visualization**: D3.js v7
- **Mapping**: MapLibre GL JS v3
- **Deployment**: AWS Amplify
- **Version Control**: GitHub
- **Build Tool**: Next.js built-in tooling
- **Type Safety**: TypeScript

### 2.2 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main dashboard page
│   │   ├── spatial/
│   │   │   └── page.tsx                # Spatial data page
│   │   └── layout.tsx                  # Root layout
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── EcosystemStats.tsx      # Headline statistics
│   │   │   ├── EcosystemDistribution.tsx # Pie charts
│   │   │   ├── TimeSeriesChart.tsx     # Temporal trends
│   │   │   ├── EconomicIndicators.tsx  # GDP/economic data
│   │   │   ├── AreaSelector.tsx        # Dropdown for sub-national areas
│   │   │   └── NarrativeSection.tsx    # Text content sections
│   │   ├── spatial/
│   │   │   ├── MapViewer.tsx           # MapLibre map component
│   │   │   ├── GEEEmbed.tsx            # Google Earth Engine iframe
│   │   │   └── LayerControl.tsx        # Map layer toggles
│   │   └── shared/
│   │       ├── Header.tsx              # Site header
│   │       ├── Footer.tsx              # Site footer
│   │       └── LoadingState.tsx        # Loading indicators
│   ├── lib/
│   │   ├── dataLoader.ts               # Data loading utilities
│   │   ├── calculations.ts             # Derived metrics
│   │   └── constants.ts                # Color schemes, config
│   └── types/
│       └── index.ts                    # TypeScript type definitions
├── public/
│   ├── data/
│   │   ├── generic/                    # Generic sample data
│   │   │   ├── national.json
│   │   │   ├── subnational.json
│   │   │   ├── timeseries.json
│   │   │   ├── economic.json
│   │   │   ├── narrative.json
│   │   │   └── spatial.json
│   │   └── [country-code]/             # Country-specific data (e.g., example-country/)
│   │       ├── national.json
│   │       ├── subnational.json
│   │       ├── timeseries.json
│   │       ├── economic.json
│   │       ├── narrative.json
│   │       ├── spatial.json
│   │       └── assets/
│   │           └── [images]            # Country-specific images
│   └── images/
│       └── logos/
├── instructions/
│   ├── fresh_instructions.md
│   ├── build_specifications.md         # This file
│   ├── project_plan.md
│   └── data_descriptors.md
└── amplify.yml                         # Amplify build configuration
```

### 2.3 Data Configuration

The application determines which dataset to load based on an environment variable or configuration file:

- **Development**: Uses `data/generic/` by default
- **Production**: Configured per deployment (e.g., `data/example-country/`)
- **Data Path**: Specified in `next.config.js` or `.env` file

## 3. Implementation Phases Summary

All features below are organized by implementation phase (Phases 1-7). Features activate automatically based on data presence—if a data file or field exists, the corresponding UI renders; if absent, it gracefully hides.

### Phase 1: Foundation ✅
- Project infrastructure, TypeScript types, validation framework, generic sample data

### Phase 2: Core Dashboard ✅
- Ecosystem statistics, area selector, distribution charts, priority monitoring areas

### Phase 3: Time Series & Economic ✅
- Temporal trends chart, economic indicators, sector contribution visualization

### Phase 4: Social Accounts Module ✅
- Social indicators with icon scales, tier system, island-level socioeconomic profiles
- Features activate when `national.social` and `subnational[].social` fields present
- See Section 3.7 below for details

### Phase 5: Maritime Infrastructure ✅
- Shipping KPIs, fleet data, crew composition, port traffic
- Features activate when maritime data files present
- See Section 3.8 below for details

### Phase 6: Spatial Enhancements ✅
- Ecosystem raster layers (GeoTIFF), geographic overlay layers, enhanced layer control
- Cross-dateline coordinate normalization for 180° meridian rendering
- See Section 3.9 below for details

### Phase 7: Validation & Documentation ✅
- Comprehensive data validation, documentation updates, deployment guide, risk mitigation

---

## 3. Feature Requirements

### 3.1 Main Dashboard Page

#### 3.1.1 Header Section
- GOAP branding and logo
- Page title with country/jurisdiction name
- Brief introductory narrative about Ocean Accounts
- Last updated timestamp

#### 3.1.2 Ocean Ecosystem Overview Section
- **Headline Statistics Cards**
  - Total coral reef area (combining reef flats + coral reef)
  - Mangroves area
  - Seagrass area
  - Total ocean ecosystem area
  - Each with hectare units and visual indicators

- **Area Selector**
  - Dropdown menu to switch between:
    - National view (default)
    - Sub-national areas (loaded from data)
  - Updates all relevant charts and statistics

#### 3.1.3 Ecosystem Distribution Section
- **Pie Charts** (side-by-side comparison)
  - National distribution
  - Selected sub-national area (if applicable)
  - Ecosystem types with consistent color coding
  - Interactive hover tooltips with values and percentages
  - Responsive layout (stacks on mobile)

#### 3.1.4 Temporal Trends Section
- **Time Series Line Chart**
  - X-axis: Years (configurable range, e.g., 1990-2025)
  - Y-axis: Area in hectares
  - Multiple lines for different ecosystem types
  - Data points with hover interactions
  - Legend with ecosystem type colors
  - Grid lines for readability

#### 3.1.5 Economic Dependency Section
- **Economic Indicator Cards**
  - Ocean GDP contribution (%)
  - Tourism revenue (USD)
  - Fisheries employment (number)
  - Household consumption dependency (%)
  - Additional indicators as available

- **Sector Contribution Chart**
  - Bar chart showing economic sectors
  - Values in millions USD or percentage
  - Sorted by contribution size
  - Sector labels and values clearly visible

#### 3.1.6 Narrative Content Sections
- **Configurable Text Blocks**
  - Markdown support for rich text
  - Optional accompanying images
  - Sankey diagrams or other visualizations
  - Figure captions and descriptions

- **Image Handling**
  - Load from `data/[country]/assets/`
  - Responsive image sizing
  - Alt text for accessibility
  - Optional click-to-zoom functionality

#### 3.1.7 Priority Monitoring Areas Section
- **Monitoring Site Cards**
  - One card per `spatial.json.locations[]` entry
  - Site name and type pulled directly from spatial configuration
  - Surfaces site description with placeholder monitoring stats
  - Shows ecosystem extent breakdown when the site falls inside a sub-national polygon
  - Fallback message when a site lacks polygon coverage (e.g., offshore stations)
- **Cross-Page Linking**
  - `View in spatial explorer` button points to `/spatial?area=<resolved-area-id>`
  - `#monitoring-<locationId>` anchors allow the spatial viewer to deep link back
  - Requires monitoring-site coordinates to remain inside the intended polygon for automatic matching

#### 3.1.8 Basic Spatial Visualization
- **Simple Map Component**
  - MapLibre GL JS base map sourced from Carto or equivalent
  - **Map dimensions**: 768px height (responsive width), optimized for viewing ecosystem data
  - GeoJSON rendering for:
    - National boundary outline
    - Sub-national area polygons with hover/selection styling and dismissible popups
    - Key locations (capital city, study sites) rendered as markers (toggleable) with independent popups
  - Legend, navigation controls, and responsive sizing
  - **Polygon Popups**:
    - React-rendered components with rich content (ecosystem donut charts, area metadata, navigation links)
    - Close on outside click for improved UX
    - Can be reopened after closing by clicking the polygon again
    - Display monitoring-site name when available, mini donut extent preview, and deep links to dashboard sections
  - **Marker Popups**:
    - Simple HTML popups with location name, type, and description
    - Close on outside click for consistency
    - Independent from polygon selection state
  - Hover panel displaying area metadata above the map for quick reference
  - Normalize GeoJSON features that cross the antimeridian by wrapping longitudes into a 0–360 range so MapLibre renders continuous polygons
  - Bidirectional linking between map selections (`/?area=`) and dashboard cards (`/#area-`)
  - Automatic site→polygon mapping driven by run-time point-in-polygon checks; developers must ensure location coordinates align with GeoJSON boundaries

### 3.2 Spatial Data Page

#### 3.2.1 Map Presentation
- **Primary Map Panel**
  - Renders the MapLibre component with 768px height for optimal viewing
  - Reads the active area from the `area` query param
  - Updates dashboard links when the user selects a sub-national feature
  - **Polygon interaction**: Click to open React-rendered popup with rich metadata, ecosystem donut preview, and deep links to `/` + `#monitoring-<id>`; popups close on outside click and can be reopened
  - **Marker interaction**: Click to open simple HTML popup with location details; independent from polygon selection
  - Provides quick navigation back to the dashboard while preserving context
  - Layer toggle controls for sub-national boundaries and priority monitoring areas

#### 3.2.2 Google Earth Engine Integration
- **GEE App Embed**
  - Full-width iframe embedding GEE application
  - URL loaded from spatial data configuration
  - Responsive height adjustment
  - Positioned directly beneath the map to encourage sequential exploration

#### 3.2.3 Future Spatial Features (Placeholders)
- Advanced MapLibre rendering
- Multi-layer ecosystem visualization
- Time-slider for temporal data
- Data download capabilities
- Spatial query tools

### 3.7 Social Accounts Module (Phase 4)

**Activation**: Renders when `national.social` and `subnational[].social` fields present in data

#### 3.7.1 Social Indicators Display
- **Icon Scale Visualization**: Displays indicators using emoji icon counts (e.g., 🐟🐟🐟 for 60% fishing dependence)
- **Tier System**: 3-tier classification (low/moderate/high) with color coding and percentile ranges
- **Island-Level Profiles**: Breakdown of demographics, employment, food security, and coastal resilience per island
- **Collapsible Cards**: Full-width expandable panels for island/area details

#### 3.7.2 Social Data Structure
- **Metadata**: Indicator definitions, tier labels, icon symbols, units of measurement
- **Metrics**: National and subnational aggregates by indicator with tier classifications
- **Island Profiles**: Population distribution, employment breakdown, food security status, coastal reliance metrics

#### 3.7.3 Export Capability
- Cards render to PNG via html-to-image library
- Per-card download control with lazy-loaded functionality
- Preserves formatting and styling in exported images

---

### 3.8 Maritime Infrastructure (Phase 5)

**Activation**: Renders when maritime data files (`public/data/generic/maritime/*.json`) present

#### 3.8.1 Maritime Dashboard
- **Fleet KPI Grid**: Total vessels, active vessels, gross tonnage, crew count, domestic share %, fleet value, fleet age
- **Fleet Scope Toggle**: Switch between domestic-only and all-vessels views; KPIs and charts update dynamically
- **Vessel Registry**: Searchable grid of vessels (~6 columns × scrollable rows) with filters by name/port/type
- **Vessel Detail Overlay**: In-panel drilldown showing coordinates, crew, safe manning, certifications, fees

#### 3.8.2 Crew & Port Panels
- **Crew Composition**: Rank and nationality breakdown (simplified to domestic vs. international)
- **Port Traffic**: Monthly arrivals/departures/cargo by port; click port for vessel-type/flag breakdown modal

#### 3.8.3 Strategic Page
- **Fleet Economics**: Value cards, age distribution bar chart, depreciation trajectory
- **Fleet Composition**: Donut chart showing vessel type breakdown
- **Workforce Summary**: Low/mid/high skill distribution with headcount indicators
- **Revenue Analysis**: Stacked bar charts showing economic contributions by sector
- **Flow Diagrams**: Economic linkage visualization (future enhancement)

#### 3.8.4 Maritime Spatial Page
- **Port Locations**: GeoJSON markers with port terminal flags, authority, LOCODE codes
- **Province Boundaries**: Overlay showing maritime jurisdiction areas
- **Heat Layers**: Vessel and crew density visualization for high-activity zones

#### 3.8.5 Data Structure
- **Fleet Data**: Vessel specifications (MMSI, flag, type, tonnage, crew count, home port, status)
- **Crew Data**: Rank distribution, nationality breakdown, skills and certifications
- **Traffic Data**: Port monthly statistics with vessel movements and cargo volumes
- **Overview KPIs**: Derived metrics across fleet, crew, ports, and strategic dimensions

---

### 3.9 Spatial Enhancements (Phase 6)

**Activation**: Renders when `ecosystemRasters[]` or `overlays[]` present in spatial.json

#### 3.9.1 Raster Layers (GeoTIFF Support)
- **Ecosystem Rasters**: Cloud-optimised GeoTIFF definitions for coral extent, seagrass extent, mangrove extent
- **Properties per Raster**: ID, label, source URL, color, opacity (0-1), optional description
- **Rendering Infrastructure**: geotiff library integration documented in `rasterUtils.ts` for future client-side rendering
- **Legend Integration**: Raster layers appear in unified layer control with color-coded badges

#### 3.9.2 Geographic Overlay Layers
- **GeoJSON & Vector Tile Support**: Dynamic loading of overlay geometries (Marine Protected Areas, Fishing Zones, etc.)
- **Visual Styling**: Fill colors, outline colors, opacity per layer, configurable from data
- **Layer Control**: Toggleable checkboxes for each overlay in grouped UI

#### 3.9.3 Enhanced Layer Control UI
- **Type-Based Grouping**:
  - Geographic Boundaries (slate badges)
  - Ecosystem Rasters (amber badges)
  - Spatial Overlays (blue badges)
- **Visual Differentiation**: Color-coded badges per layer type for quick identification
- **Metadata Tooltips**: Optional descriptions for each layer displayed on hover
- **Backward Compatibility**: Existing boundary layers continue to work unchanged

#### 3.9.4 Cross-Dateline Coordinate Handling
- **Problem**: Geometries crossing the 180° meridian (International Date Line) render as split polygons in MapLibre
- **Solution**: `normalizeGeometryCoordinates()` utility wraps coordinates from [-180, 180] to [0, 360] range
- **Use Cases**: Archipelagic states, small-island jurisdictions, and coastal nations spanning the 180° meridian
- **Implementation**: Recursive normalization of all coordinate arrays in GeoJSON features

#### 3.9.5 Raster Utilities Library
**File**: `src/lib/rasterUtils.ts`

Provides 8+ helper functions:
- `normalizeLongitude()` - Wraps single coordinates to [0, 360)
- `normalizeGeometryCoordinates()` - Recursively normalizes nested coordinate arrays
- `isValidCoordinate()` - Validates longitude/latitude ranges
- `getRasterLayerControls()` - Generates UI layer list for raster layers
- `getOverlayLayerControls()` - Generates UI layer list for overlay layers
- `getAllLayerControls()` - Combined layer list with types
- `getRasterLayerMetadata()` - Lookup raster metadata by ID
- `getOverlayLayerMetadata()` - Lookup overlay metadata by ID

---

### 3.3 Shared Components

#### 3.3.1 Navigation
- Header with site branding
- Navigation links (Dashboard, Spatial Data)
- Responsive mobile menu

#### 3.3.2 Footer
- GOAP attribution
- Data source citations
- Last updated information
- Link to methodology documentation

## 4. Data Requirements

### 4.1 Data Format
All data stored as JSON files in the `public/data/[country-code]/` directory. See `data_descriptors.md` for detailed schemas.

### 4.2 Core Data Files (Phases 1-3)
Required for base dashboard functionality:
1. `national.json` - National-level ecosystem extent data
2. `subnational.json` - Sub-national areas ecosystem data
3. `timeseries.json` - Historical ecosystem trends
4. `economic.json` - Economic indicators and sector data
5. `narrative.json` - Text content and image references
6. `spatial.json` - GeoJSON boundaries, overlays, rasters, GEE URLs

### 4.3 Optional Phase 4 Data (Social Accounts Module)
Adds when `national.social` and `subnational[].social` fields added to core files:
7. `socioeconomic.json` - Social indicator metadata, island profiles, tier definitions

### 4.4 Optional Phase 5 Data (Maritime Infrastructure)
Activates when maritime data files added to `public/data/generic/maritime/`:
8. `maritime/overview.json` - Fleet KPIs and strategic metrics
9. `maritime/fleet.json` - Vessel registry with specifications
10. `maritime/crew.json` - Crew composition and nationality data
11. `maritime/traffic.json` - Port traffic and vessel movements

### 4.3 Data Validation
- JSON schema validation on build
- Required fields check
- Data type validation
- Warning for missing optional fields
- Verify spatial datasets convert longitudes near `-180` to their `+180–360` equivalents to avoid MapLibre antimeridian rendering gaps

## 5. Design Requirements

### 5.1 Visual Design

#### 5.1.1 Color Palette
- **Primary Brand**: #0077be (Ocean Blue)
- **Backgrounds**: 
  - Main: #ffffff (White)
  - Secondary: #f8fafb (Light Gray)
  - Cards: #ffffff with subtle borders
- **Text**:
  - Primary: #2c3e50 (Dark Gray)
  - Secondary: #64748b (Medium Gray)
- **Ecosystem Colors** (consistent across all charts):
  - Coral reef: #87CEEB (Pastel Blue)
  - Reef flats: #FFE4B5 (Pastel Yellow)
  - Seagrass: #228B22 (Dark Green)
  - Algae: #8B4513 (Brown)
  - Mangroves: #00FF00 (Bright Green)
  - Tidal wetlands: #FFB6C1 (Pastel Red)

#### 5.1.2 Typography
- **Headings**: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Body**: Same as headings for consistency
- **Sizes**:
  - H1: 3rem (48px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)

#### 5.1.3 Layout
- Max content width: 1400px
- Responsive breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Grid-based layout for cards
- Consistent spacing (1.5rem, 2rem, 3rem)

### 5.2 Interactions

#### 5.2.1 Chart Interactions
- Hover tooltips on all data points
- Smooth transitions (300ms ease)
- Click interactions where applicable
- Clear visual feedback

#### 5.2.2 Area Selector
- Dropdown with search/filter
- Smooth data transitions
- Loading state during data fetch
- Clear indication of current selection

#### 5.2.3 Map Interactions
- Pan and zoom with smooth transitions
- **Polygon clicks**: Open dismissible React popups with rich ecosystem data; can be reopened after closing
- **Marker clicks**: Open dismissible HTML popups with location details
- **Outside clicks**: Close any open popup for improved navigation
- Layer toggle controls for boundaries and monitoring locations
- Hover highlighting with visual feedback
- Responsive to viewport changes

## 6. Accessibility Requirements

### 6.1 WCAG 2.1 Level AA Compliance
- Sufficient color contrast ratios (4.5:1 for text)
- Keyboard navigation support
- ARIA labels for interactive elements
- Alt text for all images
- Semantic HTML structure

### 6.2 Screen Reader Support
- Meaningful heading hierarchy
- Descriptive link text
- Chart data tables as fallback
- Skip navigation links

## 7. Performance Requirements

### 7.1 Load Time
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s

### 7.2 Optimization
- Image optimization (WebP format where supported)
- Code splitting by route
- Lazy loading for below-fold content
- Efficient D3 rendering (virtual scrolling if needed)

### 7.3 Data Loading
- Progressive loading of chart data
- Error boundaries for failed data loads
- Graceful degradation for missing data
- Client-side caching of loaded data

## 11. Browser Support

### 11.1 Supported Browsers
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

### 11.2 Polyfills
- ES6+ features for older browsers
- Fetch API polyfill
- IntersectionObserver polyfill

## 9. Development and Testing Requirements

### 9.1 Local Development Environment
- **Package Manager Support**: Application must support both npm and pnpm
- **Development Server**: `pnpm run dev` or `npm run dev` starts local development server
- **Default Port**: Development server runs on http://localhost:3000
- **Hot Reload**: Changes to code and data files trigger automatic reload
- **Local Data**: Development environment uses `data/generic/` by default

### 9.2 Available Scripts
The following npm/pnpm scripts must be available:

| Command | Purpose |
|---------|---------|
| `pnpm run dev` | Start development server with hot reload |
| `pnpm run build` | Create production build |
| `pnpm run start` | Start production server locally |
| `pnpm run lint` | Run ESLint checks on codebase |
| `pnpm run type-check` | Run TypeScript type checking |
| `pnpm run test` | Run unit and integration tests |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run validate-data` | Validate JSON data files against schemas |
| `pnpm run format` | Format code with Prettier |
| `pnpm run format:check` | Check code formatting without changes |

### 9.3 Code Quality Checks
- **Linting**: ESLint configured with Next.js and TypeScript rules
- **Type Safety**: Strict TypeScript configuration with no errors
- **Formatting**: Prettier for consistent code style
- **Pre-commit Hooks**: Optional Husky setup for automated checks

### 9.4 Testing Framework
- **Unit Tests**: Jest + React Testing Library
- **Test Coverage**: Minimum 80% coverage for critical paths
- **Component Tests**: Visual and functional component testing
- **Data Validation**: JSON schema validation tests
- **CI Integration**: All tests run automatically in CI/CD

### 9.5 Local Preview
- **Build Verification**: `pnpm run build && pnpm run start` for production preview
- **Performance Testing**: Lighthouse CLI for local performance audits
- **Accessibility Testing**: axe-core for automated a11y checks
- **Cross-browser Testing**: Local testing on Chrome, Firefox, Safari

## 10. Deployment Requirements

### 10.1 AWS Amplify Configuration
- **Node.js Version**: Configure Node 20.x in Amplify build settings
- Automatic builds on git push
- Branch-based deployments
- Environment variables per deployment
- Build notifications
- Custom domain support

### 10.2 Build Process
- TypeScript compilation
- Next.js static optimization
- Asset bundling and optimization
- Build-time data validation
- Generate sitemap

### 10.3 Environment Management
- Development: Uses generic data
- Staging: Country-specific data for testing
- Production: Live country deployment

### 10.4 Amplify Build Configuration
Example `amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
        - pnpm run validate-data
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

## 10. Testing Requirements

### 10.1 Unit Tests
- Component rendering tests
- Data transformation functions
- Utility function tests

### 10.2 Integration Tests
- Data loading and parsing
- Chart rendering with real data
- Area selector functionality
- Navigation between pages

### 10.3 Visual Regression Tests
- Screenshot comparison for key views
- Chart rendering consistency
- Responsive layout checks

## 12. Documentation Requirements

### 12.1 Developer Documentation
- Setup and installation guide
- Component API documentation
- Data format specifications
- Deployment procedures
- Contributing guidelines

### 12.2 User Documentation
- Dashboard interpretation guide
- Data source explanations
- Methodology documentation
- FAQ section

## 13. Future Enhancements (Post-MVP)

### 13.1 Advanced Features
- Multi-language support (i18n)
- Data export functionality (CSV, PDF)
- Comparative analysis between countries
- Advanced spatial analysis tools
- Real-time data updates
- User authentication and roles
- Custom report generation
- API for programmatic access

### 13.2 Additional Visualizations
- Sankey diagrams (already planned)
- Network diagrams
- 3D terrain visualization
- Animated temporal changes
- Heatmaps

### 13.3 Enhanced Interactivity
- Custom date range selection
- Data filtering and sorting
- Saved view configurations
- Shareable dashboard states
- Annotation capabilities
