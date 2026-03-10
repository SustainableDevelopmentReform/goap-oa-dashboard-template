# Ocean Accounts Dashboard - Data Descriptors

## 1. Overview

This document describes the JSON data format specifications for the Ocean Accounts Dashboard. All data files are stored in the `public/data/[country-code]/` directory and loaded at runtime by the application.

### 1.1 General Principles

- All numeric values for areas are in **hectares**
- All currency values are in **USD** unless otherwise specified
- Dates use **ISO 8601 format** (YYYY-MM-DD)
- Coordinates use **WGS84** (EPSG:4326)
- Missing or null values should be represented as `null`
- All text fields support UTF-8 encoding

### 1.2 File Structure

Each country/jurisdiction deployment requires the following files:

```
public/data/[country-code]/
├── national.json          # National ecosystem extent data
├── subnational.json       # Sub-national areas data
├── timeseries.json        # Historical trends data
├── economic.json          # Economic indicators
├── narrative.json         # Text content and metadata
├── spatial.json           # GeoJSON and spatial config
└── assets/                # Images and other media
    ├── sankey.png
    └── [other-images].png
```

## 2. Data File Specifications

### 2.1 national.json

National-level ocean ecosystem extent data.

#### Schema

```json
{
  "countryName": "string",
  "countryCode": "string",
  "lastUpdated": "YYYY-MM-DD",
  "ecosystems": {
    "coralReef": "number",
    "reefFlats": "number",
    "seagrass": "number",
    "mangroves": "number",
    "algae": "number | null",
    "tidalWetlands": "number | null",
    "other": "number | null"
  },
  "metadata": {
    "dataSource": "string",
    "methodology": "string",
    "referenceYear": "number",
    "spatialResolution": "string | null",
    "uncertaintyRange": "string | null"
  }
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `countryName` | string | Yes | Full country/jurisdiction name |
| `countryCode` | string | Yes | ISO 3166-1 alpha-2 or alpha-3 code |
| `lastUpdated` | string | Yes | Date of last data update (ISO 8601) |
| `ecosystems.coralReef` | number | Yes | Coral reef area in hectares |
| `ecosystems.reefFlats` | number | Yes | Reef flats area in hectares |
| `ecosystems.seagrass` | number | Yes | Seagrass area in hectares |
| `ecosystems.mangroves` | number | Yes | Mangrove area in hectares |
| `ecosystems.algae` | number/null | No | Algae area in hectares |
| `ecosystems.tidalWetlands` | number/null | No | Tidal wetlands area in hectares |
| `ecosystems.other` | number/null | No | Other ecosystem types in hectares |
| `metadata.dataSource` | string | Yes | Source of ecosystem data |
| `metadata.methodology` | string | Yes | Brief methodology description |
| `metadata.referenceYear` | number | Yes | Reference year for the data |
| `metadata.spatialResolution` | string | No | Spatial resolution of source data |
| `metadata.uncertaintyRange` | string | No | Uncertainty or confidence interval |

#### Example

```json
{
  "countryName": "Generic Island Nation",
  "countryCode": "GEN",
  "lastUpdated": "2025-01-15",
  "ecosystems": {
    "coralReef": 150000,
    "reefFlats": 80000,
    "seagrass": 45000,
    "mangroves": 35000,
    "algae": 12000,
    "tidalWetlands": 8000,
    "other": null
  },
  "metadata": {
    "dataSource": "National Marine Survey 2024",
    "methodology": "Satellite remote sensing with ground validation",
    "referenceYear": 2024,
    "spatialResolution": "10m",
    "uncertaintyRange": "±5%"
  }
}
```

---

### 2.2 subnational.json

Sub-national areas (islands, provinces, marine protected areas) ecosystem data.

#### Schema

```json
{
  "areas": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "ecosystems": {
        "coralReef": "number",
        "reefFlats": "number",
        "seagrass": "number",
        "mangroves": "number",
        "algae": "number | null",
        "tidalWetlands": "number | null",
        "other": "number | null"
      },
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "description": "string | null"
    }
  ]
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `areas` | array | Yes | Array of sub-national area objects |
| `areas[].id` | string | Yes | Unique identifier for the area |
| `areas[].name` | string | Yes | Display name of the area |
| `areas[].type` | string | Yes | Type of area (e.g., "island", "province", "mpa") |
| `areas[].ecosystems.*` | number/null | Varies | Same ecosystem fields as national.json |
| `areas[].coordinates.latitude` | number | Yes | Center latitude (WGS84) |
| `areas[].coordinates.longitude` | number | Yes | Center longitude (WGS84) |
| `areas[].description` | string | No | Brief description of the area |

