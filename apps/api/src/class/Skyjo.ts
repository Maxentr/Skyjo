import { RoundState, SkyjoToJson, TurnState } from "shared/types/skyjo"
import { SkyjoCardToJson } from "shared/types/skyjoCard"
import { shuffle } from "../utils/shuffle"
import { Game, GameInterface } from "./Game"
import { SkyjoCard } from "./SkyjoCard"
import { SkyjoPlayer } from "./SkyjoPlayer"

const SHUFFLE_ITERATIONS = 3

interface SkyjoInterface extends GameInterface<SkyjoPlayer> {
  selectedCard: SkyjoCardToJson | null
  firstPlayerToFinish: SkyjoPlayer | null
  turnState: TurnState
  initializeCardPiles(): void
  givePlayersCards(player: SkyjoPlayer): void
  checkAllPlayersRevealedCards(count: number): void
  drawCard(): void
  pickFromDiscard(): void
  discardCard(card: SkyjoCardToJson): void
  checkEndOfRound(): void
  endGame(): void
  reset(): void

  toJson(): SkyjoToJson
}

export class Skyjo extends Game<SkyjoPlayer> implements SkyjoInterface {
  selectedCard: SkyjoCard | null = null
  turnState: TurnState = "chooseAPile"
  private _discardPile: number[] = []
  private _drawPile: number[] = []
  roundState: RoundState = "waitingPlayersToTurnTwoCards"
  roundNumber: number = 1
  firstPlayerToFinish: SkyjoPlayer | null = null

  constructor(player: SkyjoPlayer, privateGame: boolean = false) {
    super(player, 8, privateGame)
  }

  private get discardPile() {
    return this._discardPile
  }
  private set discardPile(value: number[]) {
    this._discardPile = value
  }

  private get drawPile() {
    return this._drawPile
  }
  private set drawPile(value: number[]) {
    this._drawPile = value
  }

  public initializeCardPiles() {
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

  private reloadDrawPile() {
    const lastCardOfDiscardPile = this.discardPile.pop()!
    this.drawPile = shuffle(this.discardPile, SHUFFLE_ITERATIONS)
    this.discardPile = [lastCardOfDiscardPile]
  }

  private resetPlayers() {
    this.getConnectedPlayers().forEach((player) => {
      player.reset()
    })
  }

  private resetRoundPlayers() {
    this.getConnectedPlayers().forEach((player) => {
      player.resetRound()
    })
  }

  private setFirstPlayerToStart() {
    const playersScore = this.getConnectedPlayers().map((player, i) => {
      const arrayScore = player.currentScoreArray()

      return {
        arrayScore,
        index: i,
      }
    })

    // the player with the highest score will start. If there is a tie, the player who have the highest card will start
    const playerToStart = playersScore.reduce((a, b) => {
      const aSum = a.arrayScore.reduce((acc, cur) => acc + cur, 0)
      const bSum = b.arrayScore.reduce((acc, cur) => acc + cur, 0)

      if (aSum === bSum) {
        const aMax = Math.max(...a.arrayScore)
        const bMax = Math.max(...b.arrayScore)

        return aMax > bMax ? a : b
      }

      return aSum > bSum ? a : b
    })

    this.turn = playerToStart.index
  }

  public start() {
    this.reset()

    super.start()
  }

  public givePlayersCards() {
    this.getConnectedPlayers().forEach((player) => {
      const cards = this.drawPile.splice(0, 12)
      player.setCards(cards)
    })
  }

  public checkAllPlayersRevealedCards(count: number) {
    const allPlayersTurnedCards = this.getConnectedPlayers().every((player) =>
      player.hasRevealedCardCount(count),
    )

    if (allPlayersTurnedCards) {
      this.roundState = "playing"
      this.setFirstPlayerToStart()
    }
  }

  public drawCard() {
    if (this.drawPile.length === 0) this.reloadDrawPile()

    const cardValue = this.drawPile.shift()!
    const card = new SkyjoCard(cardValue)
    card.turnVisible()
    this.selectedCard = card

    this.turnState = "throwOrReplace"
  }

  public pickFromDiscard() {
    if (this.discardPile.length === 0) return
    const cardValue = this.discardPile.pop()!
    const card = new SkyjoCard(cardValue)
    card.turnVisible()
    this.selectedCard = card

    this.turnState = "replaceACard"
  }

  public discardCard(card: SkyjoCard) {
    this.discardPile.push(card.value)
    this.selectedCard = null

    this.turnState = "turnACard"
  }

  public replaceCard(column: number, row: number) {
    const player = this.getCurrentPlayer()
    const oldCard = player.cards[column][row]
    const selectedCard = this.selectedCard
    this.discardCard(oldCard)
    player.replaceCard(column, row, selectedCard!)
  }

  override nextTurn() {
    this.turnState = "chooseAPile"
    super.nextTurn()
  }

  public checkEndOfRound() {
    const connectedPlayers = this.getConnectedPlayers()
    const nextTurn = this.getNextTurn()

    if (connectedPlayers[nextTurn] === this.firstPlayerToFinish) {
      this.players.forEach((player) => {
        player.finalRoundScore()
      })

      this.doubleScoreForFirstPlayer()

      this.roundState = "over"
    }
  }

  private doubleScoreForFirstPlayer() {
    const lastScoreIndex = this.roundNumber - 1
    const firstToFinishPlayerScore =
      this.firstPlayerToFinish!.scores[lastScoreIndex]

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
        +this.firstPlayerToFinish!.scores[lastScoreIndex] * 2
      this.firstPlayerToFinish!.recalculateScore()
    }
  }

  public startNewRound() {
    this.roundNumber++
    this.initializeRound()
  }

  public initializeRound() {
    this.firstPlayerToFinish = null
    this.selectedCard = null
    this.initializeCardPiles()
    this.resetRoundPlayers()

    // Give to each player 12 cards
    this.givePlayersCards()

    // Turn first card from faceoff pile to discard pile
    this.discardPile.push(this.drawPile.shift()!)

    this.turnState = "chooseAPile"
    this.roundState = "waitingPlayersToTurnTwoCards"
  }

  public reset() {
    this.roundNumber = 1
    this.firstPlayerToFinish = null
    this.selectedCard = null
    this.initializeCardPiles()
    this.resetPlayers()

    // Give to each player 12 cards
    this.givePlayersCards()

    // Turn first card from faceoff pile to discard pile
    this.discardPile.push(this.drawPile.shift()!)

    this.turnState = "chooseAPile"
    this.roundState = "waitingPlayersToTurnTwoCards"
  }

  public checkEndGame() {
    if (this.getConnectedPlayers().some((player) => player.score >= 100)) {
      this.endGame()
    }
  }

  public endGame() {
    this.roundState = "over"
    this.status = "finished"
  }

  override toJson() {
    return {
      ...super.toJson(),
      admin: this.admin.toJson(),
      players: this.players.map((player) => player.toJson()),
      selectedCard: this.selectedCard?.toJson(),
      lastDiscardCardValue: this.discardPile[this.discardPile.length - 1],
      roundState: this.roundState,
      turnState: this.turnState,
    }
  }
}
