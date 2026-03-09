# Ocean Accounts Dashboard

A generic, configurable web application for displaying environmental accounting and environmental-economic data for marine ecosystems. Built for the Global Ocean Accounts Partnership (GOAP).  

All data in this generic dashboard are fabricated and examples only, even if they appear to represent a specific place, country, jurisdiction, ecosystem or person/people.  

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)

## 🌊 Overview

The GOAP Spatial Data Framework dashboard is a **generic framework** designed for country/jurisdiction-specific deployments. All functionality is built generically and configured through JSON data files—no code changes required for new country deployments.

## Agentic coding workflow
- **The `instructions/` directory is your first touchpoint for a native and natural LLM driven pathway for understanding, modifying and implementing your version of this dashboard.**
- ` instructions/AGENT.md` is analogous to `AGENTS.md` or `CLAUDE.md` that you might find and use with _Codex_ and/or _Claude Code_ and is a good starting point for developing your own workflow.
- An agentic workflow can include adding/removing/modifying features, adding data, adding countries etc.


### Key Features

- 📊 **Interactive Visualizations** - D3.js-powered charts for ecosystem extent, trends, and economic data
- 🗺️ **Spatial Mapping** - MapLibre GL JS map with national/sub-national overlays, monitoring-site markers, and bidirectional deep links to dashboard analytics
- 📍 **Priority Monitoring Sites** - Dashboard cards and spatial popups enriched with site descriptions, ecosystem stats, and mini donut previews
- 📱 **Responsive Design** - Works seamlessly across desktop, tablet, and mobile
- 🔄 **Data-Driven** - All country-specific content loaded from JSON files
- 🎨 **Modern UI** - Clean, professional design with Tailwind CSS
- ♿ **Accessible** - WCAG 2.1 Level AA compliance
- 🚀 **Fast** - Optimized Next.js builds with excellent performance

## 🏗️ Architecture

```
Generic Framework → Data Configuration → Country Deployment
```

- **Main Branch**: Contains generic framework code
- **Country Branches**: e.g., `fiji` branch with country-specific data
- **Deployment**: Each country branch deployed separately via AWS Amplify

## 📋 Prerequisites

- **Node.js**: Version 18+ or 20.x LTS recommended
- **Package Manager**: pnpm (recommended) or npm
- **Git**: For version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ocean-accounts-dashboard
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Start Development Server