#### Example

```json
{
  "areas": [
    {
      "id": "alpha-isle",
      "name": "Alpha Isle",
      "type": "island",
      "ecosystems": {
        "coralReef": 45000,
        "reefFlats": 22000,
        "seagrass": 12000,
        "mangroves": 8000,
        "algae": 3500,
        "tidalWetlands": 2000,
        "other": null
      },
      "coordinates": {
        "latitude": -15.5,
        "longitude": 175.2
      },
      "description": "Reference island with extensive reef systems"
    },
    {
      "id": "beta-isle",
      "name": "Beta Isle",
      "type": "island",
      "ecosystems": {
        "coralReef": 32000,
        "reefFlats": 18000,
        "seagrass": 9000,
        "mangroves": 6000,
        "algae": 2800,
        "tidalWetlands": 1500,
        "other": null
      },
      "coordinates": {
        "latitude": -16.8,
        "longitude": 175.5
      },
      "description": "Second largest island with diverse ecosystems"
    }
  ]
}
```

---

### 2.3 timeseries.json

Historical ocean ecosystem trends data.

#### Schema

```json
{
  "startYear": "number",
  "endYear": "number",
  "ecosystems": [
    {
      "name": "string",
      "displayName": "string",
      "unit": "string",
      "data": [
        {
          "year": "number",
          "value": "number",
          "confidence": "string | null"
        }
      ]
    }
  ],
  "metadata": {
    "dataSource": "string",
    "methodology": "string",
    "notes": "string | null"
  }
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startYear` | number | Yes | First year in the time series |
| `endYear` | number | Yes | Last year in the time series |
| `ecosystems` | array | Yes | Array of ecosystem time series |
| `ecosystems[].name` | string | Yes | Ecosystem identifier (camelCase) |
| `ecosystems[].displayName` | string | Yes | Display name for charts |
| `ecosystems[].unit` | string | Yes | Unit of measurement |
| `ecosystems[].data` | array | Yes | Array of yearly data points |
| `ecosystems[].data[].year` | number | Yes | Year |
| `ecosystems[].data[].value` | number | Yes | Measured value |
| `ecosystems[].data[].confidence` | string | No | Confidence level or range |
| `metadata.dataSource` | string | Yes | Source of time series data |
| `metadata.methodology` | string | Yes | Methodology description |
| `metadata.notes` | string | No | Additional notes |

#### Example

```json
{
  "startYear": 1990,
  "endYear": 2025,
  "ecosystems": [
    {
      "name": "mangroves",
      "displayName": "Mangroves",
      "unit": "hectares",
      "data": [
        {
          "year": 1990,
          "value": 42000,
          "confidence": "high"
        },
        {
          "year": 1995,
          "value": 40500,
          "confidence": "high"
        },
        {
          "year": 2000,
          "value": 38800,
          "confidence": "medium"
        }
      ]
    },
    {
      "name": "seagrass",
      "displayName": "Seagrass",
      "unit": "hectares",
      "data": [
        {
          "year": 1990,
          "value": 52000,
          "confidence": "medium"
        },
        {
          "year": 1995,
          "value": 50200,
          "confidence": "medium"
        }
      ]
    }
  ],
  "metadata": {
    "dataSource": "Historical Marine Surveys (1990-2025)",
    "methodology": "Compiled from aerial surveys, satellite imagery, and field observations",
    "notes": "Data before 2000 has higher uncertainty due to limited satellite coverage"
  }
}
```

