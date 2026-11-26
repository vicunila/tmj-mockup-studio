import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import { ArrowRight } from "lucide-react";
import { useWay2fast } from "@/lib/way2fastContext";
import type { MobilityAid } from "@/lib/routeRating";

const AID_OPTIONS: MobilityAid[] = [
  "manual_wheelchair",
  "electric_wheelchair",
  "cane",
  "crutches",
  "stroller",
];

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Mobility profile — Way2fast" },
      {
        name: "description",
        content: "Select mobility aid, maximum slope, and surface preferences.",
      },
      { property: "og:title", content: "Mobility profile — Way2fast" },
      {
        property: "og:description",
        content: "Select mobility aid, maximum slope, and surface preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const { t, profile, setAid, updateProfile, announce } = useWay2fast();
  const navigate = useNavigate();

  const handleAidChange = (nextAid: MobilityAid) => {
    setAid(nextAid);
    announce(`${t.profile.announced}: ${t.profile.aids[nextAid]}`);
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t.profile.title}</h1>
        <p className="text-sm text-muted-foreground">{t.profile.subtitle}</p>
      </div>

      <fieldset className="space-y-2 border-0 p-0">
        <legend className="mb-2 text-sm font-bold text-foreground">{t.profile.aidHeading}</legend>
        <RadioGroup
          aria-label={t.profile.aidHeading}
          value={profile.aid}
          onChange={(e) => handleAidChange(e.target.value as MobilityAid)}
          className="space-y-2"
        >
          {AID_OPTIONS.map((aid) => {
            const selected = profile.aid === aid;
            return (
              <label
                key={aid}
                className={`flex min-h-12 cursor-pointer items-center justify-between rounded-xl border px-3 py-2 transition-colors ${
                  selected
                    ? "border-primary bg-accent font-bold text-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <FormControlLabel
                  value={aid}
                  control={<Radio />}
                  label={t.profile.aids[aid]}
                  className="m-0 w-full"
                />
              </label>
            );
          })}
        </RadioGroup>
      </fieldset>

      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="max-slope-slider" className="text-sm font-bold text-foreground">
            {t.profile.maxSlope}
          </label>
          <span className="font-mono text-lg font-bold text-primary">{profile.maxSlopePct}%</span>
        </div>
        <p id="max-slope-hint" className="text-xs text-muted-foreground">
          {t.profile.slopeHint}
        </p>
        <div className="px-1 pt-2">
          <Slider
            id="max-slope-slider"
            aria-label={t.profile.maxSlope}
            aria-describedby="max-slope-hint"
            value={profile.maxSlopePct}
            min={3}
            max={12}
            step={1}
            marks={[
              { value: 3, label: "3%" },
              { value: 6, label: "6%" },
              { value: 9, label: "9%" },
              { value: 12, label: "12%" },
            ]}
            valueLabelDisplay="auto"
            getAriaValueText={(val) => `${val}%`}
            onChange={(_, value) => {
              if (typeof value === "number") {
                updateProfile({ maxSlopePct: value });
              }
            }}
          />
        </div>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 py-2.5">
          <span className="text-sm font-semibold text-foreground">
            {t.profile.avoidCobblestones}
          </span>
          <Switch
            checked={profile.avoidCobblestones}
            onChange={(_, checked) => updateProfile({ avoidCobblestones: checked })}
            slotProps={{ input: { "aria-label": t.profile.avoidCobblestones } }}
          />
        </label>

        <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 py-2.5">
          <span className="text-sm font-semibold text-foreground">
            {t.profile.avoidNoDroppedKerb}
          </span>
          <Switch
            checked={profile.avoidNoDroppedKerb}
            onChange={(_, checked) => updateProfile({ avoidNoDroppedKerb: checked })}
            slotProps={{ input: { "aria-label": t.profile.avoidNoDroppedKerb } }}
          />
        </label>
      </div>

      <Button
        variant="contained"
        size="large"
        fullWidth
        endIcon={<ArrowRight className="size-5" aria-hidden="true" />}
        onClick={() => void navigate({ to: "/destination" })}
      >
        {t.profile.continue}
      </Button>
    </section>
  );
}