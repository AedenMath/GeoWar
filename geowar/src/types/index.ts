// ============================================
// 🧬 GEOWAR DNA - TYPES CENTRAUX
// Tous les composants héritent de cet ADN
// ============================================

// === ENTITÉS DE BASE ===
export interface Entity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// === JOUEUR ===
export interface Player extends Entity {
  username: string
  vispiria: string // Monnaie
  level: number
  experience: number
  reputation: number
  territories: Territory[]
  armies: Army[]
  resources: Resources
  alliances: Alliance[]
  isOnline: boolean
}

// === TERRITOIRE ===
export interface Territory extends Entity {
  name: string
  countryCode: string
  ownerId: string | null
  population: number
  gdp: number
  militaryPower: number
  resources: TerritoryResources
  buildings: Building[]
  defenses: Defense[]
  coordinates: GeoCoordinates
  neighbors: string[] // IDs des territoires voisins
  status: TerritoryStatus
}

export interface GeoCoordinates {
  lat: number
  lng: number
  bounds?: [[number, number], [number, number]]
}

export type TerritoryStatus = 'neutral' | 'owned' | 'contested' | 'under_attack' | 'protected'

// === RESSOURCES ===
export interface Resources {
  gold: number
  oil: number
  steel: number
  food: number
  uranium: number
  rareEarth: number
  electricity: number
}

export interface TerritoryResources extends Resources {
  productionRates: Resources
  storageCapacity: Resources
}

// === MILITAIRE ===
export interface Army extends Entity {
  name: string
  ownerId: string
  units: Unit[]
  location: string // Territory ID
  status: ArmyStatus
  morale: number
  experience: number
}

export type ArmyStatus = 'idle' | 'moving' | 'attacking' | 'defending' | 'retreating'

export interface Unit extends Entity {
  type: UnitType
  quantity: number
  health: number
  attack: number
  defense: number
  speed: number
  upkeepCost: Resources
}

export type UnitType = 
  | 'infantry' 
  | 'tank' 
  | 'artillery' 
  | 'helicopter' 
  | 'fighter' 
  | 'bomber' 
  | 'submarine' 
  | 'destroyer' 
  | 'carrier'
  | 'missile'
  | 'nuke'

// === BÂTIMENTS ===
export interface Building extends Entity {
  type: BuildingType
  level: number
  territoryId: string
  productionBonus: Partial<Resources>
  isActive: boolean
  upgradeProgress?: number
}

export type BuildingType = 
  | 'headquarters'
  | 'barracks'
  | 'factory'
  | 'refinery'
  | 'farm'
  | 'mine'
  | 'power_plant'
  | 'research_lab'
  | 'bank'
  | 'port'
  | 'airport'

// === DÉFENSES ===
export interface Defense extends Entity {
  type: DefenseType
  level: number
  territoryId: string
  health: number
  damage: number
  range: number
}

export type DefenseType = 'wall' | 'turret' | 'anti_air' | 'missile_defense' | 'bunker' | 'radar'

// === ALLIANCES ===
export interface Alliance extends Entity {
  name: string
  tag: string
  leaderId: string
  members: AllianceMember[]
  description: string
  isOpen: boolean
  requiredReputation: number
}

export interface AllianceMember {
  playerId: string
  role: 'leader' | 'officer' | 'member'
  joinedAt: Date
  contribution: number
}

// === COMBAT ===
export interface Battle extends Entity {
  attackerId: string
  defenderId: string
  territoryId: string
  attackerArmy: Army
  defenderArmy: Army
  status: BattleStatus
  rounds: BattleRound[]
  result?: BattleResult
}

export type BattleStatus = 'preparing' | 'in_progress' | 'finished'

export interface BattleRound {
  roundNumber: number
  attackerDamage: number
  defenderDamage: number
  attackerLosses: Partial<Record<UnitType, number>>
  defenderLosses: Partial<Record<UnitType, number>>
}

export interface BattleResult {
  winner: 'attacker' | 'defender' | 'draw'
  territoryConquered: boolean
  attackerRemainingUnits: Unit[]
  defenderRemainingUnits: Unit[]
  rewards: Partial<Resources>
}

// === ÉVÉNEMENTS DE JEU ===
export interface GameEvent extends Entity {
  type: GameEventType
  title: string
  description: string
  affectedTerritories: string[]
  duration: number // en heures
  effects: GameEventEffect[]
  isActive: boolean
}

export type GameEventType = 
  | 'natural_disaster'
  | 'economic_boom'
  | 'pandemic'
  | 'revolution'
  | 'discovery'
  | 'war_declaration'

export interface GameEventEffect {
  target: 'resources' | 'military' | 'population' | 'morale'
  modifier: number // pourcentage
  resource?: keyof Resources
}

// === NOTIFICATIONS ===
export interface Notification extends Entity {
  playerId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  data?: Record<string, unknown>
}

export type NotificationType = 
  | 'attack_incoming'
  | 'battle_result'
  | 'territory_lost'
  | 'territory_gained'
  | 'alliance_invite'
  | 'resource_depleted'
  | 'building_complete'
  | 'research_complete'
  | 'achievement'

// === RECHERCHE ===
export interface Research extends Entity {
  type: ResearchType
  level: number
  progress: number
  isComplete: boolean
  bonuses: ResearchBonus[]
}

export type ResearchType = 
  | 'military_tactics'
  | 'advanced_weapons'
  | 'economic_growth'
  | 'resource_efficiency'
  | 'defensive_structures'
  | 'espionage'
  | 'diplomacy'
  | 'nuclear_program'

export interface ResearchBonus {
  type: 'attack' | 'defense' | 'production' | 'speed' | 'capacity'
  value: number
  target?: UnitType | BuildingType | keyof Resources
}

// === UI STATE ===
export interface UIState {
  selectedTerritory: string | null
  selectedArmy: string | null
  activePanel: PanelType | null
  modalOpen: ModalType | null
  notifications: Notification[]
  isLoading: boolean
  error: string | null
}

export type PanelType = 'territory' | 'army' | 'diplomacy' | 'research' | 'alliance' | 'profile'
export type ModalType = 'attack' | 'build' | 'recruit' | 'trade' | 'settings' | 'confirm'

// === GAME STATE ===
export interface GameState {
  currentPlayer: Player | null
  players: Map<string, Player>
  territories: Map<string, Territory>
  armies: Map<string, Army>
  battles: Battle[]
  events: GameEvent[]
  tick: number
  isPaused: boolean
  gameSpeed: number
}

// === API RESPONSES ===
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

// === SOCKET EVENTS ===
export type SocketEvent = 
  | { type: 'player_joined'; payload: Player }
  | { type: 'player_left'; payload: { playerId: string } }
  | { type: 'territory_updated'; payload: Territory }
  | { type: 'battle_started'; payload: Battle }
  | { type: 'battle_updated'; payload: Battle }
  | { type: 'battle_ended'; payload: BattleResult }
  | { type: 'chat_message'; payload: ChatMessage }
  | { type: 'notification'; payload: Notification }
  | { type: 'game_event'; payload: GameEvent }

export interface ChatMessage extends Entity {
  senderId: string
  senderName: string
  content: string
  channel: 'global' | 'alliance' | 'private'
  recipientId?: string
}