---

### 2.4 economic.json

Economic indicators and ocean economy data.

#### Schema

```json
{
  "lastUpdated": "YYYY-MM-DD",
  "referenceYear": "number",
  "currency": "string",
  "indicators": {
    "oceanGdpContribution": {
      "value": "number",
      "unit": "string",
      "description": "string"
    },
    "tourismRevenue": {
      "value": "number",
      "unit": "string",
      "description": "string"
    },
    "fisheriesEmployment": {
      "value": "number",
      "unit": "string",
      "description": "string"
    },
    "householdConsumption": {
      "value": "number",
      "unit": "string",
      "description": "string"
    }
  },
  "sectors": [
    {
      "name": "string",
      "value": "number",
      "unit": "string",
      "percentage": "number | null"
    }
  ],
  "metadata": {
    "dataSource": "string",
    "methodology": "string",
    "notes": "string | null"
  }
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lastUpdated` | string | Yes | Date of last update (ISO 8601) |
| `referenceYear` | number | Yes | Year the economic data refers to |
| `currency` | string | Yes | Currency code (e.g., "USD") |
| `indicators` | object | Yes | Key economic indicators |
| `indicators.*.value` | number | Yes | Numeric value |
| `indicators.*.unit` | string | Yes | Unit (e.g., "percent", "millions", "number") |
| `indicators.*.description` | string | Yes | Brief description |
| `sectors` | array | Yes | Ocean economy sectors |
| `sectors[].name` | string | Yes | Sector name |
| `sectors[].value` | number | Yes | Economic value |
| `sectors[].unit` | string | Yes | Unit of measurement |
| `sectors[].percentage` | number | No | Percentage of total ocean economy |
| `metadata.dataSource` | string | Yes | Source of economic data |
| `metadata.methodology` | string | Yes | Methodology description |
| `metadata.notes` | string | No | Additional notes |

#### Example

```json
{
  "lastUpdated": "2025-01-15",
  "referenceYear": 2024,
  "currency": "USD",
  "indicators": {
    "oceanGdpContribution": {
      "value": 25,
      "unit": "percent",
      "description": "Ocean sectors contribution to national GDP"
    },
    "tourismRevenue": {
      "value": 486,
      "unit": "millions",
      "description": "Annual marine tourism revenue"
    },
    "fisheriesEmployment": {
      "value": 15000,
      "unit": "number",
      "description": "People employed in fisheries sector"
    },
    "householdConsumption": {
      "value": 72,
      "unit": "percent",
      "description": "Household consumption dependent on ocean resources"
    }
  },
  "sectors": [
    {
      "name": "Tourism & Recreation",
      "value": 486,
      "unit": "millions",
      "percentage": 42
    },
    {
      "name": "Fisheries & Aquaculture",
      "value": 273,
      "unit": "millions",
      "percentage": 24
    },
    {
      "name": "Coastal Transport",
      "value": 156,
      "unit": "millions",
      "percentage": 14
    },
    {
      "name": "Marine Biotechnology",
      "value": 89,
      "unit": "millions",
      "percentage": 8
    }
  ],
  "metadata": {
    "dataSource": "National Statistics Office Economic Survey 2024",
    "methodology": "System of National Accounts (SNA) classification with ocean-specific adjustments",
    "notes": "Values adjusted for inflation to 2024 USD"
  }
}
```

---

### 2.5 narrative.json

Text content, narrative sections, and image references.

#### Schema

