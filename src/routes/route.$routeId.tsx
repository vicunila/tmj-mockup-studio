import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import { Flag, HelpCircle, ShieldAlert, Snowflake } from "lucide-react";
import { RatingBadge } from "@/components/RatingBadge";
import { useWay2fast } from "@/lib/way2fastContext";
import { evaluateRoute, isAlertExpired, routesData } from "@/lib/routeRating";

export const Route = createFileRoute("/route/$routeId")({
  head: () => ({
    meta: [
      { title: "Route detail — Way2fast" },
      {
        name: "description",
        content: "Step-by-step surface, slope, barrier, unknown condition, and winter alert details.",
      },
      { property: "og:title", content: "Route detail — Way2fast" },
      {
        property: "og:description",
        content: "Step-by-step surface, slope, barrier, unknown condition, and winter alert details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RouteDetailScreen,
});

function RouteDetailScreen() {
  const { routeId } = Route.useParams();
  const { lang, t, profile } = useWay2fast();
  const navigate = useNavigate();

  const route = useMemo(
    () => routesData.routes.find((r) => r.id === routeId),
    [routeId],
  );

  const routeAlerts = useMemo(
    () => routesData.alerts.filter((a) => a.routeId === routeId),
    [routeId],
  );

  if (!route) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t.detail.notFound}</h1>
        <Button variant="contained" onClick={() => void navigate({ to: "/routes" })}>
          {t.detail.backToRoutes}
        </Button>
      </section>
    );
  }

  const evaluated = evaluateRoute(route, profile);
  const routeName = lang === "et" ? route.nameEt : route.name;

  return (
    <section className="space-y-5">
      <div className="space-y-2 border-b border-border pb-4">
        <RatingBadge rating={evaluated.rating} />
        <h1 className="text-2xl font-bold text-foreground">{routeName}</h1>
        <p className="font-mono text-sm text-muted-foreground">
          {route.minutes} {t.routes.minutesShort} · {route.distanceM} {t.routes.metersShort}
        </p>
      </div>

      <section aria-labelledby="alerts-heading" className="space-y-2.5">
        <h2 id="alerts-heading" className="text-base font-bold text-foreground">
          {t.detail.alertsHeading}
        </h2>

        {routeAlerts.map((alert) => {
          const expired = isAlertExpired(alert.validUntil);
          const text = lang === "et" ? alert.textEt : alert.text;

          return (
            <div
              key={alert.id}
              role="note"
              className={`rounded-xl border p-3.5 text-sm ${
                expired
                  ? "border-border bg-muted text-muted-foreground"
                  : "border-rating-manageable bg-rating-manageable-bg text-foreground"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                  <Snowflake className="size-4 shrink-0" aria-hidden="true" />
                  {expired ? t.detail.expired : t.detail.activeAlert}
                </span>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${
                    expired
                      ? "border border-border bg-background text-muted-foreground"
                      : "bg-rating-manageable text-primary-foreground"
                  }`}
                >
                  {expired
                    ? `${t.detail.expired} (${alert.validUntil})`
                    : `${t.detail.validUntil} ${alert.validUntil}`}
                </span>
              </div>
              <p className={expired ? "line-through" : "font-medium"}>{text}</p>
            </div>
          );
        })}
      </section>

      <section aria-labelledby="steps-heading" className="space-y-3">
        <h2 id="steps-heading" className="text-base font-bold text-foreground">
          {t.detail.stepsHeading}
        </h2>

        <ol className="space-y-3 list-none p-0 m-0">
          {route.steps.map((step, index) => {
            const stepText = lang === "et" ? step.textEt : step.text;
            const barrierText = step.barrier
              ? lang === "et"
                ? step.barrier.labelEt
                : step.barrier.label
              : null;
            const unknownLabel = step.unknown
              ? lang === "et"
                ? step.unknownTextEt ?? `${t.detail.unknownPrefix}: ülekäigu seisukord pole kontrollitud`
                : step.unknownText ?? `${t.detail.unknownPrefix}: crossing condition not verified`
              : null;

            return (
              <li
                key={`${route.id}-step-${index}`}
                className="space-y-2 rounded-xl border border-border bg-card p-3.5"
              >
                <div className="flex items-start gap-2.5">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-secondary-foreground">
                    {index + 1}
                  </span>
                  <p className="text-sm font-bold text-foreground">{stepText}</p>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 pl-8 text-xs text-foreground">
                  <span className="font-mono font-semibold">
                    {step.distanceM} {t.routes.metersShort}
                  </span>
                  <span>
                    {t.detail.surfaceLabel}: <strong>{t.detail.surfaces[step.surface]}</strong>
                  </span>
                  <span className="font-mono">
                    {t.detail.slopeLabel}: <strong>{step.slopePct}%</strong>
                  </span>
                </div>

                {barrierText && (
                  <div className="ml-8 flex items-start gap-2 rounded-lg border border-rating-avoid bg-rating-avoid-bg px-2.5 py-2 text-xs font-semibold text-rating-avoid">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      {t.detail.reportedBarrier}: {barrierText}
                    </span>
                  </div>
                )}

                {unknownLabel && (
                  <div className="ml-8 flex items-start gap-2 rounded-lg border border-unknown bg-unknown-bg px-2.5 py-2 text-xs font-semibold text-unknown">
                    <HelpCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>{unknownLabel}</span>
                  </div>
                )}

                <p className="pl-8 text-xs text-muted-foreground">
                  {t.detail.lastChecked}:{" "}
                  <span className="font-mono">{step.lastChecked}</span> · {t.detail.sourceLabel}:{" "}
                  {t.detail.sources[step.source]}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<Flag className="size-5" aria-hidden="true" />}
        onClick={() => void navigate({ to: "/report" })}
      >
        {t.detail.reportBarrierCta}
      </Button>
    </section>
  );
}