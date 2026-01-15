// ============================================
// 🧬 USE GAME DATA - CHARGEMENT DES DONNÉES
// Synchronisation des données de jeu
// ============================================

import { useEffect, useState } from 'react'
import { useGameStore, usePlayerStore } from '../stores'
import { apiService, socketService } from '../services'
import type { Player, Territory, Battle, GameEvent } from '../types'

export const useGameData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const gameStore = useGameStore()
  const playerStore = usePlayerStore()

  // Charger les données initiales
  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Charger les territoires
      const territories = await apiService.getTerritories()
      territories.forEach(territory => {
        gameStore.addTerritory(territory)
      })

      // Charger les armées
      const armies = await apiService.getArmies()
      armies.forEach(army => {
        gameStore.addArmy(army)
      })

      // Charger les batailles actives
      const battles = await apiService.getBattles()
      battles.forEach(battle => {
        gameStore.startBattle(battle)
      })

      // Charger les événements
      const events = await apiService.getEvents()
      events.forEach(event => {
        gameStore.addGameEvent(event)
      })

      console.log('🎮 Game data loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game data'
      setError(errorMessage)
      console.error('Failed to load game data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Configurer les écouteurs WebSocket
  const setupSocketListeners = () => {
    socketService.onPlayerJoined((player: Player) => {
      gameStore.addPlayer(player)
    })

    socketService.onPlayerLeft((playerId: string) => {
      gameStore.removePlayer(playerId)
    })

    socketService.onTerritoryUpdated((territory: Territory) => {
      gameStore.updateTerritory(territory)
    })

    socketService.onBattleStarted((battle: Battle) => {
      gameStore.startBattle(battle)
    })

    socketService.onBattleUpdated((battle: Battle) => {
      gameStore.updateBattle(battle)
    })

    socketService.onGameEvent((event: GameEvent) => {
      gameStore.addGameEvent(event)
    })
  }

  // Initialisation
  useEffect(() => {
    if (playerStore.isAuthenticated) {
      loadInitialData()
      socketService.connect()
      setupSocketListeners()
    }

    // Nettoyage
    return () => {
      socketService.disconnect()
    }
  }, [playerStore.isAuthenticated])

  // Recharger les données
  const refreshData = () => {
    loadInitialData()
  }

  return {
    isLoading,
    error,
    refreshData,
    isConnected: socketService.isConnected
  }
}