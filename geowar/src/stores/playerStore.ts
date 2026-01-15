// ============================================
// 🧠 PLAYER STORE - ÉTAT DU JOUEUR ACTUEL
// Gestion des données personnelles du joueur
// ============================================

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Player, Resources, Alliance, Army, Territory } from '../types'

interface PlayerStore {
  currentPlayer: Player | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentPlayer: (player: Player | null) => void
  updatePlayer: (updates: Partial<Player>) => void
  updateResources: (resources: Partial<Resources>) => void
  addExperience: (amount: number) => void
  addTerritory: (territory: Territory) => void
  removeTerritory: (territoryId: string) => void
  addArmy: (army: Army) => void
  removeArmy: (armyId: string) => void
  updateArmy: (armyId: string, updates: Partial<Army>) => void
  joinAlliance: (alliance: Alliance) => void
  leaveAlliance: () => void
  setOnline: (online: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Getters calculés
  getTotalMilitaryPower: () => number
  getTotalTerritories: () => number
  getTotalArmies: () => number
  getResourceShortages: () => (keyof Resources)[]
  canAfford: (cost: Partial<Resources>) => boolean
  deductResources: (cost: Partial<Resources>) => boolean
}

export const usePlayerStore = create<PlayerStore>()(
  subscribeWithSelector((set, get) => ({
    // État initial
    currentPlayer: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Actions
    setCurrentPlayer: (player) => {
      set({
        currentPlayer: player,
        isAuthenticated: !!player,
        error: null
      })
    },

    updatePlayer: (updates) => {
      set(state => ({
        currentPlayer: state.currentPlayer ? { ...state.currentPlayer, ...updates } : null
      }))
    },

    updateResources: (resources) => {
      set(state => {
        if (!state.currentPlayer) return state

        const updatedResources = { ...state.currentPlayer.resources }
        Object.entries(resources).forEach(([key, value]) => {
          if (value !== undefined) {
            updatedResources[key as keyof Resources] = Math.max(0,
              updatedResources[key as keyof Resources] + value
            )
          }
        })

        return {
          currentPlayer: {
            ...state.currentPlayer,
            resources: updatedResources
          }
        }
      })
    },

    addExperience: (amount) => {
      set(state => {
        if (!state.currentPlayer) return state

        const newExperience = state.currentPlayer.experience + amount
        const newLevel = Math.floor(newExperience / 1000) + 1

        return {
          currentPlayer: {
            ...state.currentPlayer,
            experience: newExperience,
            level: Math.max(state.currentPlayer.level, newLevel)
          }
        }
      })
    },

    addTerritory: (territory) => {
      set(state => {
        if (!state.currentPlayer) return state

        return {
          currentPlayer: {
            ...state.currentPlayer,
            territories: [...state.currentPlayer.territories, territory]
          }
        }
      })
    },

    removeTerritory: (territoryId) => {
      set(state => {
        if (!state.currentPlayer) return state

        return {
          currentPlayer: {
            ...state.currentPlayer,
            territories: state.currentPlayer.territories.filter(t => t.id !== territoryId)
          }
        }
      })
    },

    addArmy: (army) => {
      set(state => {
        if (!state.currentPlayer) return state

        return {
          currentPlayer: {
            ...state.currentPlayer,
            armies: [...state.currentPlayer.armies, army]
          }
        }
      })
    },

    removeArmy: (armyId) => {
      set(state => {
        if (!state.currentPlayer) return state

        return {
          currentPlayer: {
            ...state.currentPlayer,
            armies: state.currentPlayer.armies.filter(a => a.id !== armyId)
          }
        }
      })
    },

    updateArmy: (armyId, updates) => {
      set(state => {
        if (!state.currentPlayer) return state

        return {
          currentPlayer: {
            ...state.currentPlayer,
            armies: state.currentPlayer.armies.map(army =>
              army.id === armyId ? { ...army, ...updates } : army
            )
          }
        }
      })
    },

    joinAlliance: (alliance) => {
      set(state => {
        if (!state.currentPlayer) return state

        return {
          currentPlayer: {
            ...state.currentPlayer,
            alliances: [...state.currentPlayer.alliances, alliance]
          }
        }
      })
    },

    leaveAlliance: () => {
      set(state => {
        if (!state.currentPlayer) return state

        return {
          currentPlayer: {
            ...state.currentPlayer,
            alliances: []
          }
        }
      })
    },

    setOnline: (online) => {
      set(state => ({
        currentPlayer: state.currentPlayer ? { ...state.currentPlayer, isOnline: online } : null
      }))
    },

    setLoading: (loading) => {
      set({ isLoading: loading })
    },

    setError: (error) => {
      set({ error, isLoading: false })
    },

    // Getters calculés
    getTotalMilitaryPower: () => {
      const player = get().currentPlayer
      if (!player) return 0

      return player.armies.reduce((total, army) =>
        total + army.units.reduce((armyTotal, unit) =>
          armyTotal + (unit.attack + unit.defense) * unit.quantity, 0
        ), 0
      )
    },

    getTotalTerritories: () => {
      return get().currentPlayer?.territories.length || 0
    },

    getTotalArmies: () => {
      return get().currentPlayer?.armies.length || 0
    },

    getResourceShortages: () => {
      const player = get().currentPlayer
      if (!player) return []

      const shortages: (keyof Resources)[] = []
      const resources = player.resources

      Object.entries(resources).forEach(([key, value]) => {
        if (value <= 0) {
          shortages.push(key as keyof Resources)
        }
      })

      return shortages
    },

    canAfford: (cost) => {
      const player = get().currentPlayer
      if (!player) return false

      return Object.entries(cost).every(([key, required]) => {
        if (required === undefined || required <= 0) return true
        return player.resources[key as keyof Resources] >= required
      })
    },

    deductResources: (cost) => {
      const player = get().currentPlayer
      if (!player || !get().canAfford(cost)) return false

      const updatedResources = { ...player.resources }
      Object.entries(cost).forEach(([key, amount]) => {
        if (amount && amount > 0) {
          updatedResources[key as keyof Resources] -= amount
        }
      })

      set({
        currentPlayer: {
          ...player,
          resources: updatedResources
        }
      })

      return true
    }
  }))
)