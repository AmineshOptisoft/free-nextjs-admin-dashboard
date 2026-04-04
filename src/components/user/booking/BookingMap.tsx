"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icons
const pickupIcon = L.divIcon({
  html: `<div class="p-1 bg-gray-900 rounded-full border-2 border-white shadow-xl"><div class="h-4 w-4 text-white flex items-center justify-center font-bold text-[10px]">P</div></div>`,
  className: "custom-div-icon",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const dropIcon = L.divIcon({
  html: `<div class="p-1 bg-brand-500 rounded-full border-2 border-white shadow-xl"><div class="h-4 w-4 text-white flex items-center justify-center font-bold text-[10px]">D</div></div>`,
  className: "custom-div-icon",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const riderIcon = L.divIcon({
  html: `<div class="relative"><div class="h-8 w-8 rounded-full bg-brand-50 border-2 border-brand-500 shadow-lg flex items-center justify-center text-lg">🛵</div></div>`,
  className: "custom-div-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map Controller for Zoom and Route
function MapController({ pickup, drop, riders }: any) {
  const map = useMap();
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    // 1. Zoom bounds
    const points: [number, number][] = [];
    if (pickup) points.push(pickup);
    if (drop) points.push(drop);

    if (points.length > 0) {
      if (points.length === 1 && !drop) {
          // just center pickup with 14 zoom
          map.setView(points[0], 14, { animate: true });
      } else {
          const bounds = L.latLngBounds(points);
          map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // 2. Fetch OSRM Route if both exist
    if (pickup && drop) {
        async function fetchRoute() {
            try {
            const start = `${pickup[1]},${pickup[0]}`;
            const end = `${drop[1]},${drop[0]}`;
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=simplified&geometries=geojson`);
            const data = await res.json();
            if (data.routes && data.routes[0]) {
                const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
                setRoute(coords);
            }
            } catch (err) {
            console.error("Routing error:", err);
            }
        }
        fetchRoute();
    } else {
        setRoute([]);
    }
  }, [pickup, drop, map]);

  return (
    <>
      {route.length > 0 && (
        <Polyline positions={route} pathOptions={{ color: "#111827", weight: 4, opacity: 0.8, dashArray: '1, 8' }} />
      )}
    </>
  );
}

interface BookingMapProps {
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
}

export default function BookingMap({ pickupLat, pickupLng, dropLat, dropLng }: BookingMapProps) {
  const [riders, setRiders] = useState<any[]>([]);

  useEffect(() => {
    // Fetch nearby riders (active riders to show on map)
    fetch('/api/riders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
           // filter active status riders
           const activeRiders = data.filter(r => r.status === 0 || r.status === "active" || r.status === "ACTIVE" || r.status === 0);
           setRiders(activeRiders);
        }
      })
      .catch(() => {});
  }, []);

  const pickup: [number, number] | null = (!isNaN(Number(pickupLat)) && !isNaN(Number(pickupLng))) 
      ? [Number(pickupLat), Number(pickupLng)] 
      : null;
      
  const drop: [number, number] | null = (!isNaN(Number(dropLat)) && !isNaN(Number(dropLng))) 
      ? [Number(dropLat), Number(dropLng)] 
      : null;

  // Default center if no pickup/drop (e.g., Jaipur)
  const defaultCenter: [number, number] = [26.9124, 75.7873]; 

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={pickup || defaultCenter} 
        zoom={pickup ? 14 : 12} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pickup && <Marker position={pickup} icon={pickupIcon} />}
        {drop && <Marker position={drop} icon={dropIcon} />}

        {/* Render active riders near the map center */}
        {riders.map((r, i) => {
            // Ideally riders have lat/lng. If missing, we skip or mock around pickup for demo
            let rLat = r.latitude;
            let rLng = r.longitude;

            // If real lat/lng is missing in db, we mock them slightly around the pickup point so the user sees riders
            if (!rLat && pickup) {
                // Add tiny random offset (e.g. ~ 500m)
                rLat = pickup[0] + (Math.random() - 0.5) * 0.01;
                rLng = pickup[1] + (Math.random() - 0.5) * 0.01;
            }

            if (rLat && rLng) {
                return <Marker key={r.id || i} position={[rLat, rLng]} icon={riderIcon} />
            }
            return null;
        })}

        <MapController pickup={pickup} drop={drop} riders={riders} />
      </MapContainer>
    </div>
  );
}
