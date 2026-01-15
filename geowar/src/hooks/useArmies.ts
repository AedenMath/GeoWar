// ============================================
// 🧬 USE ARMIES - GESTION DES ARMÉES
// Commandement militaire
// ============================================

import { useCallback } from 'react'
import { useGameStore, useMapStore, useUIStore, usePlayerStore } from '../stores'
import { apiService, gameService } from '../services'
import type { Army, Unit } from '../types'

export const useArmies = () => {
  const gameStore = useGameStore()
  const mapStore = useMapStore()
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()

  // Créer une nouvelle armée
  const createArmy = useCallback(async (
    name: string,
    location: string,
    initialUnits: Unit[] = []
  ) => {
    try {
      uiStore.setLoading(true)

      const territory = gameStore.getTerritoryById(location)
      if (!territory) throw new Error('Invalid location')

      if (!playerStore.currentPlayer) throw new Error('Not authenticated')

      const newArmy: Omit<Army, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        ownerId: playerStore.currentPlayer.id,
        units: initialUnits,
        location,
        status: 'idle',
        morale: 100,
        experience: 0
      }

      const createdArmy = await apiService.createArmy(newArmy)
      gameStore.addArmy(createdArmy)
      playerStore.addArmy(createdArmy)

      uiStore.addNotification({
        playerId: playerStore.currentPlayer.id,
        type: 'achievement',
        title: 'Armée créée',
        message: `L'armée "${name}" a été créée avec succès`,
        updatedAt: new Date()
      })

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Army creation failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [gameStore, playerStore, uiStore])

  // Déplacer une armée
  const moveArmy = useCallback(async (armyId: string, targetTerritoryId: string) => {
    try {
      const army = gameStore.getArmyById(armyId)
      const targetTerritory = gameStore.getTerritoryById(targetTerritoryId)

      if (!army || !targetTerritory) throw new Error('Invalid army or territory')

      // Vérifier si le mouvement est valide
      if (!gameService.validateMove(army)) {
        throw new Error('Invalid move')
      }

      // Mettre à jour l'armée
      const updatedArmy = {
        ...army,
        location: targetTerritoryId,
        status: 'moving' as const
      }

      await apiService.updateArmy(armyId, updatedArmy)
      gameStore.updateArmy(updatedArmy)
      playerStore.updateArmy(armyId, updatedArmy)

      mapStore.centerOnArmy(updatedArmy)

      uiStore.addNotification({
        playerId: army.ownerId,
        type: 'achievement',
        title: 'Armée en mouvement',
        message: `L'armée "${army.name}" se déplace vers ${targetTerritory.name}`,
        updatedAt: new Date()
      })

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Army move failed')
    }
  }, [gameStore, playerStore, mapStore, uiStore])

  // Attaquer avec une armée
  const attackWithArmy = useCallback(async (armyId: string, targetTerritoryId: string) => {
    try {
      const army = gameStore.getArmyById(armyId)
      const targetTerritory = gameStore.getTerritoryById(targetTerritoryId)

      if (!army || !targetTerritory) throw new Error('Invalid army or territory')

      // Vérifier si l'attaque est possible
      const currentTerritory = gameStore.getTerritoryById(army.location)
      if (!currentTerritory) throw new Error('Army location not found')

      const isAdjacent = currentTerritory.neighbors.includes(targetTerritoryId)
      if (!isAdjacent) throw new Error('Territories must be adjacent to attack')

      // Créer une bataille
      const battle = await apiService.createBattle({
        attackerId: army.ownerId,
        defenderId: targetTerritory.ownerId || 'neutral',
        territoryId: targetTerritoryId,
        attackerArmy: army,
        defenderArmy: {
          ...army, // TODO: Créer une armée défensive fictive
          ownerId: targetTerritory.ownerId || 'neutral'
        },
        status: 'preparing',
        rounds: []
      })

      gameStore.startBattle(battle)

      uiStore.addNotification({
        playerId: army.ownerId,
        type: 'attack_incoming',
        title: 'Bataille déclarée',
        message: `Votre armée attaque ${targetTerritory.name}`,
        updatedAt: new Date()
      })

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Attack failed')
    }
  }, [gameStore, uiStore])

  // Recruter des unités
  const recruitUnits = useCallback(async (
    armyId: string,
    unitType: string,
    quantity: number
  ) => {
    try {
      uiStore.setLoading(true)

      const army = gameStore.getArmyById(armyId)
      if (!army) throw new Error('Army not found')

      // TODO: Vérifier les ressources et les bâtiments requis

      const newUnit: Unit = {
        id: `unit_${Date.now()}`,
        type: unitType as any,
        quantity,
        health: 100,
        attack: 10, // TODO: Valeurs par défaut selon le type
        defense: 10,
        speed: 5,
        upkeepCost: { gold: 1, oil: 0, steel: 0, food: 1, uranium: 0, rareEarth: 0, electricity: 0 },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const updatedUnits = [...army.units, newUnit]
      const updatedArmy = {
        ...army,
        units: updatedUnits
      }

      await apiService.updateArmy(armyId, updatedArmy)
      gameStore.updateArmy(updatedArmy)
      playerStore.updateArmy(armyId, updatedArmy)

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Unit recruitment failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [gameStore, playerStore, uiStore])

  // Dissoudre une armée
  const disbandArmy = useCallback(async (armyId: string) => {
    try {
      await apiService.deleteArmy(armyId)
      gameStore.removeArmy(armyId)
      playerStore.removeArmy(armyId)

      uiStore.addNotification({
        playerId: playerStore.currentPlayer?.id || '',
        type: 'achievement',
        title: 'Armée dissoute',
        message: 'L\'armée a été dissoute',
        updatedAt: new Date()
      })

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Army disband failed')
    }
  }, [gameStore, playerStore, uiStore])

  return {
    // Actions
    createArmy,
    moveArmy,
    attackWithArmy,
    recruitUnits,
    disbandArmy,

    // Getters
    getPlayerArmies: () => playerStore.currentPlayer?.armies || [],
    getArmiesByTerritory: gameStore.getArmiesByTerritory,
    getArmyById: gameStore.getArmyById,

    // État
    selectedArmyId: mapStore.selectedArmyId,
    selectedArmy: mapStore.selectedArmyId
      ? gameStore.getArmyById(mapStore.selectedArmyId)
      : null
  }
}