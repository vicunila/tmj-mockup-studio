import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { i18n, type Language } from "@/data/i18n";
import {
  DEFAULT_PROFILE_BY_AID,
  type MobilityAid,
  type MobilityProfile,
} from "@/lib/routeRating";

export type BarrierReportType =
  | "no_dropped_kerb"
  | "cobblestones"
  | "steep_slope"
  | "snow_ice"
  | "blocked_path";

export interface SubmittedReport {
  barrierType: BarrierReportType;
  description: string;
  photoName: string | null;
  coords: [number, number];
  statusStep: number;
}

interface Way2fastContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof i18n)[Language];
  profile: MobilityProfile;
  setAid: (aid: MobilityAid) => void;
  updateProfile: (patch: Partial<MobilityProfile>) => void;
  selectedDestinationId: string;
  setSelectedDestinationId: (id: string) => void;
  submittedReport: SubmittedReport | null;
  submitReport: (report: Omit<SubmittedReport, "statusStep">) => void;
  setReportStatusStep: (step: number) => void;
  liveMessage: string;
  announce: (message: string) => void;
}

const Way2fastContext = createContext<Way2fastContextValue | null>(null);

const way2fastMuiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0B5E73",
      dark: "#084858",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#3D4F61",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#A82424",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#945200",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#006B5E",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#EEF2F6",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#102030",
      secondary: "#3D4F61",
    },
    divider: "#C8D2DC",
  },
  typography: {
    fontFamily: '"Atkinson Hyperlegible Next", "Atkinson Hyperlegible", system-ui, sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          paddingInline: 16,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          minWidth: 44,
          fontWeight: 700,
          color: "#102030",
          borderColor: "#8FA0B2",
          "&.Mui-selected": {
            backgroundColor: "#0B5E73",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#084858",
            },
          },
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minHeight: 56,
          minWidth: 64,
          color: "#3D4F61",
          "&.Mui-selected": {
            color: "#0B5E73",
            fontWeight: 700,
          },
        },
      },
    },
  },
});

export function Way2fastProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [profile, setProfile] = useState<MobilityProfile>(
    DEFAULT_PROFILE_BY_AID.manual_wheelchair,
  );
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>("dest-shop");
  const [submittedReport, setSubmittedReport] = useState<SubmittedReport | null>(null);
  const [liveMessage, setLiveMessage] = useState<string>("");

  const announce = useCallback((message: string) => {
    setLiveMessage("");
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => setLiveMessage(message));
    } else {
      setLiveMessage(message);
    }
  }, []);

  const setLang = useCallback(
    (next: Language) => {
      setLangState(next);
      if (typeof document !== "undefined") {
        document.documentElement.lang = next;
      }
      announce(next === "et" ? "Keel muudetud: eesti" : "Language changed to English");
    },
    [announce],
  );

  const setAid = useCallback((aid: MobilityAid) => {
    setProfile(DEFAULT_PROFILE_BY_AID[aid]);
  }, []);

  const updateProfile = useCallback((patch: Partial<MobilityProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const submitReport = useCallback((report: Omit<SubmittedReport, "statusStep">) => {
    setSubmittedReport({ ...report, statusStep: 0 });
  }, []);

  const setReportStatusStep = useCallback((step: number) => {
    setSubmittedReport((prev) =>
      prev
        ? { ...prev, statusStep: step }
        : {
            barrierType: "no_dropped_kerb",
            description: "",
            photoName: null,
            coords: [59.4368, 24.7491],
            statusStep: step,
          },
    );
  }, []);

  const value = useMemo<Way2fastContextValue>(
    () => ({
      lang,
      setLang,
      t: i18n[lang],
      profile,
      setAid,
      updateProfile,
      selectedDestinationId,
      setSelectedDestinationId,
      submittedReport,
      submitReport,
      setReportStatusStep,
      liveMessage,
      announce,
    }),
    [
      lang,
      setLang,
      profile,
      setAid,
      updateProfile,
      selectedDestinationId,
      submittedReport,
      submitReport,
      setReportStatusStep,
      liveMessage,
      announce,
    ],
  );

  return (
    <ThemeProvider theme={way2fastMuiTheme}>
      <Way2fastContext.Provider value={value}>{children}</Way2fastContext.Provider>
    </ThemeProvider>
  );
}

export function useWay2fast(): Way2fastContextValue {
  const ctx = useContext(Way2fastContext);
  if (!ctx) {
    throw new Error("useWay2fast must be used within Way2fastProvider");
  }
  return ctx;
}