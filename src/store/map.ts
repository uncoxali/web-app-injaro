import { create } from "zustand";
import { TEHRAN_CENTER } from "@/lib/map-utils";

export interface Location {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  category: number;
  logo?: string;
  thumbnail?: string;
  events_count?: number;
  is_open?: boolean;
  address?: string;
  description?: string;
}

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface MapState {
  viewState: MapViewState;
  markers: Location[];
  selectedLocationId: number | null;
  selectedLocation: Location | null;
  selectedMapCategory: number | null;
  userLocation: { latitude: number; longitude: number } | null;
  mapSearchQuery: string;
  clusteringEnabled: boolean;
  sheetOpen: boolean;
  flyToTarget: { latitude: number; longitude: number; zoom?: number } | null;
  fitBoundsTarget: [[number, number], [number, number]] | null;

  setViewState: (state: Partial<MapViewState>) => void;
  setMarkers: (markers: Location[]) => void;
  selectLocation: (id: number | null) => void;
  setSelectedLocation: (location: Location | null) => void;
  setSelectedMapCategory: (category: number | null) => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  setMapSearchQuery: (query: string) => void;
  setClusteringEnabled: (enabled: boolean) => void;
  setSheetOpen: (open: boolean) => void;
  setFlyToTarget: (target: { latitude: number; longitude: number; zoom?: number } | null) => void;
  setFitBoundsTarget: (target: [[number, number], [number, number]] | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewState: {
    latitude: TEHRAN_CENTER.latitude,
    longitude: TEHRAN_CENTER.longitude,
    zoom: TEHRAN_CENTER.zoom,
  },
  markers: [],
  selectedLocationId: null,
  selectedLocation: null,
  selectedMapCategory: null,
  userLocation: null,
  mapSearchQuery: "",
  clusteringEnabled: true,
  sheetOpen: false,
  flyToTarget: null,
  fitBoundsTarget: null,

  setViewState: (state) =>
    set((prev) => ({ viewState: { ...prev.viewState, ...state } })),
  setMarkers: (markers) => set({ markers }),
  selectLocation: (id) => set({ selectedLocationId: id }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setSelectedMapCategory: (category) => set({ selectedMapCategory: category }),
  setUserLocation: (location) => set({ userLocation: location }),
  setMapSearchQuery: (query) => set({ mapSearchQuery: query }),
  setClusteringEnabled: (enabled) => set({ clusteringEnabled: enabled }),
  setSheetOpen: (open) => set({ sheetOpen: open }),
  setFlyToTarget: (target) => set({ flyToTarget: target }),
  setFitBoundsTarget: (target) => set({ fitBoundsTarget: target }),
}));
