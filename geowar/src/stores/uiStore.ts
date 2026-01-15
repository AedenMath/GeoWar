// ============================================
// 🧠 UI STORE - ÉTAT DE L'INTERFACE UTILISATEUR
// Gestion des panneaux, modales et notifications
// ============================================

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { UIState, PanelType, ModalType, Notification } from '../types'

interface UIStore extends UIState {
  // Actions pour les panneaux
  openPanel: (panel: PanelType) => void
  closePanel: () => void
  togglePanel: (panel: PanelType) => void

  // Actions pour les modales
  openModal: (modal: ModalType) => void
  closeModal: () => void

  // Actions pour les notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  clearNotifications: () => void

  // Actions générales
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Getters calculés
  getUnreadNotificationsCount: () => number
  getNotificationsByType: (type: Notification['type']) => Notification[]
  hasActiveModal: () => boolean
  hasActivePanel: () => boolean
}

export const useUIStore = create<UIStore>()(
  subscribeWithSelector((set, get) => ({
    // État initial
    selectedTerritory: null,
    selectedArmy: null,
    activePanel: null,
    modalOpen: null,
    notifications: [],
    isLoading: false,
    error: null,

    // Actions panneaux
    openPanel: (panel) => {
      set({ activePanel: panel })
    },

    closePanel: () => {
      set({ activePanel: null })
    },

    togglePanel: (panel) => {
      set(state => ({
        activePanel: state.activePanel === panel ? null : panel
      }))
    },

    // Actions modales
    openModal: (modal) => {
      set({ modalOpen: modal })
    },

    closeModal: () => {
      set({ modalOpen: null })
    },

    // Actions notifications
    addNotification: (notificationData) => {
      const notification: Notification = {
        ...notificationData,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        isRead: false
      }

      set(state => ({
        notifications: [notification, ...state.notifications].slice(0, 50) // Garder max 50 notifications
      }))

      // Auto-suppression après 30 secondes pour les notifications mineures
      if (['resource_depleted', 'building_complete'].includes(notification.type)) {
        setTimeout(() => {
          get().removeNotification(notification.id)
        }, 30000)
      }
    },

    removeNotification: (id) => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    },

    markNotificationAsRead: (id) => {
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        )
      }))
    },

    markAllNotificationsAsRead: () => {
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      }))
    },

    clearNotifications: () => {
      set({ notifications: [] })
    },

    // Actions générales
    setLoading: (isLoading) => {
      set({ isLoading })
    },

    setError: (error) => {
      set({ error, isLoading: false })
    },

    clearError: () => {
      set({ error: null })
    },

    // Getters
    getUnreadNotificationsCount: () => {
      return get().notifications.filter(n => !n.isRead).length
    },

    getNotificationsByType: (type) => {
      return get().notifications.filter(n => n.type === type)
    },

    hasActiveModal: () => {
      return get().modalOpen !== null
    },

    hasActivePanel: () => {
      return get().activePanel !== null
    }
  }))
)