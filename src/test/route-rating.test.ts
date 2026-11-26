import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROFILE_BY_AID,
  evaluateRoute,
  isAlertExpired,
  routesData,
} from "@/lib/routeRating";

describe("Way2fast route rating rules", () => {
  it("rates the three Solaris Food Store routes as Easy, Manageable, and Avoid for a manual wheelchair", () => {
    const shopRoutes = routesData.routes.filter((r) => r.destinationId === "dest-shop");
    expect(shopRoutes).toHaveLength(3);

    const ratings = shopRoutes.map(
      (r) => evaluateRoute(r, DEFAULT_PROFILE_BY_AID.manual_wheelchair).rating,
    );
    expect(ratings).toEqual(["easy", "manageable", "avoid"]);
  });

  it("changes route ratings when the mobility profile changes", () => {
    const sideStreet = routesData.routes.find((r) => r.id === "shop-side-street");
    const parkPath = routesData.routes.find((r) => r.id === "shop-park");
    const boulevard = routesData.routes.find((r) => r.id === "shop-boulevard");
    expect(sideStreet).toBeDefined();
    expect(parkPath).toBeDefined();
    expect(boulevard).toBeDefined();

    if (!sideStreet || !parkPath || !boulevard) return;

    // Manual wheelchair avoids cobblestones + missing dropped kerb + max slope 6%
    expect(evaluateRoute(sideStreet, DEFAULT_PROFILE_BY_AID.manual_wheelchair).rating).toBe(
      "avoid",
    );
    expect(evaluateRoute(parkPath, DEFAULT_PROFILE_BY_AID.manual_wheelchair).rating).toBe(
      "manageable",
    );

    // Switching to cane (9% slope, cobblestones & kerb toggles off) improves both routes
    expect(evaluateRoute(sideStreet, DEFAULT_PROFILE_BY_AID.cane).rating).toBe("easy");
    expect(evaluateRoute(parkPath, DEFAULT_PROFILE_BY_AID.cane).rating).toBe("easy");

    // Lowering max slope to 3% raises the boulevard route (which has a 4% segment) from easy to manageable
    expect(
      evaluateRoute(boulevard, {
        ...DEFAULT_PROFILE_BY_AID.manual_wheelchair,
        maxSlopePct: 3,
      }).rating,
    ).toBe("manageable");
  });

  it("distinguishes active winter alerts from expired alerts", () => {
    expect(isAlertExpired("2026-12-18", "2026-11-26")).toBe(false);
    expect(isAlertExpired("2026-11-05", "2026-11-26")).toBe(true);
  });

  it("ensures every route has at least one unknown condition step and both active and expired alerts", () => {
    for (const route of routesData.routes) {
      const hasUnknown = route.steps.some((step) => step.unknown === true);
      expect(hasUnknown).toBe(true);

      const routeAlerts = routesData.alerts.filter((a) => a.routeId === route.id);
      expect(routeAlerts.some((a) => !isAlertExpired(a.validUntil))).toBe(true);
      expect(routeAlerts.some((a) => isAlertExpired(a.validUntil))).toBe(true);
    }
  });
});