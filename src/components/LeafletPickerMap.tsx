import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

interface LeafletPickerMapProps {
  coords: [number, number];
  onChange: (next: [number, number]) => void;
  ariaLabel: string;
}

function MapClickAndSync({
  coords,
  onChange,
}: {
  coords: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  const map = useMap();

  useMapEvents({
    click(event) {
      const lat = Number(event.latlng.lat.toFixed(5));
      const lng = Number(event.latlng.lng.toFixed(5));
      onChange([lat, lng]);
    },
  });

  useEffect(() => {
    map.panTo(coords, { animate: false });
  }, [map, coords]);

  return null;
}

export default function LeafletPickerMap({
  coords,
  onChange,
  ariaLabel,
}: LeafletPickerMapProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="h-48 w-full overflow-hidden rounded-xl border border-border bg-muted"
    >
      <MapContainer
        center={coords}
        zoom={16}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickAndSync coords={coords} onChange={onChange} />
        <CircleMarker
          center={coords}
          radius={10}
          pathOptions={{ color: "#FFFFFF", fillColor: "#A82424", fillOpacity: 1, weight: 3 }}
        />
      </MapContainer>
    </div>
  );
}