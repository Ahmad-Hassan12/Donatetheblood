"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

const PIN_ICON = divIcon({
  className: "",
  html: `<div style="width:30px;height:38px;filter:drop-shadow(0 6px 10px rgba(10,10,10,0.3))"><svg viewBox="0 0 28 36" width="30" height="38"><path d="M14 2C20.4 9.6 23.6 13.6 23.6 18.6A9.6 9.6 0 1 1 4.4 18.6C4.4 13.6 7.6 9.6 14 2Z" fill="#d91c2b" stroke="#ffffff" stroke-width="2"/></svg></div>`,
  iconSize: [30, 38],
  iconAnchor: [15, 38],
});

function Recenter({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface LocationPinMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

export default function LocationPinMap({
  latitude,
  longitude,
  onChange,
}: LocationPinMapProps) {
  // react-leaflet v5 + React 19 renders TileLayer before the map container has
  // been attached to the DOM, so leaflet tries to append tiles to an
  // undefined pane ("Cannot read properties of undefined (reading
  // 'appendChild')"). Only mount the map once React has committed a frame and
  // the container definitely exists with a size.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const lat = latitude ?? 24.8607;
  const lng = longitude ?? 67.0011;

  if (!ready) {
    return <div className="bb-map h-64 w-full rounded-2xl" />;
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      className="bb-map h-64 w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={lat} lng={lng} />
      <Marker
        position={[lat, lng]}
        icon={PIN_ICON}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target as { getLatLng: () => { lat: number; lng: number } };
            const p = marker.getLatLng();
            onChange(p.lat, p.lng);
          },
        }}
      />
    </MapContainer>
  );
}