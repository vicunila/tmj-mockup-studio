import { lazy, Suspense, useMemo, useState } from "react";
import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import { ChevronRight, Clock, HelpCircle, Ruler, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { RatingBadge } from "@/components/RatingBadge";
import { useWay2fast } from "@/lib/way2fastContext";
import { evaluateRoute, routesData } from "@/lib/routeRating";

const LeafletRoutesMap = lazy(() => import("@/components/LeafletRoutesMap"));

export const Route = createFileRoute("/routes")({
  head: () => ({
    meta: [
      { title: "Route options — Way2fast" },
      {
        name: "description",
        content: "Compare three accessible pedestrian route options on an OpenStreetMap view.",
      },
      { property: "og:title", content: "Route options — Way2fast" },
      {
        property: "og:description",
        content: "Compare three accessible pedestrian route options on an OpenStreetMap view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RouteOptionsScreen,
});

function RouteOptionsScreen() {
  const { lang, t, profile, selectedDestinationId } = useWay2fast();
  const navigate = useNavigate();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const destination = useMemo(
    () =>
      routesData.destinations.find((d) => d.id === selectedDestinationId) ??
      routesData.destinations[0],
    [selectedDestinationId],
  );

  const evaluated = useMemo(() => {
    if (!destination) return [];
    return routesData.routes
      .filter((r) => r.destinationId === destination.id)
      .map((r) => evaluateRoute(r, profile));
  }, [destination, profile]);

  if (!destination) return null;

  const destName = lang === "et" ? destination.nameEt : destination.name;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t.routes.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.routes.toDestination}: <strong className="text-foreground">{destName}</strong>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs">
        <span className="text-foreground">
          {t.routes.selectedRouteNote}: <strong>{t.profile.aids[profile.aid]}</strong> ·{" "}
          <span className="font-mono">≤{profile.maxSlopePct}%</span>
        </span>
        <Button
          size="small"
          variant="outlined"
          startIcon={<SlidersHorizontal className="size-4" aria-hidden="true" />}
          onClick={() => void navigate({ to: "/profile" })}
        >
          {t.routes.changeProfile}
        </Button>
      </div>

      <ClientOnly
        fallback={
          <div className="flex h-60 items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
            {t.routes.loadingMap}
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="flex h-60 items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
              {t.routes.loadingMap}
            </div>
          }
        >
          <LeafletRoutesMap
            origin={routesData.origin}
            destination={destination}
            evaluatedRoutes={evaluated}
            selectedRouteId={highlightedId}
            onSelectRoute={(routeId) => setHighlightedId(routeId)}
            ariaLabel={t.routes.mapTitle}
          />
        </Suspense>
      </ClientOnly>

      <div
        aria-label={t.routes.legendTitle}
        className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2.5"
      >
        <RatingBadge rating="easy" />
        <RatingBadge rating="manageable" />
        <RatingBadge rating="avoid" />
      </div>

      <ul className="space-y-3 list-none p-0 m-0">
        {evaluated.map(({ route, rating, knownBarrierCount, unknownCount }) => {
          const routeName = lang === "et" ? route.nameEt : route.name;
          const isHighlighted = highlightedId === route.id;
          const barrierLabel =
            knownBarrierCount === 1 ? t.routes.knownBarrierSingle : t.routes.knownBarriers;
          const unknownLabel =
            unknownCount === 1 ? t.routes.unknownConditionSingle : t.routes.unknownConditions;

          return (
            <li key={route.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderWidth: isHighlighted ? 2 : 1,
                  borderColor: isHighlighted ? "primary.main" : "divider",
                }}
              >
                <CardActionArea
                  onClick={() =>
                    void navigate({ to: "/route/$routeId", params: { routeId: route.id } })
                  }
                  sx={{ p: 2 }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <RatingBadge rating={rating} />
                        <h2 className="text-base font-bold text-foreground">{routeName}</h2>
                      </div>
                      <ChevronRight
                        className="mt-1 size-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-foreground">
                      <span className="inline-flex items-center gap-1.5 font-mono font-semibold">
                        <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                        {route.minutes} {t.routes.minutesShort}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono font-semibold">
                        <Ruler className="size-4 text-muted-foreground" aria-hidden="true" />
                        {route.distanceM} {t.routes.metersShort}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldAlert className="size-4 text-rating-avoid" aria-hidden="true" />
                        {knownBarrierCount} {barrierLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <HelpCircle className="size-4 text-unknown" aria-hidden="true" />
                        {unknownCount} {unknownLabel}
                      </span>
                    </div>
                  </div>
                </CardActionArea>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}