// ============================================
// 🧬 USE GEOWAR ACTIONS - ACTIONS COMBINÉES
// Orchestration des actions complexes
// ============================================

import { useCallback } from 'react'
import { useGameStore, usePlayerStore, useUIStore } from '../stores'
import { useTerritories } from './useTerritories'
import { useArmies } from './useArmies'
import { useBattles } from './useBattles'
import { useNotifications } from './useNotifications'
import type { Territory, Army } from '../types'

export const useGeoWarActions = () => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const uiStore = useUIStore()

  const territories = useTerritories()
  const armies = useArmies()
  const battles = useBattles()
  const notifications = useNotifications()

  // Action complète : conquérir un territoire
  const conquerTerritory = useCallback(async (
    armyId: string,
    targetTerritoryId: string
  ) => {
    try {
      uiStore.setLoading(true)

      const army = gameStore.getArmyById(armyId)
      const territory = gameStore.getTerritoryById(targetTerritoryId)

      if (!army || !territory) throw new Error('Invalid army or territory')

      // Vérifier si le joueur possède l'armée
      if (army.ownerId !== playerStore.currentPlayer?.id) {
        throw new Error('Not your army')
      }

      // Lancer l'attaque
      await armies.attackWithArmy(armyId, targetTerritoryId)

      // La bataille sera résolue automatiquement
      // TODO: Implémenter la résolution automatique ou manuelle

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Conquest failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [gameStore, playerStore, armies, uiStore])

  // Action complète : développer une région
  const developRegion = useCallback(async (
    territoryId: string,
    developmentPlan: {
      buildings: string[]
      defenses: string[]
      armySize: number
    }
  ) => {
    try {
      uiStore.setLoading(true)

      // Construire les bâtiments
      for (const building of developmentPlan.buildings) {
        await territories.buildStructure(territoryId, building)
      }

      // Construire les défenses
      for (const defense of developmentPlan.defenses) {
        await territories.buildDefense(territoryId, defense)
      }

      // Recruter des troupes si demandé
      if (developmentPlan.armySize > 0) {
        const territory = gameStore.getTerritoryById(territoryId)
        if (territory) {
          await armies.createArmy(
            `Garrison ${territory.name}`,
            territoryId,
            [] // TODO: Générer des unités selon armySize
          )
        }
      }

      notifications.notifyBuildingComplete('Région développée', 'Multiple structures')

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Development failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [territories, armies, gameStore, notifications, uiStore])

  // Action complète : campagne militaire
  const launchCampaign = useCallback(async (
    armies: Army[],
    targetTerritories: Territory[]
  ) => {
    try {
      uiStore.setLoading(true)

      // Valider que tous les paramètres sont corrects
      if (armies.length === 0 || targetTerritories.length === 0) {
        throw new Error('Invalid campaign parameters')
      }

      // Vérifier que les armées appartiennent au joueur
      const invalidArmies = armies.filter(army =>
        army.ownerId !== playerStore.currentPlayer?.id
      )
      if (invalidArmies.length > 0) {
        throw new Error('Some armies do not belong to you')
      }

      // Lancer les attaques en séquence
      for (let i = 0; i < Math.min(armies.length, targetTerritories.length); i++) {
        await conquerTerritory(armies[i].id, targetTerritories[i].id)
        // Petit délai entre les attaques
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      notifications.addNotification(
        'achievement',
        'Campagne lancée',
        `Campagne militaire lancée avec ${armies.length} armées`
      )

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Campaign failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [armies, playerStore, conquerTerritory, notifications, uiStore])

  // Action complète : gestion des ressources
  const manageResources = useCallback(async (
    actions: {
      type: 'produce' | 'trade' | 'allocate'
      resource: string
      amount: number
      target?: string
    }[]
  ) => {
    try {
      uiStore.setLoading(true)

      for (const action of actions) {
        switch (action.type) {
          case 'produce':
            // TODO: Implémenter la production forcée
            break
          case 'trade':
            // TODO: Implémenter le commerce
            break
          case 'allocate':
            // TODO: Implémenter l'allocation de ressources
            break
        }
      }

      notifications.addNotification(
        'achievement',
        'Ressources gérées',
        `${actions.length} actions de gestion des ressources exécutées`
      )

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Resource management failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [notifications, uiStore])

  // Action complète : évacuation d'urgence
  const emergencyEvacuation = useCallback(async (
    territoryId: string,
    targetTerritoryId: string
  ) => {
    try {
      uiStore.setLoading(true)

      const armiesInTerritory = gameStore.getArmiesByTerritory(territoryId)

      // Déplacer toutes les armées
      for (const army of armiesInTerritory) {
        if (army.ownerId === playerStore.currentPlayer?.id) {
          await armies.moveArmy(army.id, targetTerritoryId)
        }
      }

      notifications.notifyTerritoryLost(
        gameStore.getTerritoryById(territoryId)?.name || 'Territoire'
      )

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Evacuation failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [gameStore, playerStore, armies, notifications, uiStore])

  return {
    // Actions complexes
    conquerTerritory,
    developRegion,
    launchCampaign,
    manageResources,
    emergencyEvacuation,

    // Accès aux hooks sous-jacents
    territories,
    armies,
    battles,
    notifications
  }
}