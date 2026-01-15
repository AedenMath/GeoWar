// ============================================
// 💉 AUTH SERVICE - AUTHENTIFICATION
// Gestion des utilisateurs et sessions
// ============================================

import type { AuthService } from './types'
import type { Player } from '../types'

class AuthServiceImpl implements AuthService {
  private currentUser: Player | null = null
  private token: string | null = null

  constructor() {
    // Restaurer la session depuis le localStorage
    const token = localStorage.getItem('geowar_token')
    const user = localStorage.getItem('geowar_user')

    if (token && user) {
      try {
        this.token = token
        this.currentUser = JSON.parse(user)
      } catch (error) {
        console.error('Failed to restore session:', error)
        this.logout()
      }
    }
  }

  async login(credentials: { username: string; password: string }): Promise<Player> {
    // Simulation d'une requête API
    // En production, ceci ferait un appel réel
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    const data = await response.json()
    this.token = data.token
    this.currentUser = data.player

    // Sauvegarder la session
    localStorage.setItem('geowar_token', this.token!)
    localStorage.setItem('geowar_user', JSON.stringify(this.currentUser))

    return this.currentUser!
  }

  async register(userData: { username: string; password: string; email: string }): Promise<Player> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      throw new Error('Registration failed')
    }

    const data = await response.json()
    this.token = data.token
    this.currentUser = data.player

    // Sauvegarder la session
    localStorage.setItem('geowar_token', this.token!)
    localStorage.setItem('geowar_user', JSON.stringify(this.currentUser))

    return this.currentUser!
  }

  async logout(): Promise<void> {
    // Nettoyer la session locale
    this.currentUser = null
    this.token = null

    localStorage.removeItem('geowar_token')
    localStorage.removeItem('geowar_user')

    // Notifier le serveur
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    }
  }

  async refreshToken(): Promise<string> {
    if (!this.token) {
      throw new Error('No token to refresh')
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    this.token = data.token

    localStorage.setItem('geowar_token', this.token!)

    return this.token!
  }

  isAuthenticated(): boolean {
    return !!(this.currentUser && this.token)
  }

  getCurrentUser(): Player | null {
    return this.currentUser
  }

  async updateProfile(updates: Partial<Player>): Promise<Player> {
    if (!this.currentUser || !this.token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch('/api/players/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error('Profile update failed')
    }

    const updatedPlayer = await response.json()
    this.currentUser = updatedPlayer

    // Mettre à jour le localStorage
    localStorage.setItem('geowar_user', JSON.stringify(this.currentUser))

    return this.currentUser!
  }
}

export const authService = new AuthServiceImpl()