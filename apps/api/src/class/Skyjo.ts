import { Move, RoundState, SkyjoToJson, TurnState } from "shared/types/skyjo"
import { shuffle } from "../utils/shuffle"
import { Game, GameInterface } from "./Game"
import { SkyjoCard } from "./SkyjoCard"
import { SkyjoPlayer } from "./SkyjoPlayer"
import { SkyjoSettings } from "./SkyjoSettings"

const SHUFFLE_ITERATIONS = 3

interface SkyjoInterface extends GameInterface<SkyjoPlayer> {
  selectedCardValue: number | null
  firstPlayerToFinish: SkyjoPlayer | null
  turnState: TurnState
  lastMove: Move

  start(): void
  checkAllPlayersRevealedCards(count: number): void
  drawCard(): void
  pickFromDiscard(): void
  discardCard(value: number): void
  replaceCard(column: number, row: number): void
  turnCard(player: SkyjoPlayer, column: number, row: number): void
  nextTurn(): void
  reset(): void
  toJson(): SkyjoToJson
}

export class Skyjo
  extends Game<SkyjoPlayer, SkyjoSettings>
  implements SkyjoInterface
{
  private discardPile: number[] = []
  private drawPile: number[] = []

  selectedCardValue: number | null = null
  turnState: TurnState = "chooseAPile"
  lastMove: Move = "turn"
  roundState: RoundState = "waitingPlayersToTurnInitialCards"
  roundNumber: number = 1
  firstPlayerToFinish: SkyjoPlayer | null = null

  constructor(player: SkyjoPlayer, settings: SkyjoSettings) {
    super(player, settings)
  }

  start() {
    this.reset()
    this.lastMove = "turn"
    if (this.settings.initialTurnedCount === 0) this.roundState = "playing"

    super.start()
  }

  checkAllPlayersRevealedCards(count: number) {
    const allPlayersTurnedCards = this.getConnectedPlayers().every((player) =>
      player.hasRevealedCardCount(count),
    )

    if (allPlayersTurnedCards) {
      this.roundState = "playing"
      this.setFirstPlayerToStart()
    }
  }

  drawCard() {
    if (this.drawPile.length === 0) this.reloadDrawPile()

    const cardValue = this.drawPile.shift()!
    this.selectedCardValue = cardValue

    this.turnState = "throwOrReplace"
    this.lastMove = "pickFromDrawPile"
  }

  pickFromDiscard() {
    if (this.discardPile.length === 0) return
    const cardValue = this.discardPile.pop()!
    this.selectedCardValue = cardValue

    this.turnState = "replaceACard"
    this.lastMove = "pickFromDiscardPile"
  }

  discardCard(value: number) {
    this.discardPile.push(value)
    this.selectedCardValue = null

    this.turnState = "turnACard"
    this.lastMove = "throw"
  }

  replaceCard(column: number, row: number) {
    const player = this.getCurrentPlayer()
    const oldCardValue = player.cards[column][row].value
    player.replaceCard(column, row, this.selectedCardValue!)
    this.discardCard(oldCardValue)
    this.lastMove = "replace"
  }

  turnCard(player: SkyjoPlayer, column: number, row: number) {
    player.turnCard(column, row)
    this.lastMove = "turn"
  }

  override nextTurn() {
    const currentPlayer = this.getCurrentPlayer()

    this.checkCardsToDiscard(currentPlayer)

    const playerFinished = this.checkIfPlayerFinished(currentPlayer)

    if (this.firstPlayerToFinish && !playerFinished) {
      this.checkEndOfRound()
      this.checkEndOfGame()
    }

    this.turnState = "chooseAPile"
    super.nextTurn()
  }

  startNewRound() {
    this.roundNumber++
    this.initializeRound()
  }

  restartGameIfAllPlayersWantReplay() {
    if (this.getConnectedPlayers().every((player) => player.wantReplay)) {
      this.reset()
      super.reset()
    }
  }

  reset() {
    this.roundNumber = 1
    this.resetPlayers()
    this.initializeRound()
  }

  override toJson() {
    return {
      ...super.toJson(),
      admin: this.admin.toJson(),
      players: this.players.map((player) => player.toJson()),
      selectedCardValue: this.selectedCardValue,
      lastDiscardCardValue: this.discardPile[this.discardPile.length - 1],
      roundState: this.roundState,
      turnState: this.turnState,
      lastMove: this.lastMove,
      settings: this.settings.toJson(),
    }
  }

  //#region private methods

  private initializeCardPiles() {
    const defaultCards = [
      ...Array(5).fill(-2),
      ...Array(10).fill(-1),
      ...Array(15).fill(0),
      ...Array(10).fill(1),
      ...Array(10).fill(2),
      ...Array(10).fill(3),
      ...Array(10).fill(4),
      ...Array(10).fill(5),
      ...Array(10).fill(6),
      ...Array(10).fill(7),
      ...Array(10).fill(8),
      ...Array(10).fill(9),
      ...Array(10).fill(10),
      ...Array(10).fill(11),
      ...Array(10).fill(12),
    ]

    this.drawPile = shuffle(defaultCards, SHUFFLE_ITERATIONS)
    this.discardPile = []
  }

  private resetRoundPlayers() {
    this.getConnectedPlayers().forEach((player) => {
      player.resetRound()
    })
  }

  private givePlayersCards() {
    this.getConnectedPlayers().forEach((player) => {
      const cards = this.drawPile.splice(0, 12)
      player.setCards(cards, this.settings)
    })
  }

  private initializeRound() {
    this.firstPlayerToFinish = null
    this.selectedCardValue = null
    this.lastMove = "turn"
    this.initializeCardPiles()
    this.resetRoundPlayers()

    // Give to each player 12 cards
    this.givePlayersCards()

    // Turn first card from faceoff pile to discard pile
    this.discardPile.push(this.drawPile.shift()!)

    this.turnState = "chooseAPile"

    if (this.settings.initialTurnedCount === 0) this.roundState = "playing"
    else this.roundState = "waitingPlayersToTurnInitialCards"
  }

  private reloadDrawPile() {
    const lastCardOfDiscardPile = this.discardPile.pop()!
    this.drawPile = shuffle(this.discardPile, SHUFFLE_ITERATIONS)
    this.discardPile = [lastCardOfDiscardPile]
  }

  private setFirstPlayerToStart() {
    const playersScore = this.players.map((player, i) => {
      if (player.connectionStatus === "disconnected") return undefined

      const arrayScore = player.currentScoreArray()

      return {
        arrayScore,
        index: i,
      }
    })

    // the player with the highest score will start. If there is a tie, the player who have the highest card will start
    const playerToStart = playersScore.reduce((a, b) => {
      if (!a) return b
      if (!b) return a

      const aSum = a.arrayScore.reduce((acc, cur) => acc + cur, 0)
      const bSum = b.arrayScore.reduce((acc, cur) => acc + cur, 0)

      if (aSum === bSum) {
        const aMax = Math.max(...a.arrayScore)
        const bMax = Math.max(...b.arrayScore)

        return aMax > bMax ? a : b
      }

      return aSum > bSum ? a : b
    }, playersScore[0])

    this.turn = playerToStart!.index
  }

  private checkCardsToDiscard(player: SkyjoPlayer) {
    let cardsToDiscard: SkyjoCard[] = []

    if (this.settings.allowSkyjoForColumn) {
      cardsToDiscard = player.checkColumnsAndDiscard()
    }
    if (this.settings.allowSkyjoForRow) {
      cardsToDiscard = cardsToDiscard.concat(player.checkRowsAndDiscard())
    }

    if (cardsToDiscard.length > 0) {
      cardsToDiscard.forEach((card) => this.discardCard(card.value))

      if (this.settings.allowSkyjoForColumn && this.settings.allowSkyjoForRow)
        this.checkCardsToDiscard(player)
    }
  }

  private checkIfPlayerFinished(player: SkyjoPlayer) {
    // check if the player has turned all his cards
    const hasPlayerFinished = player.hasRevealedCardCount(
      player.cards.flat().length,
    )

    if (hasPlayerFinished && !this.firstPlayerToFinish) {
      this.firstPlayerToFinish = player
      this.roundState = "lastLap"

      return true
    }

    return false
  }

  private checkEndOfRound() {
    const connectedPlayers = this.getConnectedPlayers()
    const nextTurn = this.getNextTurn()

    if (connectedPlayers[nextTurn] === this.firstPlayerToFinish) {
      this.players.forEach((player) => {
        player.turnAllCards()
        this.checkCardsToDiscard(player)
        player.finalRoundScore()
      })

      this.multiplyScoreForFirstPlayer()

      this.roundState = "over"
    }
  }

  private removeDisconnectedPlayers() {
    this.players = this.getConnectedPlayers()
  }

  private resetPlayers() {
    this.removeDisconnectedPlayers()

    this.getConnectedPlayers().forEach((player) => player.reset())
  }

  private multiplyScoreForFirstPlayer() {
    const lastScoreIndex = this.roundNumber - 1
    const firstToFinishPlayerScore =
      this.firstPlayerToFinish!.scores[lastScoreIndex]

    if (
      typeof firstToFinishPlayerScore === "number" &&
      firstToFinishPlayerScore <= 0
    ) {
      return
    }

    const playersWithoutFirstPlayerToFinish = this.getConnectedPlayers().filter(
      (player) => player !== this.firstPlayerToFinish,
    )

    const opponentWithALowerOrEqualScore =
      playersWithoutFirstPlayerToFinish.some(
        (player) =>
          player.scores[lastScoreIndex] <= firstToFinishPlayerScore &&
          player.scores[lastScoreIndex] !== "-",
      )

    if (opponentWithALowerOrEqualScore) {
      this.firstPlayerToFinish!.scores[lastScoreIndex] =
        +this.firstPlayerToFinish!.scores[lastScoreIndex] *
        this.settings.multiplierForFirstPlayer
      this.firstPlayerToFinish!.recalculateScore()
    }
  }

  private checkEndOfGame() {
    if (
      this.getConnectedPlayers().some(
        (player) => player.score >= this.settings.scoreToEndGame,
      )
    ) {
      this.roundState = "over"
      this.status = "finished"
    }
  }
  //#endregion
}
