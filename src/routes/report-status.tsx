import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { CheckCircle2, Info, RotateCcw } from "lucide-react";
import { useWay2fast } from "@/lib/way2fastContext";

export const Route = createFileRoute("/report-status")({
  head: () => ({
    meta: [
      { title: "Report status — Way2fast" },
      {
        name: "description",
        content: "Track the prototype status stages of a demo barrier report.",
      },
      { property: "og:title", content: "Report status — Way2fast" },
      {
        property: "og:description",
        content: "Track the prototype status stages of a demo barrier report.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportStatusScreen,
});

function ReportStatusScreen() {
  const { t, submittedReport, setReportStatusStep, announce } = useWay2fast();
  const navigate = useNavigate();

  const activeStep = submittedReport?.statusStep ?? 0;
  const stepLabel = t.status.steps[activeStep] ?? t.status.steps[0];
  const totalSteps = t.status.steps.length;
  const statusAnnouncement = `${t.status.currentStepAnnouncement}: ${stepLabel} (${activeStep + 1} ${t.status.stepOf} ${totalSteps})`;

  useEffect(() => {
    announce(statusAnnouncement);
  }, [announce, statusAnnouncement]);

  const canAdvance = activeStep < totalSteps - 1;

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t.status.title}</h1>
      </div>

      <div
        role="note"
        className="flex items-start gap-2.5 rounded-xl border-2 border-demo-border bg-demo-bg p-3.5 text-sm font-bold text-demo-fg"
      >
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <span>{t.status.prototypeNote}</span>
      </div>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex items-center gap-2 rounded-xl border border-rating-easy bg-rating-easy-bg px-3.5 py-2.5 text-sm font-bold text-rating-easy"
      >
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        <span>{statusAnnouncement}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <Stepper activeStep={activeStep} orientation="vertical">
          {t.status.steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel
                slotProps={{
                  label: {
                    "aria-current": index === activeStep ? "step" : undefined,
                  },
                }}
              >
                <span
                  className={
                    index === activeStep
                      ? "font-bold text-foreground"
                      : "font-medium text-muted-foreground"
                  }
                >
                  {label}
                </span>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="mt-4 flex flex-wrap gap-2">
          {canAdvance ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setReportStatusStep(activeStep + 1)}
            >
              {t.status.nextStage}
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RotateCcw className="size-4" aria-hidden="true" />}
              onClick={() => setReportStatusStep(0)}
            >
              {t.status.resetStages}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-1.5 rounded-xl border border-border bg-card p-4 text-sm">
        <h2 className="text-sm font-bold text-foreground">{t.status.summaryHeading}</h2>
        {submittedReport && submittedReport.description ? (
          <>
            <p className="font-semibold text-foreground">
              {t.report.types[submittedReport.barrierType]}
            </p>
            <p className="text-foreground">{submittedReport.description}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {submittedReport.coords[0].toFixed(5)}, {submittedReport.coords[1].toFixed(5)}
              {submittedReport.photoName ? ` · ${submittedReport.photoName}` : ""}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">{t.status.noReportYet}</p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => void navigate({ to: "/routes" })}
        >
          {t.status.backToRoutes}
        </Button>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={() => void navigate({ to: "/report" })}
        >
          {t.status.newReport}
        </Button>
      </div>
    </section>
  );
}