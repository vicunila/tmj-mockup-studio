import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import {
  BookOpen,
  ChevronRight,
  Hospital,
  Search,
  ShoppingBag,
  TrainFront,
  X,
} from "lucide-react";
import { useWay2fast } from "@/lib/way2fastContext";
import { routesData, type DestinationCategory } from "@/lib/routeRating";

export const Route = createFileRoute("/destination")({
  head: () => ({
    meta: [
      { title: "Destination — Way2fast" },
      {
        name: "description",
        content: "Search and choose a central Tallinn demo destination.",
      },
      { property: "og:title", content: "Destination — Way2fast" },
      {
        property: "og:description",
        content: "Search and choose a central Tallinn demo destination.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DestinationScreen,
});

function CategoryIcon({ category }: { category: DestinationCategory }) {
  if (category === "shop") return <ShoppingBag className="size-5" aria-hidden="true" />;
  if (category === "clinic") return <Hospital className="size-5" aria-hidden="true" />;
  if (category === "tram") return <TrainFront className="size-5" aria-hidden="true" />;
  return <BookOpen className="size-5" aria-hidden="true" />;
}

function DestinationScreen() {
  const { lang, t, setSelectedDestinationId, announce } = useWay2fast();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routesData.destinations;
    return routesData.destinations.filter((dest) => {
      const catEn = t.destination.categories[dest.category].toLowerCase();
      return (
        dest.name.toLowerCase().includes(q) ||
        dest.nameEt.toLowerCase().includes(q) ||
        dest.address.toLowerCase().includes(q) ||
        dest.category.includes(q) ||
        catEn.includes(q)
      );
    });
  }, [query, t.destination.categories]);

  const handleSelect = (destId: string, label: string) => {
    setSelectedDestinationId(destId);
    announce(`${t.routes.toDestination}: ${label}`);
    void navigate({ to: "/routes" });
  };

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t.destination.title}</h1>
        <p className="text-sm text-muted-foreground">{t.destination.subtitle}</p>
      </div>

      <TextField
        id="destination-search"
        type="search"
        fullWidth
        label={t.destination.searchLabel}
        placeholder={t.destination.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search className="size-5 text-muted-foreground" aria-hidden="true" />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label={t.destination.clearSearch}
                  onClick={() => setQuery("")}
                  edge="end"
                >
                  <X className="size-4" aria-hidden="true" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />

      {filtered.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-foreground">{t.destination.noMatches}</p>
          <Button variant="outlined" onClick={() => setQuery("")}>
            {t.destination.resetSearch}
          </Button>
        </div>
      ) : (
        <ul className="space-y-3 list-none p-0 m-0">
          {filtered.map((dest) => {
            const name = lang === "et" ? dest.nameEt : dest.name;
            const catLabel = t.destination.categories[dest.category];
            return (
              <li key={dest.id}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardActionArea
                    onClick={() => handleSelect(dest.id, name)}
                    sx={{ p: 2, minHeight: 68 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                        <CategoryIcon category={dest.category} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {catLabel} · {dest.address}
                        </p>
                      </div>
                      <ChevronRight
                        className="size-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </CardActionArea>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}