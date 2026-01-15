// ============================================
// 🧬 USE TERRITORIES - GESTION DES TERRITOIRES
// Interactions avec les territoires
// ============================================

import { useCallback } from 'react'
import { useGameStore, useMapStore, useUIStore, usePlayerStore } from '../stores'
import { apiService, gameService } from '../services'
import type { Territory, Building, Defense } from '../types'

export const useTerritories = () => {
  const gameStore = useGameStore()
  const mapStore = useMapStore()
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()

  // Sélectionner un territoire
  const selectTerritory = useCallback((territoryId: string | null) => {
    mapStore.selectTerritory(territoryId)

    if (territoryId) {
      const territory = gameStore.getTerritoryById(territoryId)
      if (territory) {
        mapStore.centerOnTerritory(territory)
      }
    }
  }, [gameStore, mapStore])

  // Construire un bâtiment
  const buildStructure = useCallback(async (
    territoryId: string,
    buildingType: string,
    level: number = 1
  ) => {
    try {
      uiStore.setLoading(true)

      const territory = gameStore.getTerritoryById(territoryId)
      if (!territory) throw new Error('Territory not found')

      // Vérifier les ressources nécessaires
      // TODO: Implémenter la vérification des coûts

      // Créer le bâtiment
      const newBuilding: Building = {
        id: `building_${Date.now()}`,
        type: buildingType as any,
        level,
        territoryId,
        productionBonus: {},
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Ajouter à la liste des bâtiments du territoire
      const updatedBuildings = [...territory.buildings, newBuilding]
      const updatedTerritory = {
        ...territory,
        buildings: updatedBuildings
      }

      // Mettre à jour via API
      await apiService.updateTerritory(territoryId, updatedTerritory)
      gameStore.updateTerritory(updatedTerritory)

      uiStore.addNotification({
        playerId: '', // TODO: utiliser l'ID du joueur actuel
        type: 'building_complete',
        title: 'Construction lancée',
        message: `Construction de ${buildingType} commencée sur ${territory.name}`,
        updatedAt: new Date()
      })

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Construction failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [gameStore, uiStore])

  // Construire une défense
  const buildDefense = useCallback(async (
    territoryId: string,
    defenseType: string,
    level: number = 1
  ) => {
    try {
      uiStore.setLoading(true)

      const territory = gameStore.getTerritoryById(territoryId)
      if (!territory) throw new Error('Territory not found')

      const newDefense: Defense = {
        id: `defense_${Date.now()}`,
        type: defenseType as any,
        level,
        territoryId,
        health: 100 * level,
        damage: 10 * level,
        range: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const updatedDefenses = [...territory.defenses, newDefense]
      const updatedTerritory = {
        ...territory,
        defenses: updatedDefenses
      }

      await apiService.updateTerritory(territoryId, updatedTerritory)
      gameStore.updateTerritory(updatedTerritory)

      uiStore.addNotification({
        playerId: '',
        type: 'building_complete',
        title: 'Défense construite',
        message: `Défense ${defenseType} construite sur ${territory.name}`,
        updatedAt: new Date()
      })

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Defense construction failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [gameStore, uiStore])

  // Obtenir les territoires du joueur actuel
  const getPlayerTerritories = useCallback(() => {
    return playerStore.currentPlayer?.territories || []
  }, [playerStore.currentPlayer])

  // Obtenir les territoires neutres
  const getNeutralTerritories = useCallback(() => {
    return Array.from(gameStore.territories.values()).filter(t => t.ownerId === null)
  }, [gameStore])

  // Calculer la production totale d'un territoire
  const calculateTerritoryProduction = useCallback((territory: Territory) => {
    return gameService.calculateResourceProduction(territory)
  }, [])

  return {
    // Actions
    selectTerritory,
    buildStructure,
    buildDefense,

    // Getters
    getPlayerTerritories,
    getNeutralTerritories,
    calculateTerritoryProduction,

    // État
    selectedTerritoryId: mapStore.selectedTerritoryId,
    selectedTerritory: mapStore.selectedTerritoryId
      ? gameStore.getTerritoryById(mapStore.selectedTerritoryId)
      : null
  }
}