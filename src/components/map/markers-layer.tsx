"use client";

import { useMemo, useCallback } from "react";
import { Marker, type MapGeoJSONFeature } from "react-map-gl/mapbox";
import Supercluster from "supercluster";
import { useMapStore, type Location } from "@/store/map";
import { cn } from "@/lib/utils";

const clusterRadius = 50;
const maxZoom = 14;

interface GeoJSONFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: Location & { cluster?: boolean; cluster_id?: number; point_count?: number };
}

export function MarkersLayer() {
  const markers = useMapStore((s) => s.markers);
  const viewState = useMapStore((s) => s.viewState);
  const selectedLocationId = useMapStore((s) => s.selectedLocationId);
  const selectLocation = useMapStore((s) => s.selectLocation);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);
  const setSheetOpen = useMapStore((s) => s.setSheetOpen);
  const clusteringEnabled = useMapStore((s) => s.clusteringEnabled);

  const supercluster = useMemo(() => {
    if (!clusteringEnabled) return null;

    const index = new Supercluster<Location, Record<string, unknown>>({
      radius: clusterRadius,
      maxZoom: maxZoom - 1,
    });

    const features: GeoJSONFeature[] = markers.map((m) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [m.longitude, m.latitude],
      },
      properties: { ...m },
    }));

    index.load(features as any);
    return index;
  }, [markers, clusteringEnabled]);

  const clusters = useMemo(() => {
    if (!supercluster) return [];

    const bbox: [number, number, number, number] = [
      viewState.longitude - 1,
      viewState.latitude - 1,
      viewState.longitude + 1,
      viewState.latitude + 1,
    ];

    return supercluster.getClusters(bbox, Math.floor(viewState.zoom)) as any[];
  }, [supercluster, viewState]);

  const handleMarkerClick = useCallback(
    (location: Location) => {
      selectLocation(location.id);
      setSelectedLocation(location);
      setSheetOpen(true);
    },
    [selectLocation, setSelectedLocation, setSheetOpen]
  );

  const handleClusterClick = useCallback(
    (clusterId: number, longitude: number, latitude: number) => {
      if (!supercluster) return;
      const expansionZoom = supercluster.getClusterExpansionZoom(clusterId);
      useMapStore.getState().setViewState({
        latitude,
        longitude,
        zoom: Math.min(expansionZoom, maxZoom),
      });
    },
    [supercluster]
  );

  const items = clusters.length > 0 ? clusters : markers;

  return (
    <>
      {items.map((item: any) => {
        const props = item.properties || item;
        const coords = item.geometry
          ? item.geometry.coordinates
          : [item.longitude, item.latitude];

        if (props.cluster) {
          const pointCount = props.point_count || 0;
          return (
            <Marker
              key={`cluster-${props.cluster_id}`}
              longitude={coords[0]}
              latitude={coords[1]}
              onClick={() =>
                handleClusterClick(props.cluster_id, coords[0], coords[1])
              }
            >
              <div
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-full bg-primary text-white text-sm font-bold shadow-lg cursor-pointer",
                  "bg-gradient-to-br from-primary to-primary/70"
                )}
              >
                {pointCount}
              </div>
            </Marker>
          );
        }

        const location = props as Location;
        const isSelected = selectedLocationId === location.id;
        const markerId = location.slug || String(location.id);

        return (
          <Marker
            key={markerId}
            longitude={coords[0]}
            latitude={coords[1]}
            onClick={() => handleMarkerClick(location)}
          >
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-full shadow-md cursor-pointer transition-transform",
                "bg-background border-2",
                isSelected
                  ? "border-primary scale-110 shadow-lg shadow-primary/20"
                  : "border-border hover:scale-105"
              )}
            >
              {location.logo ? (
                <img
                  src={location.logo}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#FF5A5F"
                  stroke="none"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" fill="white" />
                </svg>
              )}
            </div>
          </Marker>
        );
      })}
    </>
  );
}
