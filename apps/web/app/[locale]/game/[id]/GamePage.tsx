"use client"

import AdminLobby from "@/components/AdminLobby"
import Chat from "@/components/Chat"
import CopyLink from "@/components/CopyLink"
import DiscardPile from "@/components/DiscardPile"
import DrawPile from "@/components/DrawPile"
import EndGameDialog from "@/components/EndGameDialog"
import EndRoundDialog from "@/components/EndRoundDialog"
import GameInfo from "@/components/GameInfo"
import OpponentBoard from "@/components/OpponentBoard"
import PlayerBoard from "@/components/PlayerBoard"
import RulesDialog from "@/components/RulesDialog"
import Scoreboard from "@/components/Scoreboard"
import SelectedCard from "@/components/SelectedCard"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { isCurrentUserTurn } from "@/lib/skyjo"

type GamePageProps = {
  locale: string
}

const GamePage = ({ locale }: GamePageProps) => {
  const { game, player, opponents } = useSkyjo()

  const isPlayerTurn = isCurrentUserTurn(game, player?.name)

  return (
    <div className="h-full w-full bg-background flex flex-col gap-6">
      <div className="w-full flex flex-row items-start h-full">
        <div className="w-10"></div>
        <div className="flex flex-1 flex-row justify-evenly w-full h-full">
          {opponents[1].map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.name)}
            />
          ))}
        </div>
        <div className="flex flex-row justify-end">
          <div className="flex flex-col gap-4 items-center justify-start">
            <Scoreboard />
            <RulesDialog />
          </div>
        </div>
      </div>
      <div className="w-full h-2/6 grid grid-cols-3 grid-flow-row">
        <div className="flex flex-col items-start">
          {opponents[0].map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.name)}
            />
          ))}
        </div>
        <div className="relative flex flex-col justify-center items-center gap-4">
            <DrawPile isPlayerTurn={isPlayerTurn} />
            <DiscardPile isPlayerTurn={isPlayerTurn} />
          </div>
          <AdminLobby />
        </div>
        <div className="flex flex-col items-end">
          {opponents[2].map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.name)}
            />
          ))}
        </div>
      </div>
      <div className="w-full h-full grid grid-cols-3 grid-flow-row items-end">
        <div className="flex flex-col gap-2">
          <CopyLink />
          <GameInfo />
        </div>

        {player && <PlayerBoard player={player} isPlayerTurn={isPlayerTurn} />}
      </div>
      <EndRoundDialog />
      <EndGameDialog />
      <Chat />
    </div>
  )
}

export default GamePage
