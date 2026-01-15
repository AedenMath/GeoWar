// ============================================
// 🧠 MAP STORE - ÉTAT DE LA CARTE
// Gestion de la vue carte et interactions géographiques
// ============================================

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Territory, GeoCoordinates, Army } from '../types'

interface MapStore {
  // État de la vue
  center: GeoCoordinates
  zoom: number
  bounds: [[number, number], [number, number]] | null

  // Sélections
  selectedTerritoryId: string | null
  selectedArmyId: string | null
  hoveredTerritoryId: string | null

  // Filtres et affichages
  showArmies: boolean
  showBattles: boolean
  showResources: boolean
  showAlliances: boolean
  territoryFilter: 'all' | 'owned' | 'neutral' | 'enemy'

  // Mode d'interaction
  interactionMode: 'view' | 'select' | 'move' | 'attack'

  // Données calculées
  visibleTerritories: Territory[]
  visibleArmies: Army[]

  // Actions
  setCenter: (center: GeoCoordinates) => void
  setZoom: (zoom: number) => void
  setBounds: (bounds: [[number, number], [number, number]] | null) => void
  selectTerritory: (territoryId: string | null) => void
  selectArmy: (armyId: string | null) => void
  hoverTerritory: (territoryId: string | null) => void
  setInteractionMode: (mode: MapStore['interactionMode']) => void
  toggleShowArmies: () => void
  toggleShowBattles: () => void
  toggleShowResources: () => void
  toggleShowAlliances: () => void
  setTerritoryFilter: (filter: MapStore['territoryFilter']) => void
  fitBounds: (territories: Territory[]) => void
  centerOnTerritory: (territory: Territory) => void
  centerOnArmy: (army: Army) => void

  // Getters
  getSelectedTerritory: () => Territory | null
  getSelectedArmy: () => Army | null
  getHoveredTerritory: () => Territory | null
  isTerritoryVisible: (territory: Territory) => boolean
}

export const useMapStore = create<MapStore>()(
  subscribeWithSelector((set, get) => ({
    // État initial
    center: { lat: 46.603354, lng: 1.888334 }, // Centre de la France
    zoom: 6,
    bounds: null,

    selectedTerritoryId: null,
    selectedArmyId: null,
    hoveredTerritoryId: null,

    showArmies: true,
    showBattles: true,
    showResources: false,
    showAlliances: false,
    territoryFilter: 'all',

    interactionMode: 'view',

    visibleTerritories: [],
    visibleArmies: [],

    // Actions
    setCenter: (center) => {
      set({ center })
    },

    setZoom: (zoom) => {
      set({ zoom: Math.max(1, Math.min(20, zoom)) })
    },

    setBounds: (bounds) => {
      set({ bounds })
    },

    selectTerritory: (territoryId) => {
      set({
        selectedTerritoryId: territoryId,
        selectedArmyId: null // Désélectionner l'armée si territoire sélectionné
      })
    },

    selectArmy: (armyId) => {
      set({
        selectedArmyId: armyId,
        selectedTerritoryId: null // Désélectionner le territoire si armée sélectionnée
      })
    },

    hoverTerritory: (territoryId) => {
      set({ hoveredTerritoryId: territoryId })
    },

    setInteractionMode: (interactionMode) => {
      set({ interactionMode })
    },

    toggleShowArmies: () => {
      set(state => ({ showArmies: !state.showArmies }))
    },

    toggleShowBattles: () => {
      set(state => ({ showBattles: !state.showBattles }))
    },

    toggleShowResources: () => {
      set(state => ({ showResources: !state.showResources }))
    },

    toggleShowAlliances: () => {
      set(state => ({ showAlliances: !state.showAlliances }))
    },

    setTerritoryFilter: (territoryFilter) => {
      set({ territoryFilter })
    },

    fitBounds: (territories) => {
      if (territories.length === 0) return

      const lats = territories.map(t => t.coordinates.lat)
      const lngs = territories.map(t => t.coordinates.lng)

      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)

      const bounds: [[number, number], [number, number]] = [
        [minLng - 0.1, minLat - 0.1],
        [maxLng + 0.1, maxLat + 0.1]
      ]

      set({ bounds })
    },

    centerOnTerritory: (territory) => {
      set({
        center: territory.coordinates,
        zoom: 8,
        selectedTerritoryId: territory.id
      })
    },

    centerOnArmy: (army) => {
      // Trouver le territoire de l'armée pour centrer dessus
      // Cette logique nécessiterait l'accès au gameStore
      // Pour l'instant, on garde simple
      set({
        selectedArmyId: army.id
      })
    },

    // Getters
    getSelectedTerritory: () => {
      // Nécessiterait l'accès au gameStore pour récupérer le territoire
      // Retourner null pour l'instant
      return null
    },

    getSelectedArmy: () => {
      // Même chose
      return null
    },

    getHoveredTerritory: () => {
      return null
    },

    isTerritoryVisible: (territory) => {
      const bounds = get().bounds
      if (!bounds) return true

      const [sw, ne] = bounds
      return territory.coordinates.lng >= sw[0] &&
             territory.coordinates.lat >= sw[1] &&
             territory.coordinates.lng <= ne[0] &&
             territory.coordinates.lat <= ne[1]
    }
  }))
)