// ============================================
// 🧬 USE AUTH - HOOK D'AUTHENTIFICATION
// Gestion de l'authentification utilisateur
// ============================================

import { useEffect } from 'react'
import { usePlayerStore } from '../stores'
import { authService } from '../services'

export const useAuth = () => {
  const {
    currentPlayer,
    isAuthenticated,
    isLoading,
    error,
    setCurrentPlayer,
    setLoading,
    setError
  } = usePlayerStore()

  useEffect(() => {
    // Restaurer la session au montage
    const restoreSession = () => {
      const user = authService.getCurrentUser()
      if (user && authService.isAuthenticated()) {
        setCurrentPlayer(user)
      }
    }

    restoreSession()
  }, [setCurrentPlayer])

  const login = async (username: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const player = await authService.login({ username, password })
      setCurrentPlayer(player)

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, password: string, email: string) => {
    try {
      setLoading(true)
      setError(null)

      const player = await authService.register({ username, password, email })
      setCurrentPlayer(player)

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setCurrentPlayer(null)
    } catch (err) {
      console.error('Logout error:', err)
      // Même en cas d'erreur, on nettoie l'état local
      setCurrentPlayer(null)
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      setLoading(true)
      setError(null)

      const updatedPlayer = await authService.updateProfile(updates)
      setCurrentPlayer(updatedPlayer)

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    // État
    currentPlayer,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    updateProfile,

    // Getters
    isLoggedIn: isAuthenticated
  }
}