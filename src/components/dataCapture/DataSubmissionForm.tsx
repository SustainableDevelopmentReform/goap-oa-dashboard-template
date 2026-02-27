'use client';

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Geometry } from "geojson";

import { MapGeometryPicker } from "@/components/dataCapture/MapGeometryPicker";

type SectionId = "dataset" | "methodology" | "temporal" | "spatial" | "quality" | "access";

interface SectionConfig {
  id: SectionId;
  title: string;
  description: string;
  required?: boolean;
}

const SECTION_CONFIGS: SectionConfig[] = [
  {
    id: "dataset",
    title: "Section A — Dataset Overview",
    description:
      "Capture the core identity of the dataset, the type of data you are sharing, and the coverage it represents.",
    required: true,
  },
  {
    id: "methodology",
    title: "Section B — Collection Methodology",
    description:
      "Describe how the data was obtained, standards observed, and any processing or modelling applied prior to submission.",
  },
  {
    id: "temporal",
    title: "Section C — Temporal Information",
    description: "Outline when the data was collected, the reference periods covered, and how often updates are expected.",
  },
  {
    id: "spatial",
    title: "Section D — Spatial Characteristics",
    description:
      "Provide spatial metadata for datasets with geographic components, including coordinate systems and accuracy notes.",
  },
  {
    id: "quality",
    title: "Section E — Quality & Assurance",
    description: "Summarise known limitations, validation activities, and the quality assurance status of the dataset.",
    required: true,
  },
  {
    id: "access",
    title: "Section F — Access & Contacts",
    description: "Capture the access conditions, preferred citation, and the people responsible for managing the dataset.",
    required: true,
  },
];

const INPUT_CLASSES =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100";

export function DataSubmissionForm() {
  const [hasSpatialComponent, setHasSpatialComponent] = useState(false);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const defaultOpen = useMemo(
    () => SECTION_CONFIGS.filter((section) => section.required).map((section) => section.id),
    [],
  );
  const [openSections, setOpenSections] = useState<SectionId[]>(defaultOpen);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [selectedGeometry, setSelectedGeometry] = useState<Geometry | null>(null);
  const [geographicCoverageValue, setGeographicCoverageValue] = useState("");

  const toggleSection = (id: SectionId) => {
    setOpenSections((previous) => (previous.includes(id) ? previous.filter((section) => section !== id) : [...previous, id]));
  };

  const geometrySummary = useMemo(() => {
    if (!selectedGeometry) {
      return null;
    }
    return summariseGeometry(selectedGeometry);
  }, [selectedGeometry]);

  const handleGeometryConfirm = (geometry: Geometry) => {
    setSelectedGeometry(geometry);
    const summary = summariseGeometry(geometry);
    setGeographicCoverageValue((previous) => {
      const trimmed = previous.trim();
      if (!trimmed || trimmed.startsWith("Map selection:")) {
        return `Map selection: ${summary}`;
      }
      return `${trimmed}\nMap selection: ${summary}`;
    });
    setIsMapPickerOpen(false);
  };

  const geometryPreview = useMemo(
    () => (selectedGeometry ? JSON.stringify(selectedGeometry, null, 2) : null),
    [selectedGeometry],
  );

  const handleOpenMapPicker = () => {
    setIsMapPickerOpen(true);
  };

  const handleClearGeometry = () => {
    setSelectedGeometry(null);
    setGeographicCoverageValue((previous) => removeMapSummary(previous));
  };

  const handleGeographicCoverageChange = (value: string) => {
    setGeographicCoverageValue(value);
  };

  return (
    <>
      <section className="flex flex-col gap-6 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Submit New Data</p>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-slate-900">New data submission form</h2>
            <p className="text-sm text-slate-600">
              Use this expandable form to preview the fields required for new dataset onboarding. Provide as much detail as you have
              available—optional sections can remain collapsed until you need them, noting there are some non-optional fields. After
              you submit the form, an email will be sent to you with options for sending or uploading your dataset(s).
            </p>
          </div>
        </header>

        <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
          {SECTION_CONFIGS.map((section) => (
            <AccordionSection
              key={section.id}
              config={section}
              isOpen={openSections.includes(section.id)}
              onToggle={toggleSection}
            >
              {renderSectionContent({
                sectionId: section.id,
                hasSpatialComponent,
                setHasSpatialComponent,
                today,
                openMapPicker: handleOpenMapPicker,
                clearGeometry: handleClearGeometry,
                geometrySummary,
                geometryPreview,
                selectedGeometry,
                geographicCoverageValue,
                onGeographicCoverageChange: handleGeographicCoverageChange,
              })}
            </AccordionSection>
          ))}

          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-dashed border-primary-soft bg-primary-soft/30 p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600">
              This form is in Beta version - fields support data entry but no data will be transmitted or stored.
            </p>
            <button
              type="submit"
              disabled
              className="inline-flex items-center justify-center rounded-full bg-slate-300 px-6 py-2 text-sm font-semibold text-slate-600"
            >
              Submit dataset (disabled)
            </button>
          </div>
        </form>
      </section>

      <MapGeometryPicker
        isOpen={isMapPickerOpen}
        initialGeometry={selectedGeometry}
        onClose={() => setIsMapPickerOpen(false)}
        onConfirm={handleGeometryConfirm}
      />
    </>
  );
}