```json
{
  "introduction": {
    "title": "string",
    "content": "string",
    "lastUpdated": "YYYY-MM-DD"
  },
  "sections": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "order": "number",
      "images": [
        {
          "filename": "string",
          "caption": "string",
          "altText": "string",
          "position": "string"
        }
      ]
    }
  ],
  "footer": {
    "attribution": "string",
    "dataSourceCitation": "string",
    "contactInfo": "string | null"
  }
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `introduction.title` | string | Yes | Dashboard title |
| `introduction.content` | string | Yes | Introductory text (supports Markdown) |
| `introduction.lastUpdated` | string | Yes | Last content update date |
| `sections` | array | Yes | Narrative content sections |
| `sections[].id` | string | Yes | Unique section identifier |
| `sections[].title` | string | Yes | Section heading |
| `sections[].content` | string | Yes | Section text (supports Markdown) |
| `sections[].order` | number | Yes | Display order (ascending) |
| `sections[].images` | array | No | Images for this section |
| `sections[].images[].filename` | string | Yes | Image file in assets/ folder |
| `sections[].images[].caption` | string | Yes | Image caption |
| `sections[].images[].altText` | string | Yes | Accessibility alt text |
| `sections[].images[].position` | string | Yes | Position: "left", "right", "center", "full" |
| `footer.attribution` | string | Yes | GOAP attribution text |
| `footer.dataSourceCitation` | string | Yes | Primary data sources |
| `footer.contactInfo` | string | No | Contact information |

#### Example

```json
{
  "introduction": {
    "title": "Generic Island Nation Ocean Accounts",
    "content": "**Ocean Accounts** provide a systematic approach to measuring and valuing marine ecosystems, enabling evidence-based decision-making for sustainable ocean management. This dashboard demonstrates the GOAP Spatial Data Framework's capability to integrate diverse marine data sources.",
    "lastUpdated": "2025-01-15"
  },
  "sections": [
    {
      "id": "economic-flow",
      "title": "Economic Dependencies Flow",
      "content": "This analysis illustrates how the national economy depends on ocean ecosystems. The flow diagram demonstrates interconnections between marine natural capital and economic activities, highlighting the critical role of ocean resources in supporting various industries and livelihoods.",
      "order": 1,
      "images": [
        {
          "filename": "sankey.png",
          "caption": "Economic dependencies on ocean ecosystems by ISIC sector",
          "altText": "Sankey diagram showing flows from ocean ecosystems to economic sectors",
          "position": "center"
        }
      ]
    },
    {
      "id": "methodology",
      "title": "Data Sources and Methodology",
      "content": "Ocean extent data derived from satellite remote sensing combined with ground-truth validation. Economic indicators sourced from national statistics office using System of National Accounts (SNA) framework with ocean-specific adjustments.",
      "order": 2,
      "images": []
    }
  ],
  "footer": {
    "attribution": "Global Ocean Accounts Partnership (GOAP) Spatial Data Framework",
    "dataSourceCitation": "National Marine Survey (2024), National Statistics Office (2024), SEEA-EA Framework",
    "contactInfo": null
  }
}
```

---

### 2.6 spatial.json

Spatial configuration and GeoJSON boundary data.

#### Schema

```json
{
  "mapConfig": {
    "center": {
      "latitude": "number",
      "longitude": "number"
    },
    "defaultZoom": "number",
    "maxZoom": "number",
    "minZoom": "number",
    "baseMapStyle": "string"
  },
  "boundaries": {
    "national": "GeoJSON Feature or FeatureCollection",
    "subnational": "GeoJSON FeatureCollection"
  },
  "locations": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "description": "string | null"
    }
  ],
  "geeApp": {
    "url": "string",
    "title": "string",
    "description": "string"
  },
  "legend": [
    {
      "ecosystem": "string",
      "color": "string",
      "label": "string"
    }
  ]
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mapConfig.center` | object | Yes | Map center coordinates |
| `mapConfig.defaultZoom` | number | Yes | Default zoom level |
| `mapConfig.maxZoom` | number | Yes | Maximum zoom level |
| `mapConfig.minZoom` | number | Yes | Minimum zoom level |
| `mapConfig.baseMapStyle` | string | Yes | MapLibre style URL |
| `boundaries.national` | GeoJSON | Yes | National boundary GeoJSON |
| `boundaries.subnational` | GeoJSON | No | Sub-national boundaries GeoJSON |
| `locations` | array | No | Point locations for markers |
| `locations[].id` | string | Yes | Unique identifier |
| `locations[].name` | string | Yes | Location name |
| `locations[].type` | string | Yes | Type: "capital", "city", "study-site", etc. |
| `locations[].coordinates` | object | Yes | Lat/lon coordinates |
| `locations[].description` | string | No | Location description |
| `geeApp.url` | string | Yes | Google Earth Engine app URL |
| `geeApp.title` | string | Yes | GEE app title |
| `geeApp.description` | string | Yes | GEE app description |
| `legend` | array | No | Map legend items |

> **Linkage requirement**: Each monitoring site in `locations[]` is matched to a sub-national polygon at runtime using point-in-polygon checks. Ensure the latitude/longitude pair falls within the intended feature; otherwise the dashboard’s priority monitoring cards and spatial popups will omit ecosystem statistics and fall back to a warning message.

#### Example

```json
{
  "mapConfig": {
    "center": {
      "latitude": -16.0,
      "longitude": 175.0
    },
    "defaultZoom": 7,
    "maxZoom": 12,
    "minZoom": 5,
    "baseMapStyle": "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  },
  "boundaries": {
    "national": {
      "type": "Feature",
      "properties": {
        "name": "Generic Island Nation",
        "area_km2": 18272
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [174.0, -15.0],
            [176.0, -15.0],
            [176.0, -17.0],
            [174.0, -17.0],
            [174.0, -15.0]
          ]
        ]
      }
    },
    "subnational": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "id": "alpha-isle",
            "name": "Alpha Isle"
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": []
          }
        }
      ]
    }
  },
  "locations": [
    {
      "id": "capital",
      "name": "Capital City",
      "type": "capital",
      "coordinates": {
        "latitude": -16.5,
        "longitude": 175.2
      },
      "description": "National capital and largest city"
    },
    {
      "id": "study-site-1",
      "name": "Marine Reserve Alpha",
      "type": "study-site",
      "coordinates": {
        "latitude": -15.8,
        "longitude": 175.8
      },
      "description": "Primary research site"
    }
  ],
  "geeApp": {
    "url": "https://username.users.earthengine.app/view/generic-ocean-accounts",
    "title": "Interactive Ocean Ecosystem Map",
    "description": "Explore detailed ocean ecosystem distribution and change over time"
  },
  "legend": [
    {
      "ecosystem": "coralReef",
      "color": "#87CEEB",
      "label": "Coral Reef"
    },
    {
      "ecosystem": "reefFlats",
      "color": "#FFE4B5",
      "label": "Reef Flats"
    },
    {
      "ecosystem": "seagrass",
      "color": "#228B22",
      "label": "Seagrass"
    },
    {
      "ecosystem": "mangroves",
      "color": "#00FF00",
      "label": "Mangroves"
    }
  ]
}
```

---

## 3. Data Validation

### 3.1 Required Validations

All data files should be validated for:

1. **JSON Syntax**: Valid JSON structure
2. **Required Fields**: All required fields present
3. **Data Types**: Correct data types for each field
4. **Value Ranges**: Reasonable value ranges (e.g., hectares > 0)
5. **Coordinate Validity**: Lat/lon within valid ranges
6. **Date Formats**: ISO 8601 compliance
7. **Reference Integrity**: Area IDs consistent across files

### 3.2 Automated Validation

The project includes a validation script that can be run via:

```bash
pnpm run validate-data
# or
npm run validate-data
```

This script:
- Validates all JSON files in the configured data directory
- Checks against JSON schemas for each file type
- Reports specific errors with file and field locations
- Exits with error code if validation fails
- Can be integrated into CI/CD pipelines

**Usage in Development:**
```bash
# Validate generic data during development
pnpm run validate-data

