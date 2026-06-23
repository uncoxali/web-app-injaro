"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import Map, { type MapRef, type ViewStateChangeEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { useMapStore } from "@/store/map";
import { MarkersLayer } from "./markers-layer";
import { MAP_CAMERA_PADDING } from "@/lib/map-utils";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const LIGHT_STYLE = "mapbox://styles/mapbox/light-v11";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

interface MapboxMapProps {
  onLoad?: () => void;
}

export function MapboxMap({ onLoad }: MapboxMapProps) {
  const mapRef = useRef<MapRef>(null);
  const viewState = useMapStore((s) => s.viewState);
  const setViewState = useMapStore((s) => s.setViewState);
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const mapStyle = !mounted
    ? LIGHT_STYLE
    : resolvedTheme === "dark"
      ? DARK_STYLE
      : LIGHT_STYLE;

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, [setUserLocation]);

  const handleMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState({
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
      });
    },
    [setViewState]
  );

  const flyToTarget = useMapStore((s) => s.flyToTarget);
  const setFlyToTarget = useMapStore((s) => s.setFlyToTarget);
  const fitBoundsTarget = useMapStore((s) => s.fitBoundsTarget);
  const setFitBoundsTarget = useMapStore((s) => s.setFitBoundsTarget);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!flyToTarget) return;
    if (!mapRef.current && !mapLoaded) return;

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [flyToTarget.longitude, flyToTarget.latitude],
        zoom: flyToTarget.zoom ?? 14,
        duration: 800,
      });
      setFlyToTarget(null);
    }
  }, [flyToTarget, setFlyToTarget, mapLoaded]);

  useEffect(() => {
    if (!fitBoundsTarget) return;
    if (!mapRef.current && !mapLoaded) return;

    if (mapRef.current) {
      mapRef.current.fitBounds(fitBoundsTarget, {
        padding: MAP_CAMERA_PADDING,
        duration: 800,
      });
      setFitBoundsTarget(null);
    }
  }, [fitBoundsTarget, setFitBoundsTarget, mapLoaded]);

  const handleLoad = useCallback(() => {
    setMapLoaded(true);
    onLoad?.();
  }, [onLoad]);

  if (!TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface px-6 text-center text-sm text-text-secondary">
        توکن Mapbox تنظیم نشده است.
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={TOKEN}
      {...viewState}
      onMove={handleMove}
      onLoad={handleLoad}
      mapStyle={mapStyle}
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
      reuseMaps
      minZoom={9}
      maxZoom={18}
      scrollZoom
      dragRotate={false}
      touchZoomRotate
      doubleClickZoom
    >
      <MarkersLayer />
    </Map>
  );
}
