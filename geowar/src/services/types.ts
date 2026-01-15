// ============================================
// 💉 TYPES DES SERVICES
// Interfaces pour le système sanguin
// ============================================

import type { Player, Territory, Army, Battle, GameEvent, Notification, Alliance } from '../types'

// API Service
export interface ApiService {
  // Authentification
  login: (username: string, password: string) => Promise<{ success: boolean; player?: Player; token?: string }>
  register: (username: string, password: string, email: string) => Promise<{ success: boolean; player?: Player }>
  logout: () => Promise<void>

  // Données joueur
  getPlayer: (playerId: string) => Promise<Player>
  updatePlayer: (updates: Partial<Player>) => Promise<Player>

  // Territoires
  getTerritories: () => Promise<Territory[]>
  getTerritory: (id: string) => Promise<Territory>
  updateTerritory: (id: string, updates: Partial<Territory>) => Promise<Territory>

  // Armées
  getArmies: (playerId?: string) => Promise<Army[]>
  createArmy: (army: Omit<Army, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Army>
  updateArmy: (id: string, updates: Partial<Army>) => Promise<Army>
  deleteArmy: (id: string) => Promise<void>

  // Batailles
  getBattles: () => Promise<Battle[]>
  createBattle: (battle: Omit<Battle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Battle>

  // Événements
  getEvents: () => Promise<GameEvent[]>

  // Alliances
  getAlliances: () => Promise<Alliance[]>
  createAlliance: (alliance: Omit<Alliance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Alliance>
  joinAlliance: (allianceId: string) => Promise<void>
  leaveAlliance: () => Promise<void>
}

// Socket Service
export interface SocketService {
  connect: () => void
  disconnect: () => void
  isConnected: boolean

  // Événements
  onPlayerJoined: (callback: (player: Player) => void) => void
  onPlayerLeft: (callback: (playerId: string) => void) => void
  onTerritoryUpdated: (callback: (territory: Territory) => void) => void
  onBattleStarted: (callback: (battle: Battle) => void) => void
  onBattleUpdated: (callback: (battle: Battle) => void) => void
  onBattleEnded: (callback: (result: any) => void) => void
  onNotification: (callback: (notification: Notification) => void) => void
  onGameEvent: (callback: (event: GameEvent) => void) => void

  // Actions
  sendChatMessage: (message: string, channel?: string) => void
  updatePlayerStatus: (status: 'online' | 'away' | 'busy') => void
}

// Game Service
export interface GameService {
  initialize: () => Promise<void>
  startGameLoop: () => void
  stopGameLoop: () => void
  processTick: () => void
  saveGame: () => Promise<void>
  loadGame: (saveId: string) => Promise<void>
  calculateResourceProduction: (territory: Territory) => any
  calculateCombatResult: (attacker: Army, defender: Army) => any
  validateMove: (army: Army, targetTerritory: Territory) => boolean
}

// Auth Service
export interface AuthService {
  login: (credentials: { username: string; password: string }) => Promise<Player>
  register: (userData: { username: string; password: string; email: string }) => Promise<Player>
  logout: () => Promise<void>
  refreshToken: () => Promise<string>
  isAuthenticated: () => boolean
  getCurrentUser: () => Player | null
  updateProfile: (updates: Partial<Player>) => Promise<Player>
}