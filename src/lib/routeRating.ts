import routesJson from "@/data/routes.json";

export type MobilityAid =
  | "manual_wheelchair"
  | "electric_wheelchair"
  | "cane"
  | "crutches"
  | "stroller";

export type SurfaceType = "asphalt" | "paving" | "cobblestones" | "gravel";
export type SourceType = "field survey" | "community report";
export type RouteRating = "easy" | "manageable" | "avoid";
export type DestinationCategory = "shop" | "clinic" | "tram" | "library";

export interface MobilityProfile {
  aid: MobilityAid;
  maxSlopePct: number;
  avoidCobblestones: boolean;
  avoidNoDroppedKerb: boolean;
}

export interface StepBarrier {
  label: string;
  labelEt: string;
  maxSlopeOk?: number;
  surface?: SurfaceType;
  noDroppedKerb?: boolean;
}

export interface RouteStep {
  text: string;
  textEt: string;
  distanceM: number;
  slopePct: number;
  surface: SurfaceType;
  barrier?: StepBarrier;
  lastChecked: string;
  source: SourceType;
  unknown?: boolean;
  unknownText?: string;
  unknownTextEt?: string;
}

export interface DemoDestination {
  id: string;
  name: string;
  nameEt: string;
  category: DestinationCategory;
  address: string;
  coords: [number, number];
}

export interface DemoRoute {
  id: string;
  destinationId: string;
  name: string;
  nameEt: string;
  minutes: number;
  distanceM: number;
  polyline: [number, number][];
  steps: RouteStep[];
}

export interface DemoAlert {
  id: string;
  routeId: string;
  text: string;
  textEt: string;
  validUntil: string;
}

export interface RoutesDataset {
  origin: { name: string; coords: [number, number] };
  destinations: DemoDestination[];
  routes: DemoRoute[];
  alerts: DemoAlert[];
}

export const routesData = routesJson as unknown as RoutesDataset;

export const DEFAULT_PROFILE_BY_AID: Record<MobilityAid, MobilityProfile> = {
  manual_wheelchair: {
    aid: "manual_wheelchair",
    maxSlopePct: 6,
    avoidCobblestones: true,
    avoidNoDroppedKerb: true,
  },
  electric_wheelchair: {
    aid: "electric_wheelchair",
    maxSlopePct: 8,
    avoidCobblestones: false,
    avoidNoDroppedKerb: true,
  },
  cane: {
    aid: "cane",
    maxSlopePct: 9,
    avoidCobblestones: false,
    avoidNoDroppedKerb: false,
  },
  crutches: {
    aid: "crutches",
    maxSlopePct: 7,
    avoidCobblestones: true,
    avoidNoDroppedKerb: false,
  },
  stroller: {
    aid: "stroller",
    maxSlopePct: 8,
    avoidCobblestones: true,
    avoidNoDroppedKerb: true,
  },
};

export interface EvaluatedRoute {
  route: DemoRoute;
  rating: RouteRating;
  knownBarrierCount: number;
  unknownCount: number;
  maxSlopePct: number;
}

export function evaluateRoute(route: DemoRoute, profile: MobilityProfile): EvaluatedRoute {
  let severeHits = 0;
  let moderateHits = 0;
  let knownBarrierCount = 0;
  let unknownCount = 0;
  let maxSlopePct = 0;

  for (const step of route.steps) {
    if (step.slopePct > maxSlopePct) maxSlopePct = step.slopePct;
    if (step.unknown) unknownCount += 1;
    if (step.barrier) knownBarrierCount += 1;

    const isCobbles = step.surface === "cobblestones" || step.barrier?.surface === "cobblestones";
    const missingKerb = step.barrier?.noDroppedKerb === true;
    const slopeOverBy = step.slopePct - profile.maxSlopePct;
    const barrierSlopeExceeded =
      step.barrier?.maxSlopeOk !== undefined && profile.maxSlopePct < step.barrier.maxSlopeOk;

    if (
      slopeOverBy >= 3 ||
      (profile.avoidNoDroppedKerb && missingKerb) ||
      (profile.avoidCobblestones && isCobbles && slopeOverBy > 0)
    ) {
      severeHits += 1;
    } else if (
      slopeOverBy > 0 ||
      (profile.avoidCobblestones && isCobbles) ||
      barrierSlopeExceeded
    ) {
      moderateHits += 1;
    }
  }

  let rating: RouteRating = "easy";
  if (severeHits >= 1 || moderateHits >= 3) {
    rating = "avoid";
  } else if (moderateHits >= 1) {
    rating = "manageable";
  }

  return {
    route,
    rating,
    knownBarrierCount,
    unknownCount,
    maxSlopePct,
  };
}

export function isAlertExpired(validUntilIso: string, referenceDateIso = "2026-11-26"): boolean {
  return validUntilIso < referenceDateIso;
}

export const RATING_STYLE: Record<
  RouteRating,
  { stroke: string; dashArray?: string; weight: number }
> = {
  easy: { stroke: "#006B5E", weight: 6 },
  manageable: { stroke: "#945200", dashArray: "12 8", weight: 6 },
  avoid: { stroke: "#A82424", dashArray: "3 9", weight: 6 },
};