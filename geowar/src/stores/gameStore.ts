// ============================================
// 🧠 GAME STORE - CERVEAU CENTRAL
// État global du jeu et logique principale
// ============================================

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  GameState,
  Player,
  Territory,
  Army,
  Battle,
  GameEvent,
  BattleResult
} from '../types'

interface GameStore extends GameState {
  // Actions principales
  initializeGame: () => void
  addPlayer: (player: Player) => void
  removePlayer: (playerId: string) => void
  updatePlayer: (player: Player) => void
  updateTerritory: (territory: Territory) => void
  addTerritory: (territory: Territory) => void
  updateArmy: (army: Army) => void
  addArmy: (army: Army) => void
  removeArmy: (armyId: string) => void
  startBattle: (battle: Battle) => void
  updateBattle: (battle: Battle) => void
  endBattle: (battleId: string, result: BattleResult) => void
  addGameEvent: (event: GameEvent) => void
  removeGameEvent: (eventId: string) => void
  setGameSpeed: (speed: number) => void
  togglePause: () => void
  incrementTick: () => void

  // Getters calculés
  getTerritoryById: (id: string) => Territory | undefined
  getPlayerById: (id: string) => Player | undefined
  getArmyById: (id: string) => Army | undefined
  getArmiesByTerritory: (territoryId: string) => Army[]
  getArmiesByPlayer: (playerId: string) => Army[]
  getActiveBattles: () => Battle[]
  getActiveEvents: () => GameEvent[]
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // État initial
    currentPlayer: null,
    players: new Map(),
    territories: new Map(),
    armies: new Map(),
    battles: [],
    events: [],
    tick: 0,
    isPaused: false,
    gameSpeed: 1,

    // Actions
    initializeGame: () => {
      set({
        tick: 0,
        isPaused: false,
        gameSpeed: 1,
        players: new Map(),
        territories: new Map(),
        armies: new Map(),
        battles: [],
        events: []
      })
    },

    addPlayer: (player) => {
      set(state => {
        const newPlayers = new Map(state.players)
        newPlayers.set(player.id, player)
        return { players: newPlayers }
      })
    },

    removePlayer: (playerId) => {
      set(state => {
        const newPlayers = new Map(state.players)
        newPlayers.delete(playerId)

        // Supprimer les armées du joueur
        const newArmies = new Map(state.armies)
        for (const [armyId, army] of newArmies) {
          if (army.ownerId === playerId) {
            newArmies.delete(armyId)
          }
        }

        // Libérer les territoires
        const newTerritories = new Map(state.territories)
        for (const [territoryId, territory] of newTerritories) {
          if (territory.ownerId === playerId) {
            newTerritories.set(territoryId, { ...territory, ownerId: null, status: 'neutral' as const })
          }
        }

        return {
          players: newPlayers,
          armies: newArmies,
          territories: newTerritories
        }
      })
    },

    updatePlayer: (player) => {
      set(state => {
        const newPlayers = new Map(state.players)
        newPlayers.set(player.id, player)
        return { players: newPlayers }
      })
    },

    updateTerritory: (territory) => {
      set(state => {
        const newTerritories = new Map(state.territories)
        newTerritories.set(territory.id, territory)
        return { territories: newTerritories }
      })
    },

    addTerritory: (territory) => {
      set(state => {
        const newTerritories = new Map(state.territories)
        newTerritories.set(territory.id, territory)
        return { territories: newTerritories }
      })
    },

    updateArmy: (army) => {
      set(state => {
        const newArmies = new Map(state.armies)
        newArmies.set(army.id, army)
        return { armies: newArmies }
      })
    },

    addArmy: (army) => {
      set(state => {
        const newArmies = new Map(state.armies)
        newArmies.set(army.id, army)
        return { armies: newArmies }
      })
    },

    removeArmy: (armyId) => {
      set(state => {
        const newArmies = new Map(state.armies)
        newArmies.delete(armyId)
        return { armies: newArmies }
      })
    },

    startBattle: (battle) => {
      set(state => ({
        battles: [...state.battles, battle]
      }))
    },

    updateBattle: (battle) => {
      set(state => ({
        battles: state.battles.map(b => b.id === battle.id ? battle : b)
      }))
    },

    endBattle: (battleId, result) => {
      set(state => ({
        battles: state.battles.map(b =>
          b.id === battleId ? { ...b, status: 'finished' as const, result } : b
        )
      }))
    },

    addGameEvent: (event) => {
      set(state => ({
        events: [...state.events, event]
      }))
    },

    removeGameEvent: (eventId) => {
      set(state => ({
        events: state.events.filter(e => e.id !== eventId)
      }))
    },

    setGameSpeed: (speed) => {
      set({ gameSpeed: speed })
    },

    togglePause: () => {
      set(state => ({ isPaused: !state.isPaused }))
    },

    incrementTick: () => {
      set(state => ({ tick: state.tick + 1 }))
    },

    // Getters
    getTerritoryById: (id) => {
      return get().territories.get(id)
    },

    getPlayerById: (id) => {
      return get().players.get(id)
    },

    getArmyById: (id) => {
      return get().armies.get(id)
    },

    getArmiesByTerritory: (territoryId) => {
      return Array.from(get().armies.values()).filter(army => army.location === territoryId)
    },

    getArmiesByPlayer: (playerId) => {
      return Array.from(get().armies.values()).filter(army => army.ownerId === playerId)
    },

    getActiveBattles: () => {
      return get().battles.filter(battle => battle.status === 'in_progress')
    },

    getActiveEvents: () => {
      return get().events.filter(event => event.isActive)
    }
  }))
)