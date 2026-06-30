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
              <div className="flex items-start justify-center cursor-pointer transition-transform drop-shadow-md">
                <div className="relative">
                  <svg
                    width="36"
                    height="44"
                    viewBox="0 0 42 50"
                    fill="none"
                  >
                    <path
                      d="M21 1C12.72 1 6 7.72 6 16c0 10.5 15 33 15 33s15-22.5 15-33c0-8.28-6.72-15-15-15z"
                      fill="#ff5a5f"
                    />
                    <circle cx="21" cy="15" r="10" fill="white" />
                  </svg>
                  <span className="absolute start-0 end-0 top-[5px] h-5 flex items-center justify-center text-sm font-bold text-primary leading-none">
                    {pointCount}
                  </span>
                </div>
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
                "relative flex items-start justify-center cursor-pointer transition-transform drop-shadow-md",
                isSelected && "scale-110 z-10 drop-shadow-lg"
              )}
            >
              <div className="relative">
                <svg
                  width="36"
                  height="44"
                  viewBox="0 0 42 50"
                  fill="none"
                >
                  <defs>
                    <clipPath id={`mc-${markerId}`}>
                      <circle cx="21" cy="15" r="9" />
                    </clipPath>
                  </defs>
                  <path
                    d="M21 1C12.72 1 6 7.72 6 16c0 10.5 15 33 15 33s15-22.5 15-33c0-8.28-6.72-15-15-15z"
                    fill={isSelected ? "#ff5a5f" : "#ffffff"}
                    stroke={isSelected ? "#ff5a5f" : "#d1d5db"}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="21"
                    cy="15"
                    r="9"
                    fill={isSelected ? "#ffffff" : "#f3f4f6"}
                    stroke={isSelected ? "#ff5a5f" : "#d1d5db"}
                    strokeWidth="1.5"
                  />
                  {location.logo ? (
                    <image
                      href={location.logo}
                      x="12"
                      y="6"
                      width="18"
                      height="18"
                      clipPath={`url(#mc-${markerId})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  ) : (
                    <circle cx="21" cy="15" r="5" fill={isSelected ? "#ffffff" : "#FF5A5F"} />
                  )}
                </svg>
              </div>
            </div>
          </Marker>
        );
      })}
    </>
  );
}
