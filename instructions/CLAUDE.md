# Ocean Accounts Dashboard - Claude Code Guide

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
- Complete feature requirements (main dashboard + spatial page)
- Data format and configuration requirements
- Design system (colors, typography, layout)
- Development and testing requirements (scripts, validation, quality checks)
- Performance, accessibility, and browser support requirements
- Deployment configuration for AWS Amplify

### 3. **project_plan.md** - Development Roadmap
**Purpose**: Structured development phases and task breakdown  
**Contains**:
- 9 development phases with priority levels
- Detailed task checklists for each phase
- Phase dependencies and parallel work opportunities
- Architecture decision rationale
- Risk management strategy
- Success metrics and quality gates

### 4. **data_descriptors.md** - Data Format Specifications
**Purpose**: JSON data structure documentation  
**Contains**:
- Complete JSON schemas for all 6 data files
- Field descriptions and validation rules
- Automated validation procedures (`pnpm run validate-data`)
- Data preparation workflow
- Quality checks and troubleshooting guide

### 5. **risks.md** - Active Risk Register
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

## Current Project State

Check recent git commits and the active branch to understand current development status. The main development workflow follows the phases in **project_plan.md**.

## Getting Help

- **Architecture questions**: Reference **build_specifications.md** Section 2
- **Implementation order**: Reference **project_plan.md** Phases 1-9
- **Data format questions**: Reference **data_descriptors.md** Section 2
- **Testing requirements**: Reference **build_specifications.md** Section 9.4

---

**Remember**: This is a generic framework. Never hardcode country-specific information in components—all country data comes from JSON files in the data directory.
