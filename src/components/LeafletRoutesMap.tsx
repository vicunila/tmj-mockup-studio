import { useEffect } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import {
  RATING_STYLE,
  type DemoDestination,
  type EvaluatedRoute,
} from "@/lib/routeRating";

interface LeafletRoutesMapProps {
  origin: { name: string; coords: [number, number] };
  destination: DemoDestination;
  evaluatedRoutes: EvaluatedRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  ariaLabel: string;
}

function FitRouteBounds({
  points,
}: {
  points: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [26, 26], maxZoom: 16 });
  }, [map, points]);

  return null;
}

export default function LeafletRoutesMap({
  origin,
  destination,
  evaluatedRoutes,
  selectedRouteId,
  onSelectRoute,
  ariaLabel,
}: LeafletRoutesMapProps) {
  const allPoints: [number, number][] = [
    origin.coords,
    destination.coords,
    ...evaluatedRoutes.flatMap((er) => er.route.polyline),
  ];

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="h-60 w-full overflow-hidden rounded-xl border border-border bg-muted"
    >
      <MapContainer
        center={[59.436, 24.749]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitRouteBounds points={allPoints} />

        {evaluatedRoutes.map(({ route, rating }) => {
          const style = RATING_STYLE[rating];
          const isSelected = selectedRouteId === route.id;
          return (
            <Polyline
              key={`${route.id}-${rating}-${isSelected ? "sel" : "std"}`}
              positions={route.polyline}
              pathOptions={{
                color: style.stroke,
                weight: isSelected ? style.weight + 2 : style.weight,
                opacity: isSelected ? 1 : 0.82,
                ...(style.dashArray ? { dashArray: style.dashArray } : {}),
              }}
              eventHandlers={{
                click: () => onSelectRoute(route.id),
              }}
            />
          );
        })}

        <CircleMarker
          center={origin.coords}
          radius={8}
          pathOptions={{ color: "#102030", fillColor: "#FFFFFF", fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            {origin.name}
          </Tooltip>
        </CircleMarker>

        <CircleMarker
          center={destination.coords}
          radius={9}
          pathOptions={{ color: "#FFFFFF", fillColor: "#0B5E73", fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            {destination.name}
          </Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}