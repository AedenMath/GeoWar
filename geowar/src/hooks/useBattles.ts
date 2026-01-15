// ============================================
// 🧬 USE BATTLES - GESTION DES COMBATS
// Résolution des conflits militaires
// ============================================

import { useCallback } from 'react'
import { useGameStore, useUIStore } from '../stores'
import { gameService } from '../services'
import type { BattleResult } from '../types'

export const useBattles = () => {
  const gameStore = useGameStore()
  const uiStore = useUIStore()

  // Résoudre une bataille
  const resolveBattle = useCallback(async (battleId: string) => {
    try {
      uiStore.setLoading(true)

      const battle = gameStore.battles.find(b => b.id === battleId)
      if (!battle) throw new Error('Battle not found')

      // Calculer le résultat
      const combatResult = gameService.calculateCombatResult(
        battle.attackerArmy,
        battle.defenderArmy
      )

      // Créer le résultat de bataille
      const battleResult: BattleResult = {
        winner: combatResult.winner,
        territoryConquered: combatResult.winner === 'attacker',
        attackerRemainingUnits: combatResult.attackerRemainingUnits,
        defenderRemainingUnits: combatResult.defenderRemainingUnits,
        rewards: {} // TODO: Calculer les récompenses
      }

      // Mettre à jour la bataille
      gameStore.endBattle(battleId, battleResult)

      // Mettre à jour les armées
      if (combatResult.attackerRemainingUnits.length > 0) {
        const updatedAttackerArmy = {
          ...battle.attackerArmy,
          units: combatResult.attackerRemainingUnits
        }
        gameStore.updateArmy(updatedAttackerArmy)
      }

      if (combatResult.defenderRemainingUnits.length > 0) {
        const updatedDefenderArmy = {
          ...battle.defenderArmy,
          units: combatResult.defenderRemainingUnits
        }
        gameStore.updateArmy(updatedDefenderArmy)
      }

      // Notifications
      const winnerMessage = combatResult.winner === 'attacker'
        ? 'Victoire ! Le territoire a été conquis.'
        : combatResult.winner === 'defender'
        ? 'Défaite. L\'attaque a échoué.'
        : 'Bataille terminée en match nul.'

      uiStore.addNotification({
        playerId: battle.attackerId,
        type: 'battle_result',
        title: 'Résultat de bataille',
        message: winnerMessage,
        updatedAt: new Date()
      })

      if (battle.defenderId && battle.defenderId !== 'neutral') {
        uiStore.addNotification({
          playerId: battle.defenderId,
          type: 'battle_result',
          title: 'Résultat de bataille',
          message: combatResult.winner === 'defender'
            ? 'Victoire ! Le territoire a été défendu.'
            : 'Défaite. Le territoire a été perdu.',
          updatedAt: new Date()
        })
      }

    } catch (error) {
      uiStore.setError(error instanceof Error ? error.message : 'Battle resolution failed')
    } finally {
      uiStore.setLoading(false)
    }
  }, [gameStore, uiStore])

  // Obtenir les batailles actives
  const getActiveBattles = useCallback(() => {
    return gameStore.getActiveBattles()
  }, [gameStore])

  // Obtenir les batailles d'un joueur
  const getPlayerBattles = useCallback((playerId: string) => {
    return gameStore.battles.filter(battle =>
      battle.attackerId === playerId || battle.defenderId === playerId
    )
  }, [gameStore])

  // Obtenir les détails d'une bataille
  const getBattleDetails = useCallback((battleId: string) => {
    return gameStore.battles.find(battle => battle.id === battleId)
  }, [gameStore])

  // Simuler une bataille (pour prévisualisation)
  const simulateBattle = useCallback((
    attackerArmy: any,
    defenderArmy: any
  ) => {
    return gameService.calculateCombatResult(attackerArmy, defenderArmy)
  }, [])

  return {
    // Actions
    resolveBattle,
    simulateBattle,

    // Getters
    getActiveBattles,
    getPlayerBattles,
    getBattleDetails,

    // État
    battles: gameStore.battles,
    activeBattlesCount: gameStore.getActiveBattles().length
  }
}