# Validate before committing
pnpm run validate-data && git commit

# Include in pre-deployment checks
pnpm run validate-data && pnpm run build
```

### 3.3 Validation Tools

Recommended validation approach:

```javascript
// Example validation function
function validateNationalData(data) {
  const required = ['countryName', 'countryCode', 'lastUpdated', 'ecosystems'];
  const missing = required.filter(field => !(field in data));
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Additional validation...
}
```

**JSON Schema Validation:**
- JSON schemas should be stored in `schemas/` directory
- Use libraries like `ajv` for schema validation
- Schemas should mirror the data structures in this document

### 3.4 Common Validation Issues

| Issue | Solution |
|-------|----------|
| Missing ecosystem values | Use `null` for unavailable data |
| Inconsistent area IDs | Ensure IDs match across files |
| Invalid GeoJSON | Validate with geojson.io or QGIS |
| Wrong date format | Use YYYY-MM-DD consistently |
| Coordinate precision | Limit to 6 decimal places |

## 4. Data Preparation Workflow

### 4.1 Recommended Steps

1. **Collect Source Data**
   - Gather ecosystem extent data
   - Compile economic indicators
   - Obtain boundary GeoJSON files
   - Collect time series records

2. **Transform to JSON**
   - Convert to specified schema
   - Validate all fields
   - Check data types
   - Handle missing values appropriately

3. **Quality Check**
   - Run `pnpm run validate-data` for automated validation
   - Review in visualization tool
   - Cross-reference with source data
   - Check coordinate accuracy

4. **Document Sources**
   - Fill metadata fields
   - Cite data sources
   - Document methodology
   - Note limitations

5. **Test in Application**
   - Load in development environment with `pnpm run dev`
   - Verify all visualizations render
   - Check for missing data issues
   - Review on multiple devices
   - Run full test suite with `pnpm run test`

### 4.2 Tools and Resources

- **GeoJSON Editing**: geojson.io, QGIS
- **JSON Validation**: jsonlint.com, VSCode extensions
- **Data Transformation**: Python (pandas), R, Excel
- **Coordinate Conversion**: proj.js, QGIS

## 5. Update Procedures

### 5.1 Annual Updates

For routine annual updates:

1. Update `lastUpdated` dates
2. Add new time series data points
3. Update economic indicators
4. Revise ecosystem extent if available
5. Update narrative content as needed
6. Rebuild and deploy

### 5.2 Major Revisions

For significant data changes:

1. Document changes in metadata
2. Consider versioning strategy
3. Update all dependent visualizations
4. Review narrative content for accuracy
5. Update methodology documentation
6. Conduct comprehensive testing

### 5.3 Version Control

Recommended approach:
- Tag releases with version numbers
- Maintain CHANGELOG.md
- Archive previous data versions
- Document breaking changes

## 6. Troubleshooting

### 6.1 Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Charts not rendering | Missing ecosystem data | Check required ecosystem fields |
| Map not loading | Invalid GeoJSON | Validate GeoJSON syntax |
| Wrong totals | Calculation error | Verify arithmetic in source |
| Missing subnational areas | ID mismatch | Check area IDs across files |
| Images not displaying | Wrong path | Verify filename in assets/ |

### 6.2 Data Quality Checks

Before deployment, verify:
- ✅ Run `pnpm run validate-data` with no errors
- ✅ All JSON files parse without errors
- ✅ Required fields present in all files
- ✅ Area IDs consistent across files
- ✅ Coordinates within country bounds
- ✅ Time series has no gaps
- ✅ Economic indicators sum correctly
- ✅ Images load in browser
- ✅ GeoJSON renders in geojson.io
- ✅ No null values where required
- ✅ Local preview with `pnpm run dev` shows all data correctly
- ✅ Production build succeeds with `pnpm run build`
