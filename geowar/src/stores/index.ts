// ============================================
// 🧠 CERVEAU DE GEOWAR - STORES ZUSTAND
// Point d'entrée central pour tous les stores
// ============================================

export { useGameStore } from './gameStore'
export { usePlayerStore } from './playerStore'
export { useMapStore } from './mapStore'
export { useUIStore } from './uiStore'
export { useGeoWar } from './useGeoWar'

// Types réexportés pour commodité
export type { GameState, Player, Territory, Army, UIState } from '../types'