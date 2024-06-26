import { Opponents } from "@/types/opponents"
import { SkyjoToJson } from "shared/types/skyjo"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

export const getCurrentUser = (
  players: SkyjoToJson["players"] | undefined,
  socketId: string,
) => {
  if (!players) {
    return undefined
  }

  return players.find((player) => player.socketId === socketId)
}

export const getConnectedPlayers = (
  players: SkyjoToJson["players"] | undefined,
) => {
  if (!players) {
    return []
  }

  return players.filter((player) => player.connectionStatus !== "disconnected")
}

export const getOpponents = (
  players: SkyjoToJson["players"] | undefined,
  socketId: string,
): Opponents => {
  if (!players) {
    return [[], [], []]
  }

  const connectedPlayers = getConnectedPlayers(players)

  const playerIndex = connectedPlayers.findIndex(
    (player) => player.socketId === socketId,
  )

  const connectedOpponents = [
    ...connectedPlayers.slice(playerIndex + 1),
    ...connectedPlayers.slice(0, playerIndex),
  ]

  // if 2 players then [[], [player, player], []]
  // if 3 players then [[player], [player], [player]]
  // if 4 players then [[player], [player, player], [player]]
  // if 5 players then [[player], [player, player, player], [player]]
  // if 6 players then [[player], [player, player, player, player], [player]]
  // if 7 players then [[player], [player, player, player, player, player], [player]]

  if (connectedOpponents.length <= 2) {
    return [[], connectedOpponents, []]
  } else {
    const firstOpponent = connectedOpponents.shift()!
    const lastOpponent = connectedOpponents.pop()!

    return [[firstOpponent], connectedOpponents, [lastOpponent]]
  }
}

export const isCurrentUserTurn = (game?: SkyjoToJson, socketId?: string) => {
  if (!socketId || !game) return false
  if (
    game.roundState === "waitingPlayersToTurnInitialCards" &&
    game.status === "playing"
  )
    return true

  if (game.status !== "playing" || game.roundState === "over") return false

  return game.players[game.turn].socketId === socketId
}

export const canTurnInitialCard = (game: SkyjoToJson) => {
  return (
    game.status === "playing" &&
    game.roundState === "waitingPlayersToTurnInitialCards"
  )
}

export const hasTurnedCard = (player: SkyjoPlayerToJson, count: number) => {
  const visibleCards = player.cards.flat().filter((card) => card.isVisible)

  return visibleCards.length === count
}

export const getWinner = (game: SkyjoToJson) => {
  const connectedPlayers = getConnectedPlayers(game.players)
  return connectedPlayers.reduce((prev, current) =>
    prev.score < current.score ? prev : current,
  )
}
