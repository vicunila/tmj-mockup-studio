import { lazy, Suspense, useRef, useState, type FormEvent } from "react";
import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Camera, Send } from "lucide-react";
import { useWay2fast, type BarrierReportType } from "@/lib/way2fastContext";

const LeafletPickerMap = lazy(() => import("@/components/LeafletPickerMap"));

const BARRIER_TYPES: BarrierReportType[] = [
  "no_dropped_kerb",
  "cobblestones",
  "steep_slope",
  "snow_ice",
  "blocked_path",
];

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a barrier — Way2fast" },
      {
        name: "description",
        content: "Demo form to log a pedestrian barrier in central Tallinn.",
      },
      { property: "og:title", content: "Report a barrier — Way2fast" },
      {
        property: "og:description",
        content: "Demo form to log a pedestrian barrier in central Tallinn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportBarrierScreen,
});

function ReportBarrierScreen() {
  const { t, submitReport, announce } = useWay2fast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [barrierType, setBarrierType] = useState<BarrierReportType>("no_dropped_kerb");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [coords, setCoords] = useState<[number, number]>([59.4368, 24.7491]);

  const nudge = (dLat: number, dLng: number) => {
    setCoords(([lat, lng]) => [
      Number((lat + dLat).toFixed(5)),
      Number((lng + dLng).toFixed(5)),
    ]);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      setDescriptionError(true);
      announce(t.report.descriptionRequired);
      return;
    }

    submitReport({
      barrierType,
      description: trimmed,
      photoName,
      coords,
    });
    announce(t.report.submittedAnnouncement);
    void navigate({ to: "/report-status" });
  };

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t.report.title}</h1>
        <p className="text-sm text-muted-foreground">{t.report.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormControl fullWidth>
          <InputLabel id="barrier-type-label">{t.report.typeLabel}</InputLabel>
          <Select
            labelId="barrier-type-label"
            id="barrier-type-select"
            value={barrierType}
            label={t.report.typeLabel}
            onChange={(e) => setBarrierType(e.target.value as BarrierReportType)}
          >
            {BARRIER_TYPES.map((typeKey) => (
              <MenuItem key={typeKey} value={typeKey}>
                {t.report.types[typeKey]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          id="barrier-description"
          label={t.report.descriptionLabel}
          placeholder={t.report.descriptionPlaceholder}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (descriptionError && e.target.value.trim()) {
              setDescriptionError(false);
            }
          }}
          multiline
          minRows={3}
          fullWidth
          required
          error={descriptionError}
          helperText={descriptionError ? t.report.descriptionRequired : undefined}
        />

        <div className="space-y-2 rounded-xl border border-border bg-card p-3.5">
          <p className="text-sm font-bold text-foreground">{t.report.photoLabel}</p>
          <input
            ref={fileInputRef}
            id="barrier-photo-input"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPhotoName(file ? file.name : null);
            }}
          />
          <Button
            variant="outlined"
            startIcon={<Camera className="size-4" aria-hidden="true" />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t.report.photoButton}
          </Button>
          <p className="text-xs text-muted-foreground">
            {photoName ? `${t.report.photoSelected} ${photoName}` : t.report.photoNone}
          </p>
        </div>

        <div className="space-y-2.5">
          <div>
            <h2 className="text-sm font-bold text-foreground">{t.report.locationHeading}</h2>
            <p className="text-xs text-muted-foreground">{t.report.locationHint}</p>
          </div>

          <ClientOnly
            fallback={
              <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
                {t.routes.loadingMap}
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
                  {t.routes.loadingMap}
                </div>
              }
            >
              <LeafletPickerMap
                coords={coords}
                onChange={setCoords}
                ariaLabel={t.report.locationHeading}
              />
            </Suspense>
          </ClientOnly>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-2.5">
            <span className="font-mono text-xs text-foreground">
              {t.report.coordinates}: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="small"
                variant="outlined"
                aria-label={t.report.nudgeNorth}
                onClick={() => nudge(0.0005, 0)}
                sx={{ minWidth: 44, px: 1 }}
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="small"
                variant="outlined"
                aria-label={t.report.nudgeSouth}
                onClick={() => nudge(-0.0005, 0)}
                sx={{ minWidth: 44, px: 1 }}
              >
                <ArrowDown className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="small"
                variant="outlined"
                aria-label={t.report.nudgeWest}
                onClick={() => nudge(0, -0.0008)}
                sx={{ minWidth: 44, px: 1 }}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="small"
                variant="outlined"
                aria-label={t.report.nudgeEast}
                onClick={() => nudge(0, 0.0008)}
                sx={{ minWidth: 44, px: 1 }}
              >
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          endIcon={<Send className="size-4" aria-hidden="true" />}
        >
          {t.report.submit}
        </Button>
      </form>
    </section>
  );
}