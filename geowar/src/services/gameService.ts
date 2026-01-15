// ============================================
// 💉 GAME SERVICE - LOGIQUE DE JEU
// Moteur de calcul et règles du jeu
// ============================================

import type { GameService } from './types'
import type { Territory, Army, Unit, Resources, UnitType } from '../types'

class GameServiceImpl implements GameService {
  private gameLoopInterval: number | null = null
  private tickRate = 1000 // 1 seconde par tick

  async initialize(): Promise<void> {
    // Initialisation du jeu
    console.log('🎮 Initializing GeoWar game engine')
    // Charger les données initiales, configurer les règles, etc.
  }

  startGameLoop(): void {
    if (this.gameLoopInterval) return

    this.gameLoopInterval = window.setInterval(() => {
      this.processTick()
    }, this.tickRate)

    console.log('🎮 Game loop started')
  }

  stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval)
      this.gameLoopInterval = null
      console.log('🎮 Game loop stopped')
    }
  }

  processTick(): void {
    // Logique exécutée à chaque tick
    // Production de ressources
    // Mise à jour des bâtiments
    // Résolution des batailles
    // Événements aléatoires
    // etc.

    console.log('🎮 Processing game tick')
  }

  async saveGame(): Promise<void> {
    // Sauvegarder l'état du jeu
    console.log('💾 Saving game state')
    // Implémentation de la sauvegarde
  }

  async loadGame(saveId: string): Promise<void> {
    // Charger une sauvegarde
    console.log('📁 Loading game state:', saveId)
    // Implémentation du chargement
  }

  calculateResourceProduction(territory: Territory): Resources {
    let production: Resources = {
      gold: 0,
      oil: 0,
      steel: 0,
      food: 0,
      uranium: 0,
      rareEarth: 0,
      electricity: 0
    }

    // Production de base du territoire
    production.gold += territory.gdp * 0.01
    production.food += territory.population * 0.001

    // Bonus des bâtiments
    territory.buildings.forEach(building => {
      if (building.isActive) {
        Object.entries(building.productionBonus).forEach(([resource, bonus]) => {
          if (bonus > 0) {
            production[resource as keyof Resources] += bonus
          }
        })
      }
    })

    // Appliquer les modificateurs de recherche
    // TODO: Intégrer les bonus de recherche

    return production
  }

  calculateCombatResult(attacker: Army, defender: Army): {
    winner: 'attacker' | 'defender' | 'draw'
    attackerLosses: Partial<Record<UnitType, number>>
    defenderLosses: Partial<Record<UnitType, number>>
    attackerRemainingUnits: Unit[]
    defenderRemainingUnits: Unit[]
  } {
    const attackerPower = this.calculateArmyPower(attacker)
    const defenderPower = this.calculateArmyPower(defender)

    // Bonus défensif
    const defenderBonus = defender.status === 'defending' ? 1.5 : 1.0
    const effectiveDefenderPower = defenderPower * defenderBonus

    // Calcul des pertes
    const totalPower = attackerPower + effectiveDefenderPower
    const attackerLossRatio = effectiveDefenderPower / totalPower
    const defenderLossRatio = attackerPower / totalPower

    const attackerLosses = this.distributeLosses(attacker, attackerLossRatio)
    const defenderLosses = this.distributeLosses(defender, defenderLossRatio)

    // Appliquer les pertes
    const attackerRemainingUnits = this.applyLosses(attacker.units, attackerLosses)
    const defenderRemainingUnits = this.applyLosses(defender.units, defenderLosses)

    // Déterminer le vainqueur
    const attackerRemainingPower = this.calculateUnitsPower(attackerRemainingUnits)
    const defenderRemainingPower = this.calculateUnitsPower(defenderRemainingUnits)

    let winner: 'attacker' | 'defender' | 'draw'
    if (attackerRemainingPower > defenderRemainingPower * 1.2) {
      winner = 'attacker'
    } else if (defenderRemainingPower > attackerRemainingPower * 1.2) {
      winner = 'defender'
    } else {
      winner = 'draw'
    }

    return {
      winner,
      attackerLosses,
      defenderLosses,
      attackerRemainingUnits,
      defenderRemainingUnits
    }
  }

  validateMove(army: Army): boolean {
    // Vérifier si le mouvement est valide
    // Distance, propriété, etc.

    // Pour l'instant, mouvement toujours valide si armée existe
    return !!army
  }

  private calculateArmyPower(army: Army): number {
    return army.units.reduce((total, unit) => {
      return total + (unit.attack + unit.defense) * unit.quantity
    }, 0)
  }

  private calculateUnitsPower(units: Unit[]): number {
    return units.reduce((total, unit) => {
      return total + (unit.attack + unit.defense) * unit.quantity
    }, 0)
  }

  private distributeLosses(army: Army, lossRatio: number): Partial<Record<UnitType, number>> {
    const losses: Partial<Record<UnitType, number>> = {}

    army.units.forEach(unit => {
      const unitLosses = Math.floor(unit.quantity * lossRatio * (unit.health / 100))
      losses[unit.type] = (losses[unit.type] || 0) + unitLosses
    })

    return losses
  }

  private applyLosses(units: Unit[], losses: Partial<Record<UnitType, number>>): Unit[] {
    return units.map(unit => ({
      ...unit,
      quantity: Math.max(0, unit.quantity - (losses[unit.type] || 0))
    })).filter(unit => unit.quantity > 0)
  }
}

export const gameService = new GameServiceImpl()