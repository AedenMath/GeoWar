// ============================================
// 💉 SOCKET SERVICE - COMMUNICATION TEMPS RÉEL
// WebSocket pour les événements live
// ============================================

import type { SocketService } from './types'
import type { Player, Territory, Battle, GameEvent, Notification, ChatMessage } from '../types'

class SocketServiceImpl implements SocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private url: string

  // Callbacks
  private onPlayerJoinedCallbacks: ((player: Player) => void)[] = []
  private onPlayerLeftCallbacks: ((playerId: string) => void)[] = []
  private onTerritoryUpdatedCallbacks: ((territory: Territory) => void)[] = []
  private onBattleStartedCallbacks: ((battle: Battle) => void)[] = []
  private onBattleUpdatedCallbacks: ((battle: Battle) => void)[] = []
  private onBattleEndedCallbacks: ((result: any) => void)[] = []
  private onNotificationCallbacks: ((notification: Notification) => void)[] = []
  private onGameEventCallbacks: ((event: GameEvent) => void)[] = []
  private onChatMessageCallbacks: ((message: ChatMessage) => void)[] = []

  constructor(url: string = 'ws://localhost:3001') {
    this.url = url
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return

    try {
      this.socket = new WebSocket(this.url)

      this.socket.onopen = () => {
        console.log('🧠 Socket connected to GeoWar server')
        this.reconnectAttempts = 0
      }

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse socket message:', error)
        }
      }

      this.socket.onclose = () => {
        console.log('🧠 Socket disconnected')
        this.attemptReconnect()
      }

      this.socket.onerror = (error) => {
        console.error('🧠 Socket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect socket:', error)
      this.attemptReconnect()
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.reconnectAttempts = 0
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'player_joined':
        this.onPlayerJoinedCallbacks.forEach(cb => cb(message.payload))
        break
      case 'player_left':
        this.onPlayerLeftCallbacks.forEach(cb => cb(message.payload))
        break
      case 'territory_updated':
        this.onTerritoryUpdatedCallbacks.forEach(cb => cb(message.payload))
        break
      case 'battle_started':
        this.onBattleStartedCallbacks.forEach(cb => cb(message.payload))
        break
      case 'battle_updated':
        this.onBattleUpdatedCallbacks.forEach(cb => cb(message.payload))
        break
      case 'battle_ended':
        this.onBattleEndedCallbacks.forEach(cb => cb(message.payload))
        break
      case 'notification':
        this.onNotificationCallbacks.forEach(cb => cb(message.payload))
        break
      case 'game_event':
        this.onGameEventCallbacks.forEach(cb => cb(message.payload))
        break
      case 'chat_message':
        this.onChatMessageCallbacks.forEach(cb => cb(message.payload))
        break
      default:
        console.log('Unknown socket message type:', message.type)
    }
  }

  private send(type: string, payload?: any): void {
    if (!this.isConnected) {
      console.warn('Socket not connected, cannot send message')
      return
    }

    this.socket!.send(JSON.stringify({ type, payload }))
  }

  // Event listeners
  onPlayerJoined(callback: (player: Player) => void): void {
    this.onPlayerJoinedCallbacks.push(callback)
  }

  onPlayerLeft(callback: (playerId: string) => void): void {
    this.onPlayerLeftCallbacks.push(callback)
  }

  onTerritoryUpdated(callback: (territory: Territory) => void): void {
    this.onTerritoryUpdatedCallbacks.push(callback)
  }

  onBattleStarted(callback: (battle: Battle) => void): void {
    this.onBattleStartedCallbacks.push(callback)
  }

  onBattleUpdated(callback: (battle: Battle) => void): void {
    this.onBattleUpdatedCallbacks.push(callback)
  }

  onBattleEnded(callback: (result: any) => void): void {
    this.onBattleEndedCallbacks.push(callback)
  }

  onNotification(callback: (notification: Notification) => void): void {
    this.onNotificationCallbacks.push(callback)
  }

  onGameEvent(callback: (event: GameEvent) => void): void {
    this.onGameEventCallbacks.push(callback)
  }

  // Actions
  sendChatMessage(message: string, channel: string = 'global'): void {
    this.send('chat_message', { content: message, channel })
  }

  updatePlayerStatus(status: 'online' | 'away' | 'busy'): void {
    this.send('status_update', { status })
  }
}

export const socketService = new SocketServiceImpl()