```bash
pnpm run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy App to the Web

There are multiple options for deploying the app online - there's services within the major cloud infrasturcutre providers (e.g. Amazon AWS, Google GCS, Microsoft Azure) as well as wrapper services more foucsed on deployment (e.g. Cloudflare, Netlify). These can be deployments of a one-off version of the app (manual), or you can link them to a git repository and have one or more branches automatically built and deployed when they change (or tirggered by changes to specific parts of the app).  

Here is an example of this repo deployed to an AWS Amplify app:
1. Create a new Amplify app (in this case _deployed from a git provider_)
2. The app is linked to the Github repo (read-only access) and deployed to an [Amplify domain](https://main.dteuwauwltb8g.amplifyapp.com/), and will rebuild anytime changes are made to this repo
3. Further customisation could be added if required like security and custom domains

It's good practice to have at least two branches, where one branch (e.g. _dev_) is used to push, deploy and test, before the changes are pushed and deployed for the production version online (e.g. _main_ branch connected to the custom domain).  

## 📁 Project Structure

```
ocean-accounts-dashboard/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Main dashboard page
│   │   └── spatial/           # Spatial data page
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── spatial/           # Map and spatial components
│   │   └── shared/            # Reusable components
│   ├── lib/                   # Utilities and helpers
│   │   ├── dataLoader.ts      # Data loading functions
│   │   ├── calculations.ts    # Derived metrics
│   │   ├── constants.ts       # Color schemes, config
│   │   └── spatialUtils.ts    # Geometry helpers for map + monitoring linkages
│   └── types/                 # TypeScript definitions
├── public/
│   └── data/
│       ├── generic/           # Generic sample data
│       │   ├── national.json
│       │   ├── subnational.json
│       │   ├── timeseries.json
│       │   ├── economic.json
│       │   ├── narrative.json
│       │   └── spatial.json
│       └── [country-code]/    # Country-specific data
├── instructions/              # Project documentation
│   ├── fresh_instructions.md
│   ├── build_specifications.md
│   ├── project_plan.md
│   └── data_descriptors.md
└── README.md                  # This file
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server (http://localhost:3000) |
| `pnpm run build` | Create production build |
| `pnpm run start` | Start production server locally |
| `pnpm run lint` | Run ESLint checks |
| `pnpm run type-check` | Run TypeScript type checking |
| `pnpm run test` | Run test suite |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run validate-data` | Validate JSON data files |
| `pnpm run format` | Format code with Prettier |
| `pnpm run format:check` | Check code formatting |

## 📊 Data Configuration

The dashboard reads all content from JSON files in `public/data/[country-code]/`. Six data files are required:

1. **national.json** - National ecosystem extent data
2. **subnational.json** - Sub-national areas data
3. **timeseries.json** - Historical trends (1990-2025)
4. **economic.json** - Economic indicators and sectors
5. **narrative.json** - Text content and images
6. **spatial.json** - Map configuration, GeoJSON boundaries, legend metadata, and Earth Engine embed details

> 💡 **Monitoring site linkage**: Each entry in `spatial.json` → `locations[]` should have coordinates that fall within a sub-national polygon defined in `spatial.json.boundaries.subnational`. During runtime the app auto-resolves the containing polygon so monitoring cards, map popups, and dashboard deep links stay synchronized. Sites outside a polygon will render without extent statistics until the geometry or location is corrected.

See [`instructions/data_descriptors.md`](instructions/data_descriptors.md) for complete data format specifications.

### Validating Data

Before deploying, always validate your data:

```bash
pnpm run validate-data
```

This checks:
- ✅ Valid JSON syntax
- ✅ Required fields present
- ✅ Correct data types
- ✅ Reasonable value ranges
- ✅ GeoJSON validity

## 🗺️ Spatial Experience

The spatial tab combines a lightweight MapLibre GL JS map with the configured Google Earth Engine experience:

- National and sub-national GeoJSON features from `spatial.json` are styled on the map with hover and selection states.
- Monitoring-site markers originate from `spatial.json.locations`, trigger the same selection flow as polygon clicks, and open rich popups with site details plus a mini donut preview.
- Each feature exposes deep links back to the analytics dashboard (`/?area=...`) and to its contextual card (`/#monitoring-...`), keeping spatial and narrative views in sync.
- The area selector and priority monitoring cards on the dashboard reciprocate with links to `/spatial?area=...` for a cohesive navigation loop.
- The Earth Engine embed defined in `spatial.json.geeApp` renders directly beneath the map, ensuring every deployment can surface richer spatial analysis without code changes.

## 🌍 Creating a Country Deployment

### Step 1: Prepare Data

1. Create directory: `public/data/[country-code]/`
2. Create all 6 required JSON files (see data_descriptors.md)
3. Add images to `public/data/[country-code]/assets/`
4. Run `pnpm run validate-data` to verify

### Step 2: Create Branch

```bash
# Create country-specific branch from main
git checkout main
git pull
git checkout -b [country-code]

# Configure data path (if needed)
# Update environment variables or config
```

### Step 3: Deploy to Amplify

1. Push branch to GitHub
2. In AWS Amplify console, add new branch deployment
3. Configure build settings:
   - **Node.js version**: 20.x
   - **Build specification**: Use `amplify.yml`
   - **Environment variables**: Set any country-specific variables
4. Deploy!

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run with coverage
pnpm run test -- --coverage
```

### Quality Checks Before Commit

```bash
# Run all checks
pnpm run lint && \
pnpm run type-check && \
pnpm run test && \
pnpm run validate-data
```

## 📖 Documentation

Comprehensive documentation is available in the `/instructions` directory:

- **[AGENT.md](AGENT.md)** - Quick reference for AI/agentic coding
- **[fresh_instructions.md](instructions/fresh_instructions.md)** - Project workflow
- **[build_specifications.md](instructions/build_specifications.md)** - Complete technical specs
- **[project_plan.md](instructions/project_plan.md)** - Development roadmap
- **[data_descriptors.md](instructions/data_descriptors.md)** - Data format specifications

## 🚢 Deployment

### AWS Amplify Configuration

The project includes an `amplify.yml` build specification:

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

### Environment Variables

Set in Amplify console per deployment:
- `NEXT_PUBLIC_DATA_PATH` - Data directory path (e.g., "fiji", "generic")
- Additional variables as needed

## 🎨 Design System

### Color Palette

- **Primary Brand**: `#0077be` (Ocean Blue)
- **Backgrounds**: White (`#ffffff`) and Light Gray (`#f8fafb`)
- **Text**: Dark Gray (`#2c3e50`) and Medium Gray (`#64748b`)

### Ecosystem Colors

- **Coral Reef**: `#87CEEB` (Pastel Blue)
- **Reef Flats**: `#FFE4B5` (Pastel Yellow)
- **Seagrass**: `#228B22` (Dark Green)
- **Mangroves**: `#00FF00` (Bright Green)
- **Algae**: `#8B4513` (Brown)
- **Tidal Wetlands**: `#FFB6C1` (Pastel Red)

## 🤝 Contributing

1. Read the documentation in `/instructions`
2. Create a feature branch from `main`
3. Make your changes
4. Run all quality checks
5. Submit a pull request

## 📝 License

This project is part of the Global Ocean Accounts Partnership (GOAP).

## 🆘 Support

For questions or issues:
- Check the documentation in `/instructions`
- Review existing GitHub issues
- Contact the GOAP team

## 🔮 Roadmap

See [`instructions/project_plan.md`](instructions/project_plan.md) for the complete development roadmap.

**Current Phase**: Development in progress

**Future Enhancements**:
- Multi-language support (i18n)
- Data export functionality (CSV, PDF)
- Advanced spatial analysis tools
- Real-time data updates
- API for programmatic access

---

Built with ❤️ for sustainable ocean management