interface SectionContentProps {
  sectionId: SectionId;
  hasSpatialComponent: boolean;
  setHasSpatialComponent: (value: boolean) => void;
  today: string;
  openMapPicker: () => void;
  clearGeometry: () => void;
  geometrySummary: string | null;
  geometryPreview: string | null;
  selectedGeometry: Geometry | null;
  geographicCoverageValue: string;
  onGeographicCoverageChange: (value: string) => void;
}

function renderSectionContent({
  sectionId,
  hasSpatialComponent,
  setHasSpatialComponent,
  today,
  openMapPicker,
  clearGeometry,
  geometrySummary,
  geometryPreview,
  selectedGeometry,
  geographicCoverageValue,
  onGeographicCoverageChange,
}: SectionContentProps) {
  switch (sectionId) {
    case "dataset":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Dataset title" id="dataset-title" required>
              <input
                id="dataset-title"
                name="datasetTitle"
                type="text"
                required
                className={INPUT_CLASSES}
                placeholder="e.g. National coral reef extent 2023"
              />
            </FormField>
            <FormField label="Data source type" id="data-source-type" required>
              <select id="data-source-type" name="dataSourceType" required className={INPUT_CLASSES}>
                <option value="">Select source type</option>
                <option value="survey">Survey / census</option>
                <option value="administrative">Administrative records</option>
                <option value="sensor">Sensor / monitoring network</option>
                <option value="satellite">Satellite / remote sensing</option>
                <option value="citizen">Citizen-generated</option>
                <option value="modelled">Modelled / estimated</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>
          <FormField label="Dataset summary" id="dataset-summary" description="Briefly describe what the dataset contains.">
            <textarea
              id="dataset-summary"
              name="datasetSummary"
              rows={4}
              className={`${INPUT_CLASSES} min-h-[7rem]`}
              placeholder="Key variables, units of measure, update history…"
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Data structure" id="data-structure" description="Select the primary data format.">
              <select id="data-structure" name="dataStructure" className={INPUT_CLASSES}>
                <option value="">Select data structure</option>
                <option value="tabular">Tabular (CSV, XLSX)</option>
                <option value="vector">Vector (GeoJSON, Shapefile)</option>
                <option value="raster">Raster (GeoTIFF)</option>
                <option value="mixed">Mixed (multiple formats)</option>
                <option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Geographic coverage & boundaries" id="geographic-coverage" required>
              <textarea
                id="geographic-coverage"
                name="geographicCoverage"
                required
                rows={3}
                className={`${INPUT_CLASSES} min-h-[6rem]`}
                placeholder="Describe the national/subnational regions represented."
                value={geographicCoverageValue}
                onChange={(event) => onGeographicCoverageChange(event.target.value)}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={openMapPicker}
                  className="rounded-full border border-primary/40 bg-primary-soft/60 px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/80 hover:text-white"
                >
                  Select on map
                </button>
                {selectedGeometry ? (
                  <button
                    type="button"
                    onClick={clearGeometry}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    Clear map selection
                  </button>
                ) : null}
                {geometrySummary ? (
                  <span className="text-xs font-medium text-slate-600">
                    Map geometry: {geometrySummary}
                  </span>
                ) : null}
              </div>
              {geometryPreview ? (
                <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  {geometryPreview}
                </pre>
              ) : null}
            </FormField>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-soft/70 bg-primary-soft/40 px-4 py-3">
            <input
              id="has-spatial-component"
              name="hasSpatialComponent"
              type="checkbox"
              checked={hasSpatialComponent}
              onChange={(event) => setHasSpatialComponent(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="has-spatial-component" className="text-sm font-medium text-slate-700">
              This dataset contains spatial geometry or coordinates
            </label>
            <p className="text-xs text-slate-500">Selecting this enables additional metadata fields under Section D.</p>
          </div>
          <FormField
            label="Key variables or indicators"
            id="key-variables"
            description="List the main measures, attributes, or indicators included in the dataset."
          >
            <textarea
              id="key-variables"
              name="keyVariables"
              rows={4}
              className={`${INPUT_CLASSES} min-h-[7rem]`}
              placeholder="Variable name — units — brief description"
            />
          </FormField>
        </div>
      );

    case "methodology":
      return (
        <div className="space-y-6">
          <FormField
            label="Collection method"
            id="collection-method"
            description="Include sampling design, measurement techniques, and equipment used."
          >
            <textarea
              id="collection-method"
              name="collectionMethod"
              rows={4}
              className={`${INPUT_CLASSES} min-h-[6rem]`}
              placeholder="Describe how the data was obtained, including sampling and measurement protocols."
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Standards or classifications applied"
              id="standards-applied"
              description="International/national classifications, coordinate systems, or taxonomies."
            >
              <input
                id="standards-applied"
                name="standardsApplied"
                type="text"
                className={INPUT_CLASSES}
                placeholder="e.g. ISO 19115, ANZLIC, WGS84"
              />
            </FormField>
            <FormField
              label="Legal basis for collection (if applicable)"
              id="legal-basis"
              description="Include legislation, policies, or mandates enabling collection."
            >
              <input
                id="legal-basis"
                name="legalBasis"
                type="text"
                className={INPUT_CLASSES}
                placeholder="Legislation or policy reference"
              />
            </FormField>
          </div>
          <FormField
            label="Processing, cleaning, or modelling steps"
            id="processing-steps"
            description="Summarise transformations applied before submission."
          >
            <textarea
              id="processing-steps"
              name="processingSteps"
              rows={4}
              className={`${INPUT_CLASSES} min-h-[6rem]`}
              placeholder="Imputation methods, aggregation/disaggregation, coordinate transformations…"
            />
          </FormField>
        </div>
      );

    case "temporal":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Primary data collection date" id="collection-date" required>
              <input id="collection-date" name="collectionDate" type="date" required className={INPUT_CLASSES} />
            </FormField>
            <FormField
              label="Reference period covered"
              id="reference-period"
              description="Specify the time window or season represented."
            >
              <input
                id="reference-period"
                name="referencePeriod"
                type="text"
                className={INPUT_CLASSES}
                placeholder="e.g. Jan–Dec 2023, Q1 2024"
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Last update date" id="last-update-date">
              <input id="last-update-date" name="lastUpdateDate" type="date" className={INPUT_CLASSES} defaultValue={today} />
            </FormField>
            <FormField label="Expected update frequency" id="update-frequency">
              <select id="update-frequency" name="updateFrequency" className={INPUT_CLASSES}>
                <option value="">Select frequency</option>
                <option value="annual">Annual</option>
                <option value="biannual">Biannual</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="ad-hoc">Ad hoc / irregular</option>
              </select>
            </FormField>
            <FormField label="Lag between reference period and availability" id="time-lag" description="Estimate in weeks/months.">
              <input id="time-lag" name="timeLag" type="text" className={INPUT_CLASSES} placeholder="e.g. 2 months" />
            </FormField>
          </div>
        </div>
      );

    case "spatial":
      return (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {hasSpatialComponent ? (
              <p>
                Provide the spatial metadata that ensures interoperability. All fields marked as required are mandatory for spatial
                datasets.
              </p>
            ) : (
              <p>
                This dataset is currently flagged as non-spatial. You can still capture spatial metadata if needed—toggle the spatial
                checkbox in Section A to indicate a spatial submission.
              </p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Coordinate reference system"
              id="coordinate-system"
              required={hasSpatialComponent}
              description="Include EPSG code or projection definition."
            >
              <input
                id="coordinate-system"
                name="coordinateSystem"
                type="text"
                required={hasSpatialComponent}
                className={INPUT_CLASSES}
                placeholder="e.g. EPSG:4326 (WGS84)"
              />
            </FormField>
            <FormField
              label="Spatial resolution / scale"
              id="spatial-resolution"
              description="Provide cell size, scale, or minimum mapping unit."
            >
              <input
                id="spatial-resolution"
                name="spatialResolution"
                type="text"
                className={INPUT_CLASSES}
                placeholder="e.g. 30m grid, 1:25,000"
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Positional accuracy" id="positional-accuracy" description="Report accuracy assessment or known errors.">
              <input
                id="positional-accuracy"
                name="positionalAccuracy"
                type="text"
                className={INPUT_CLASSES}
                placeholder="e.g. ±10m GPS accuracy"
              />
            </FormField>
            <FormField label="Geocoding method" id="geocoding-method" description="How were locations derived?">
              <input
                id="geocoding-method"
                name="geocodingMethod"
                type="text"
                className={INPUT_CLASSES}
                placeholder="Manual digitising, address matching, satellite-derived…"
              />
            </FormField>
          </div>
          <FormField
            label="Spatial coverage notes"
            id="spatial-coverage-notes"
            description="Clarify any exclusions, masks, or boundary approximations."
          >
            <textarea
              id="spatial-coverage-notes"
              name="spatialCoverageNotes"
              className={`${INPUT_CLASSES} min-h-[6rem]`}
              placeholder="Include spatial coverage notes, especially for partial coverage datasets."
            />
          </FormField>
        </div>
      );

    case "quality":
      return (
        <div className="space-y-6">
          <FormField label="Known limitations or issues" id="known-limitations" required>
            <textarea
              id="known-limitations"
              name="knownLimitations"
              required
              rows={4}
              className={`${INPUT_CLASSES} min-h-[6rem]`}
              placeholder="Summarise known gaps, biases, or caveats users should consider."
            />
          </FormField>
          <FormField
            label="Validation or QA methods applied"
            id="validation-methods"
            description="List checks performed to ensure data reliability."
          >
            <textarea
              id="validation-methods"
              name="validationMethods"
              rows={4}
              className={`${INPUT_CLASSES} min-h-[6rem]`}
              placeholder="Cross-validation, peer review, ground-truthing, automated QA rules…"
            />
          </FormField>
          <FormField
            label="Data completeness and coverage notes"
            id="data-completeness"
            description="Provide estimates of missing data, spatial coverage, or uncertainty."
          >
            <textarea
              id="data-completeness"
              name="dataCompleteness"
              rows={3}
              className={`${INPUT_CLASSES} min-h-[5rem]`}
              placeholder="e.g. 5% missing attribute values, limited coverage in outer islands…"
            />
          </FormField>
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-700">Quality indicators</legend>
            <p className="text-xs text-slate-500">Select all that apply to the submitted dataset.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <CheckboxField id="indicator-validated" name="qualityIndicators" value="validated" label="Data has been validated" />
              <CheckboxField
                id="indicator-fit"
                name="qualityIndicators"
                value="fit-for-purpose"
                label="Fitness for purpose: high or fit for intended use"
              />
              <CheckboxField
                id="indicator-standards"
                name="qualityIndicators"
                value="standards-compliant"
                label="Complies with relevant standards"
              />
              <CheckboxField
                id="indicator-issues"
                name="qualityIndicators"
                value="issues-flagged"
                label="Known issues flagged (details above)"
              />
            </div>
          </fieldset>
        </div>
      );

    case "access":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Primary file format" id="file-format" required>
              <select id="file-format" name="fileFormat" required className={INPUT_CLASSES}>
                <option value="">Select a format</option>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="geojson">GeoJSON</option>
                <option value="shapefile">Shapefile</option>
                <option value="geotiff">GeoTIFF</option>
                <option value="netcdf">NetCDF</option>
                <option value="json">JSON</option>
                <option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Character encoding / language" id="character-encoding">
              <input
                id="character-encoding"
                name="characterEncoding"
                type="text"
                className={INPUT_CLASSES}
                placeholder="e.g. UTF-8, English"
              />
            </FormField>
          </div>
          <FormField
            label="Access restrictions or confidentiality notes"
            id="access-restrictions"
            description="Clarify if the dataset contains sensitive information."
          >
            <textarea
              id="access-restrictions"
              name="accessRestrictions"
              rows={4}
              className={`${INPUT_CLASSES} min-h-[6rem]`}
              placeholder="Describe licensing, confidentiality, or restrictions on distribution."
            />
          </FormField>
          <FormField
            label="Preferred citation or usage statement"
            id="citation-requirements"
            description="Provide a citation or acknowledgement to accompany the data."
          >
            <textarea
              id="citation-requirements"
              name="citationRequirements"
              rows={3}
              className={`${INPUT_CLASSES} min-h-[5rem]`}
              placeholder="e.g. National Statistics Office (2024). Marine Ecosystem Dataset."
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Submitter name" id="submitter-name" required>
              <input id="submitter-name" name="submitterName" type="text" required className={INPUT_CLASSES} />
            </FormField>
            <FormField label="Submitter organisation" id="submitter-organisation">
              <input id="submitter-organisation" name="submitterOrganisation" type="text" className={INPUT_CLASSES} />
            </FormField>
            <FormField label="Email address" id="submitter-email" required>
              <input
                id="submitter-email"
                name="submitterEmail"
                type="email"
                required
                className={INPUT_CLASSES}
                placeholder="name@example.org"
              />
            </FormField>
            <FormField label="Phone number" id="submitter-phone">
              <input id="submitter-phone" name="submitterPhone" type="tel" className={INPUT_CLASSES} placeholder="+1 ..." />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Person responsible for data quality" id="quality-contact">
              <input id="quality-contact" name="qualityContact" type="text" className={INPUT_CLASSES} />
            </FormField>
            <FormField label="Date of submission" id="submission-date">
              <input id="submission-date" name="submissionDate" type="date" className={INPUT_CLASSES} defaultValue={today} />
            </FormField>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function summariseGeometry(geometry: Geometry): string {
  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates as [number, number];
    return `Point at ${lng.toFixed(4)}, ${lat.toFixed(4)}`;
  }

  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates[0] ?? [];
    if (ring.length === 0) {
      return "Polygon selection";
    }
    const visibleVertices = ring.slice(0, Math.max(0, Math.min(ring.length - 1, 3)));
    const vertexSummary = visibleVertices
      .map(([lng, lat], index) => `${index + 1}: ${lng.toFixed(3)}, ${lat.toFixed(3)}`)
      .join(" | ");
    const remaining = Math.max(ring.length - 1 - visibleVertices.length, 0);
    return remaining > 0
      ? `Polygon (${ring.length - 1} vertices; sample ${vertexSummary}; +${remaining} more)`
      : `Polygon vertices ${vertexSummary}`;
  }

  return geometry.type;
}

function removeMapSummary(value: string): string {
  if (!value) {
    return "";
  }
  const cleaned = value.replace(/(\r?\n)?Map selection:[\s\S]*$/u, "").trimEnd();
  return cleaned;
}

interface AccordionSectionProps {
  config: SectionConfig;
  isOpen: boolean;
  onToggle: (id: SectionId) => void;
  children: React.ReactNode;
}

function AccordionSection({ config, isOpen, onToggle, children }: AccordionSectionProps) {
  const contentId = `${config.id}-content`;

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/80 shadow-sm">
      <button
        type="button"
        onClick={() => onToggle(config.id)}
        className="flex w-full items-start justify-between gap-4 rounded-xl px-5 py-4 text-left"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{config.title}</h3>
            {config.required ? <RequiredBadge /> : null}
          </div>
          <p className="text-sm text-slate-600">{config.description}</p>
        </div>
        <span
          className={clsx(
            "mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
            isOpen ? "border-primary text-primary" : "border-slate-300 text-slate-500",
          )}
          aria-hidden
        >
          {isOpen ? "–" : "+"}
        </span>
      </button>
      <div
        id={contentId}
        role="region"
        aria-hidden={!isOpen}
        className={clsx("grid overflow-hidden px-5 transition-[grid-template-rows] duration-200 ease-in-out", {
          "grid-rows-[1fr] pb-5": isOpen,
          "grid-rows-[0fr]": !isOpen,
        })}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

interface FormFieldProps {
  label: string;
  id: string;
  children: React.ReactNode;
  description?: string;
  required?: boolean;
}

function FormField({ label, id, children, description, required }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {label}
        {required ? <RequiredBadge /> : null}
      </label>
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      {children}
    </div>
  );
}

interface CheckboxFieldProps {
  id: string;
  name: string;
  value: string;
  label: string;
}

function CheckboxField({ id, name, value, label }: CheckboxFieldProps) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm">
      <input
        id={id}
        name={name}
        value={value}
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
      />
      <span className="text-slate-600">{label}</span>
    </label>
  );
}

function RequiredBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-primary/50 bg-primary-soft/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
      Required
    </span>
  );
}
