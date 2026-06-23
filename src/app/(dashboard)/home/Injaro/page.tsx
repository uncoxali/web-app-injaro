"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useMapStore } from "@/store/map";
import { getLocations } from "@/lib/api/locations";
import {
  getLandingLocations,
  landingLocationToMarker,
  filterLandingLocations,
} from "@/lib/api/landing";
import type { Location } from "@/store/map";
import type { LandingLocation } from "@/lib/api/landing";
import { isTehranArea, TEHRAN_CENTER } from "@/lib/map-utils";
import { isAuthenticated } from "@/lib/auth-utils";
import { getCategories, type Category } from "@/lib/api/categories";
import dynamic from "next/dynamic";
import { SearchHeader } from "@/components/map/search-header";
import { CategorySelect } from "@/components/map/category-select";
import { LocationBottomSheet } from "@/components/map/location-bottom-sheet";
import { SponsorsFloating } from "@/components/map/sponsors-floating";

const MapboxMap = dynamic(
  () => import("@/components/map/mapbox-map").then((m) => m.MapboxMap),
  { ssr: false }
);

export default function InjaroHomePage() {
  const setMarkers = useMapStore((s) => s.setMarkers);
  const selectedMapCategory = useMapStore((s) => s.selectedMapCategory);
  const setSelectedMapCategory = useMapStore((s) => s.setSelectedMapCategory);
  const setFlyToTarget = useMapStore((s) => s.setFlyToTarget);
  const setFitBoundsTarget = useMapStore((s) => s.setFitBoundsTarget);
  const setClusteringEnabled = useMapStore((s) => s.setClusteringEnabled);

  const [categories, setCategories] = useState<Category[]>([]);
  const [guest, setGuest] = useState(() => !isAuthenticated());
  const landingLocationsRef = useRef<LandingLocation[]>([]);

  const doZoom = useCallback(
    (mapMarkers: Location[]) => {
      if (mapMarkers.length === 0) {
        setFlyToTarget({ ...TEHRAN_CENTER });
        return;
      }
      if (mapMarkers.length === 1) {
        setFlyToTarget({
          latitude: mapMarkers[0].latitude,
          longitude: mapMarkers[0].longitude,
          zoom: 14,
        });
        return;
      }
      const lngs = mapMarkers.map((m) => m.longitude);
      const lats = mapMarkers.map((m) => m.latitude);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      if (minLng === maxLng && minLat === maxLat) {
        setFlyToTarget({ latitude: minLat, longitude: minLng, zoom: 14 });
        return;
      }
      setFitBoundsTarget([[minLng, minLat], [maxLng, maxLat]]);
    },
    [setFlyToTarget, setFitBoundsTarget]
  );

  const applyMarkers = useCallback(
    (mapMarkers: Location[]) => {
      setMarkers(mapMarkers);
      doZoom(mapMarkers);
    },
    [setMarkers, doZoom]
  );

  const fetchGuestLocations = useCallback(
    async (search?: string) => {
      if (landingLocationsRef.current.length === 0) {
        landingLocationsRef.current = await getLandingLocations();
      }
      const filtered = filterLandingLocations(
        landingLocationsRef.current,
        search
      );
      return filtered
        .filter((loc) => isTehranArea(loc.latitude, loc.longitude))
        .map((loc, i) => landingLocationToMarker(loc, i + 1));
    },
    []
  );

  const fetchAuthLocations = useCallback(
    async (category?: number | null, search?: string) => {
      const deduped = await getLocations({
        category: category ?? undefined,
        search: search || undefined,
      });
      return deduped.filter((marker) =>
        isTehranArea(marker.latitude, marker.longitude)
      );
    },
    []
  );

  const fetchLocations = useCallback(
    async (category?: number | null, search?: string) => {
      const authed = isAuthenticated();
      setGuest(!authed);

      try {
        let mapMarkers: Location[];

        if (authed) {
          try {
            mapMarkers = await fetchAuthLocations(category, search);
          } catch {
            mapMarkers = await fetchGuestLocations(search);
          }
        } else {
          mapMarkers = await fetchGuestLocations(search);
        }

        setClusteringEnabled(!search);
        applyMarkers(mapMarkers);
        return mapMarkers;
      } catch {
        setClusteringEnabled(!search);
        applyMarkers([]);
        return [];
      }
    },
    [fetchAuthLocations, fetchGuestLocations, setClusteringEnabled, applyMarkers]
  );

  useEffect(() => {
    const authed = isAuthenticated();
    setGuest(!authed);

    getCategories()
      .then(setCategories)
      .catch(() => {});

    fetchLocations(null);
  }, [fetchLocations]);

  const handleCategorySelect = useCallback(
    (categoryId: number | null) => {
      if (guest) return;
      setSelectedMapCategory(categoryId);
      fetchLocations(categoryId);
    },
    [guest, setSelectedMapCategory, fetchLocations]
  );

  const handleSearch = useCallback(
    (query: string) => {
      fetchLocations(guest ? null : selectedMapCategory, query || undefined);
    },
    [guest, selectedMapCategory, fetchLocations]
  );

  return (
    <div className="relative w-full h-dvh overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0">
        <MapboxMap onLoad={() => {}} />
      </div>

      <div className="relative z-20 flex flex-col gap-3 pt-4">
        <SearchHeader onSearch={handleSearch} />
        {!guest && categories.length > 0 && (
          <CategorySelect
            categories={categories}
            selected={selectedMapCategory}
            onSelect={handleCategorySelect}
          />
        )}
      </div>

      <SponsorsFloating />

      <LocationBottomSheet />
    </div>
  );
}
