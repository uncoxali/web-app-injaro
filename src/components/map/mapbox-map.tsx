"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import Map, { type MapRef, type ViewStateChangeEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { useMapStore } from "@/store/map";
import { MarkersLayer } from "./markers-layer";
import { MAP_CAMERA_PADDING } from "@/lib/map-utils";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const LIGHT_STYLE = "mapbox://styles/mapbox/streets-v12";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

function styleForTheme(theme: string | undefined) {
  return theme === "dark" ? DARK_STYLE : LIGHT_STYLE;
}

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
  const pendingViewState = useRef<typeof viewState | null>(null);
  const moveRaf = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

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
      pendingViewState.current = {
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
      };
      if (moveRaf.current !== null) return;
      moveRaf.current = requestAnimationFrame(() => {
        moveRaf.current = null;
        if (pendingViewState.current) {
          setViewState(pendingViewState.current);
        }
      });
    },
    [setViewState]
  );

  const flyToTarget = useMapStore((s) => s.flyToTarget);
  const setFlyToTarget = useMapStore((s) => s.setFlyToTarget);
  const fitBoundsTarget = useMapStore((s) => s.fitBoundsTarget);
  const setFitBoundsTarget = useMapStore((s) => s.setFitBoundsTarget);
  const [mapLoaded, setMapLoaded] = useState(false);
  const appliedThemeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!flyToTarget) return;
    if (!mapRef.current || !mapLoaded) return;

    mapRef.current.flyTo({
      center: [flyToTarget.longitude, flyToTarget.latitude],
      zoom: flyToTarget.zoom ?? 14,
      duration: 800,
    });
    setFlyToTarget(null);
  }, [flyToTarget, setFlyToTarget, mapLoaded]);

  useEffect(() => {
    if (!fitBoundsTarget) return;
    if (!mapRef.current || !mapLoaded) return;

    mapRef.current.fitBounds(fitBoundsTarget, {
      padding: MAP_CAMERA_PADDING,
      duration: 800,
    });
    setFitBoundsTarget(null);
  }, [fitBoundsTarget, setFitBoundsTarget, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !resolvedTheme) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const prev = appliedThemeRef.current;
    appliedThemeRef.current = resolvedTheme;
    if (prev === undefined || prev === resolvedTheme) return;

    map.setStyle(styleForTheme(resolvedTheme));
  }, [resolvedTheme, mapLoaded]);

  const handleLoad = useCallback(() => {
    setMapLoaded(true);
    appliedThemeRef.current = resolvedTheme;
    onLoad?.();
  }, [onLoad, resolvedTheme]);

  if (!TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface px-6 text-center text-sm text-text-secondary">
        توکن Mapbox تنظیم نشده است.
      </div>
    );
  }

  if (!mounted || !resolvedTheme) {
    return <div className="h-full w-full bg-background" />;
  }

  const mapStyle = styleForTheme(resolvedTheme);

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
