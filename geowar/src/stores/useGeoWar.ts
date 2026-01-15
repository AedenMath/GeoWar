// ============================================
// 🧠 USE GEOWAR - HOOK PRINCIPAL
// Interface unifiée pour tous les stores de GeoWar
// ============================================

import { useGameStore } from './gameStore'
import { usePlayerStore } from './playerStore'
import { useMapStore } from './mapStore'
import { useUIStore } from './uiStore'
import type {
  Player,
  Territory,
  Army
} from '../types'

/**
 * Hook principal de GeoWar - Point d'entrée unifié
 * Combine tous les stores pour une utilisation simplifiée
 */
export const useGeoWar = () => {
  // États des stores
  const gameState = useGameStore()
  const playerState = usePlayerStore()
  const mapState = useMapStore()
  const uiState = useUIStore()

  // Actions combinées fréquemment utilisées
  const selectTerritory = (territoryId: string | null) => {
    mapState.selectTerritory(territoryId)
    uiState.closeModal()
  }

  const selectArmy = (armyId: string | null) => {
    mapState.selectArmy(armyId)
    uiState.closeModal()
  }

  const attackTerritory = (attackerArmyId: string, targetTerritoryId: string) => {
    const army = gameState.getArmyById(attackerArmyId)
    const territory = gameState.getTerritoryById(targetTerritoryId)

    if (!army || !territory) return

    // Logique d'attaque simplifiée
    uiState.openModal('attack')
    // Ici on pourrait déclencher une bataille
  }

  const moveArmy = (armyId: string, targetTerritoryId: string) => {
    const army = gameState.getArmyById(armyId)
    if (!army) return

    gameState.updateArmy({ ...army, location: targetTerritoryId, status: 'moving' })
    uiState.addNotification({
      playerId: playerState.currentPlayer?.id || '',
      type: 'attack_incoming',
      title: 'Armée en mouvement',
      message: `Votre armée se déplace vers ${targetTerritoryId}`,
      updatedAt: new Date()
    })
  }

  const buildStructure = (_territoryId: string, _buildingType: string) => {
    // Logique de construction simplifiée
    uiState.openModal('build')
  }

  const recruitUnits = (_armyId: string) => {
    uiState.openModal('recruit')
  }

  // Getters combinés
  const getCurrentPlayerTerritories = (): Territory[] => {
    if (!playerState.currentPlayer) return []
    return playerState.currentPlayer.territories
  }

  const getCurrentPlayerArmies = (): Army[] => {
    if (!playerState.currentPlayer) return []
    return playerState.currentPlayer.armies
  }

  const getNearbyTerritories = (territoryId: string): Territory[] => {
    const territory = gameState.getTerritoryById(territoryId)
    if (!territory) return []

    return territory.neighbors
      .map(id => gameState.getTerritoryById(id))
      .filter((t): t is Territory => t !== undefined)
  }

  const getPlayerByTerritory = (territoryId: string): Player | null => {
    const territory = gameState.getTerritoryById(territoryId)
    if (!territory?.ownerId) return null

    return gameState.getPlayerById(territory.ownerId) || null
  }

  const canAttackTerritory = (armyId: string, territoryId: string): boolean => {
    const army = gameState.getArmyById(armyId)
    const territory = gameState.getTerritoryById(territoryId)

    if (!army || !territory) return false
    if (army.ownerId === territory.ownerId) return false // Ne peut pas attaquer son propre territoire

    // Vérifier si adjacent
    const armyTerritory = gameState.getTerritoryById(army.location)
    if (!armyTerritory) return false

    return armyTerritory.neighbors.includes(territoryId)
  }

  // État global calculé
  const gameStatus = {
    isInitialized: gameState.players.size > 0,
    totalPlayers: gameState.players.size,
    totalTerritories: gameState.territories.size,
    activeBattles: gameState.getActiveBattles().length,
    activeEvents: gameState.getActiveEvents().length,
    currentTick: gameState.tick,
    isPaused: gameState.isPaused,
    gameSpeed: gameState.gameSpeed
  }

  const playerStatus = {
    isAuthenticated: playerState.isAuthenticated,
    username: playerState.currentPlayer?.username || '',
    level: playerState.currentPlayer?.level || 0,
    experience: playerState.currentPlayer?.experience || 0,
    vispiria: playerState.currentPlayer?.vispiria || '',
    totalTerritories: playerState.getTotalTerritories(),
    totalArmies: playerState.getTotalArmies(),
    militaryPower: playerState.getTotalMilitaryPower(),
    resourceShortages: playerState.getResourceShortages(),
    canAfford: playerState.canAfford,
    deductResources: playerState.deductResources
  }

  return {
    // États bruts
    gameState,
    playerState,
    mapState,
    uiState,

    // États calculés
    gameStatus,
    playerStatus,

    // Actions combinées
    selectTerritory,
    selectArmy,
    attackTerritory,
    moveArmy,
    buildStructure,
    recruitUnits,

    // Getters combinés
    getCurrentPlayerTerritories,
    getCurrentPlayerArmies,
    getNearbyTerritories,
    getPlayerByTerritory,
    canAttackTerritory
  }
}

// Types pour TypeScript
export type UseGeoWarReturn = ReturnType<typeof useGeoWar>