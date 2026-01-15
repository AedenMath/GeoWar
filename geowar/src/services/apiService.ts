// ============================================
// 💉 API SERVICE - COMMUNICATION AVEC LE SERVEUR
// Gestion des requêtes HTTP et réponses
// ============================================

import type { ApiService } from './types'
import type { Player, Territory, Army, Battle, GameEvent, Alliance, ApiResponse } from '../types'

class ApiServiceImpl implements ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem('geowar_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  // Authentification
  async login(username: string, password: string) {
    const response = await this.request<{ player: Player; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })

    if (response.success && response.data) {
      this.token = response.data.token
      localStorage.setItem('geowar_token', this.token)
      return { success: true, player: response.data.player, token: response.data.token }
    }

    return { success: false }
  }

  async register(username: string, password: string, email: string) {
    const response = await this.request<{ player: Player }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email })
    })

    if (response.success && response.data) {
      return { success: true, player: response.data.player }
    }

    return { success: false }
  }

  async logout() {
    this.token = null
    localStorage.removeItem('geowar_token')
    await this.request('/auth/logout', { method: 'POST' })
  }

  // Données joueur
  async getPlayer(playerId: string): Promise<Player> {
    const response = await this.request<Player>(`/players/${playerId}`)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to get player')
  }

  async updatePlayer(updates: Partial<Player>): Promise<Player> {
    const response = await this.request<Player>('/players/me', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to update player')
  }

  // Territoires
  async getTerritories(): Promise<Territory[]> {
    const response = await this.request<Territory[]>('/territories')
    return response.success && response.data ? response.data : []
  }

  async getTerritory(id: string): Promise<Territory> {
    const response = await this.request<Territory>(`/territories/${id}`)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to get territory')
  }

  async updateTerritory(id: string, updates: Partial<Territory>): Promise<Territory> {
    const response = await this.request<Territory>(`/territories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to update territory')
  }

  // Armées
  async getArmies(playerId?: string): Promise<Army[]> {
    const endpoint = playerId ? `/armies?playerId=${playerId}` : '/armies'
    const response = await this.request<Army[]>(endpoint)
    return response.success && response.data ? response.data : []
  }

  async createArmy(army: Omit<Army, 'id' | 'createdAt' | 'updatedAt'>): Promise<Army> {
    const response = await this.request<Army>('/armies', {
      method: 'POST',
      body: JSON.stringify(army)
    })
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to create army')
  }

  async updateArmy(id: string, updates: Partial<Army>): Promise<Army> {
    const response = await this.request<Army>(`/armies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to update army')
  }

  async deleteArmy(id: string): Promise<void> {
    const response = await this.request(`/armies/${id}`, {
      method: 'DELETE'
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete army')
    }
  }

  // Batailles
  async getBattles(): Promise<Battle[]> {
    const response = await this.request<Battle[]>('/battles')
    return response.success && response.data ? response.data : []
  }

  async createBattle(battle: Omit<Battle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Battle> {
    const response = await this.request<Battle>('/battles', {
      method: 'POST',
      body: JSON.stringify(battle)
    })
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to create battle')
  }

  // Événements
  async getEvents(): Promise<GameEvent[]> {
    const response = await this.request<GameEvent[]>('/events')
    return response.success && response.data ? response.data : []
  }

  // Alliances
  async getAlliances(): Promise<Alliance[]> {
    const response = await this.request<Alliance[]>('/alliances')
    return response.success && response.data ? response.data : []
  }

  async createAlliance(alliance: Omit<Alliance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alliance> {
    const response = await this.request<Alliance>('/alliances', {
      method: 'POST',
      body: JSON.stringify(alliance)
    })
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to create alliance')
  }

  async joinAlliance(allianceId: string): Promise<void> {
    const response = await this.request(`/alliances/${allianceId}/join`, {
      method: 'POST'
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to join alliance')
    }
  }

  async leaveAlliance(): Promise<void> {
    const response = await this.request('/alliances/leave', {
      method: 'POST'
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to leave alliance')
    }
  }
}

export const apiService = new ApiServiceImpl()