"use client";

import { useEffect, useMemo } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import type { DonorSearchResult } from "@/lib/search-types";
import { displayName } from "@/lib/search-utils";

const PIN_SVG = `<svg viewBox="0 0 28 36"><path d="M14 2C20.4 9.6 23.6 13.6 23.6 18.6A9.6 9.6 0 1 1 4.4 18.6C4.4 13.6 7.6 9.6 14 2Z"/></svg>`;

function makePin(verified: boolean) {
  return divIcon({
    className: "",
    html: `<div class="bb-pin ${verified ? "bb-pin--verified" : "bb-pin--ghost"}">${PIN_SVG}</div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -34],
  });
}

const USER_ICON = divIcon({
  className: "",
  html: `<div class="bb-user"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -16],
});

interface DonorMapViewProps {
  donors: DonorSearchResult[];
  center: { latitude: number; longitude: number };
  zoom: number;
  radiusKm: number;
  locateText?: string;
}

function RecenterView({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng] as LatLngExpression, zoom, { animate: true });
  }, [lat, lng, zoom, map]);

  return null;
}

export default function DonorMapView({
  donors,
  center,
  zoom,
  radiusKm,
  locateText,
}: DonorMapViewProps) {
  const markers = useMemo(
    () =>
      donors
        .filter(
          (d): d is DonorSearchResult & { latitude: number; longitude: number } =>
            d.latitude !== null && d.longitude !== null
        )
        .map((donor) => ({
          donor,
          icon: makePin(donor.isVerified),
        })),
    [donors]
  );

  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={zoom}
      scrollWheelZoom
      className="bb-map h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterView lat={center.latitude} lng={center.longitude} zoom={zoom} />

      <Circle
        center={[center.latitude, center.longitude]}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#d91c2b",
          weight: 2,
          fillColor: "#d91c2b",
          fillOpacity: 0.06,
        }}
      />

      <Marker
        position={[center.latitude, center.longitude]}
        icon={USER_ICON}
        zIndexOffset={500}
      >
        <Popup>
          <span className="text-sm font-medium">
            {locateText || "Your search location"}
          </span>
        </Popup>
      </Marker>

      {markers.map(({ donor, icon }) => (
        <Marker
          key={donor.id}
          position={[donor.latitude, donor.longitude]}
          icon={icon}
          zIndexOffset={1000}
        >
          <Popup>
            <div className="flex items-center gap-2 text-sm">
              <span className="grid h-6 w-8 place-items-center rounded bg-blood text-[11px] font-bold text-white">
                {donor.bloodGroup}
              </span>
              <span className="font-medium">{displayName(donor.name)}</span>
              {donor.isVerified && <span className="text-emerald-600">Verified</span>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}