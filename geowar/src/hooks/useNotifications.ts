// ============================================
// 🧬 USE NOTIFICATIONS - GESTION DES ALERTES
// Système de notifications utilisateur
// ============================================

import { useCallback } from 'react'
import { useUIStore } from '../stores'
import type { Notification } from '../types'

export const useNotifications = () => {
  const uiStore = useUIStore()

  // Ajouter une notification
  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    actionUrl?: string,
    data?: Record<string, unknown>
  ) => {
    uiStore.addNotification({
      playerId: '', // TODO: Utiliser l'ID du joueur actuel
      type,
      title,
      message,
      actionUrl,
      data,
      updatedAt: new Date()
    })
  }, [uiStore])

  // Marquer comme lue
  const markAsRead = useCallback((notificationId: string) => {
    uiStore.markNotificationAsRead(notificationId)
  }, [uiStore])

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(() => {
    uiStore.markAllNotificationsAsRead()
  }, [uiStore])

  // Supprimer une notification
  const removeNotification = useCallback((notificationId: string) => {
    uiStore.removeNotification(notificationId)
  }, [uiStore])

  // Vider toutes les notifications
  const clearAll = useCallback(() => {
    uiStore.clearNotifications()
  }, [uiStore])

  // Obtenir les notifications non lues
  const getUnreadNotifications = useCallback(() => {
    return uiStore.notifications.filter(n => !n.isRead)
  }, [uiStore.notifications])

  // Obtenir les notifications par type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return uiStore.getNotificationsByType(type)
  }, [uiStore])

  // Créer des notifications prédéfinies
  const notifyAttackIncoming = useCallback((territoryName: string, attackerName: string) => {
    addNotification(
      'attack_incoming',
      'Attaque imminente !',
      `${attackerName} attaque ${territoryName}`,
      `/territory/${territoryName}`
    )
  }, [addNotification])

  const notifyBattleResult = useCallback((result: string, territoryName: string) => {
    addNotification(
      'battle_result',
      'Résultat de bataille',
      `Bataille terminée : ${result} sur ${territoryName}`,
      `/territory/${territoryName}`
    )
  }, [addNotification])

  const notifyTerritoryLost = useCallback((territoryName: string) => {
    addNotification(
      'territory_lost',
      'Territoire perdu !',
      `Vous avez perdu le contrôle de ${territoryName}`,
      `/territory/${territoryName}`
    )
  }, [addNotification])

  const notifyTerritoryGained = useCallback((territoryName: string) => {
    addNotification(
      'territory_gained',
      'Territoire conquis !',
      `Vous contrôlez maintenant ${territoryName}`,
      `/territory/${territoryName}`
    )
  }, [addNotification])

  const notifyResourceDepleted = useCallback((resource: string) => {
    addNotification(
      'resource_depleted',
      'Ressource épuisée',
      `Vous n'avez plus de ${resource}`,
      '/resources'
    )
  }, [addNotification])

  const notifyBuildingComplete = useCallback((buildingType: string, territoryName: string) => {
    addNotification(
      'building_complete',
      'Construction terminée',
      `${buildingType} construit sur ${territoryName}`,
      `/territory/${territoryName}`
    )
  }, [addNotification])

  return {
    // État
    notifications: uiStore.notifications,
    unreadCount: uiStore.getUnreadNotificationsCount(),

    // Actions de base
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,

    // Getters
    getUnreadNotifications,
    getNotificationsByType,

    // Notifications prédéfinies
    notifyAttackIncoming,
    notifyBattleResult,
    notifyTerritoryLost,
    notifyTerritoryGained,
    notifyResourceDepleted,
    notifyBuildingComplete
  }
}