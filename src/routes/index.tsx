import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { ArrowRight, Compass } from "lucide-react";
import { useWay2fast } from "@/lib/way2fastContext";
import type { Language } from "@/data/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Way2fast — Welcome" },
      {
        name: "description",
        content: "Pedestrian route prototype for wheelchair and walking-aid users in Tallinn.",
      },
      { property: "og:title", content: "Way2fast — Welcome" },
      {
        property: "og:description",
        content: "Pedestrian route prototype for wheelchair and walking-aid users in Tallinn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WelcomeScreen,
});

function WelcomeScreen() {
  const { lang, setLang, t } = useWay2fast();
  const navigate = useNavigate();

  const handleLangChange = (_: unknown, next: Language | null) => {
    if (next) setLang(next);
  };

  return (
    <section className="flex min-h-[calc(100vh-140px)] flex-col justify-between gap-8 py-4">
      <div className="space-y-6">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Compass className="size-7" aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.welcome.eyebrow}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{t.appName}</h1>
          <p className="text-lg leading-relaxed text-foreground">{t.welcome.tagline}</p>
        </div>

        <div className="space-y-2 border-y border-border py-4">
          <p id="welcome-lang-label" className="text-sm font-bold text-foreground">
            {t.welcome.chooseLanguage}
          </p>
          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={handleLangChange}
            aria-labelledby="welcome-lang-label"
            fullWidth
          >
            <ToggleButton value="en">English (EN)</ToggleButton>
            <ToggleButton value="et">Eesti keel (ET)</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="contained"
          size="large"
          fullWidth
          endIcon={<ArrowRight className="size-5" aria-hidden="true" />}
          onClick={() => void navigate({ to: "/profile" })}
          sx={{ minHeight: 52, fontSize: "1.05rem" }}
        >
          {t.welcome.start}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{t.welcome.disclaimer}</p>
      </div>
    </section>
  );
}
