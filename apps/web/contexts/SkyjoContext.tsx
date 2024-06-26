"use client"

import { useSocket } from "@/contexts/SocketContext"
import { getCurrentUser, getOpponents } from "@/lib/skyjo"
import { useRouter } from "@/navigation"
import { Opponents } from "@/types/opponents"
import { useTranslations } from "next-intl"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { ChatMessage } from "shared/types/chat"
import { SkyjoToJson } from "shared/types/skyjo"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"
import { ChangeSettings } from "shared/validations/changeSettings"
import { PlayPickCard } from "shared/validations/play"

type SkyjoContextInterface = {
  game: SkyjoToJson
  player: SkyjoPlayerToJson
  opponents: Opponents
  actions: {
    sendMessage: (message: string) => void
    changeSettings: (settings: ChangeSettings) => void
    resetSettings: () => void
    startGame: () => void
    playRevealCard: (column: number, row: number) => void
    pickCardFromPile: (pile: PlayPickCard["pile"]) => void
    replaceCard: (column: number, row: number) => void
    discardSelectedCard: () => void
    turnCard: (column: number, row: number) => void
    replay: () => void
    leave: () => void
  }
  chat: ChatMessage[]
}

const SkyjoContext = createContext({} as SkyjoContextInterface)

interface SkyjoContextProviderProps extends PropsWithChildren {
  gameId: string
}

const SkyjoContextProvider = ({
  children,
  gameId,
}: SkyjoContextProviderProps) => {
  const { socket } = useSocket()
  const router = useRouter()
  const t = useTranslations("utils.server.messages")

  const [game, setGame] = useState<SkyjoToJson>()
  const [chat, setChat] = useState<ChatMessage[]>([])

  const player = getCurrentUser(game?.players, socket.id ?? "")
  const opponents = getOpponents(game?.players, socket.id ?? "")

  useEffect(() => {
    if (!gameId) return

    initGameListeners()

    // get game
    socket.emit("get")

    return destroyGameListeners
  }, [socket, gameId])

  //#region listeners
  const onGameUpdate = async (game: SkyjoToJson) => {
    console.log("game updated", game)
    setGame(game)
  }

  const onMessageReceived = (message: ChatMessage) => {
    if (message.type === "message") setChat((prev) => [message, ...prev])
    else {
      const messageContent = t(message.message, { username: message.username })

      setChat((prev) => [
        {
          id: message.id,
          username: undefined,
          message: messageContent,
          type: message.type,
        } as ChatMessage,
        ...prev,
      ])
    }
  }

  const onLeave = () => {
    setGame(undefined)
    setChat([])
    router.push("/")
  }

  const initGameListeners = () => {
    socket.on("game", onGameUpdate)
    socket.on("message", onMessageReceived)
    socket.on("leave:success", onLeave)
  }
  const destroyGameListeners = () => {
    socket.off("game", onGameUpdate)
    socket.off("message", onMessageReceived)
    socket.off("leave:success", onLeave)
  }
  //#endregion

  //#region actions
  const sendMessage = (message: string) => {
    if (!player) return

    socket.send({
      message,
      username: player.name,
    })
  }

  const changeSettings = (settings: ChangeSettings) => {
    if (socket.id !== game?.admin.socketId) return

    if (
      settings.cardPerColumn * settings.cardPerRow <=
      settings.initialTurnedCount
    ) {
      settings.initialTurnedCount =
        settings.cardPerColumn * settings.cardPerRow - 1
    }

    if (settings.cardPerColumn === 1 && settings.cardPerRow === 1) {
      settings.cardPerColumn = 2
    }

    socket.emit("settings", settings)
  }

  const resetSettings = () => {
    if (socket.id !== game?.admin.socketId) return

    socket.emit("settings", {
      private: game?.settings.private,
    })
  }

  const startGame = () => {
    if (socket.id !== game?.admin.socketId) return

    socket.emit("start")
  }

  const playRevealCard = (column: number, row: number) => {
    socket.emit("play:reveal-card", {
      column: column,
      row: row,
    })
  }

  const pickCardFromPile = (pile: PlayPickCard["pile"]) => {
    socket.emit("play:pick-card", {
      pile,
    })
  }

  const replaceCard = (column: number, row: number) => {
    socket.emit("play:replace-card", {
      column: column,
      row: row,
    })
  }

  const discardSelectedCard = () => {
    socket.emit("play:discard-selected-card")
  }

  const turnCard = (column: number, row: number) => {
    socket.emit("play:turn-card", {
      column: column,
      row: row,
    })
  }

  const replay = () => {
    socket.emit("replay")
  }

  const leave = () => {
    socket.emit("leave")
  }

  const actions = {
    sendMessage,
    changeSettings,
    resetSettings,
    startGame,
    playRevealCard,
    pickCardFromPile,
    replaceCard,
    discardSelectedCard,
    turnCard,
    replay,
    leave,
  }
  //#endregion

  const providerValue = useMemo(
    () => ({
      game: game as SkyjoToJson,
      player: player as SkyjoPlayerToJson,
      opponents,
      actions,
      chat,
    }),
    [game, chat, opponents, player],
  )

  if (!game || !player) return null

  return (
    <SkyjoContext.Provider value={providerValue}>
      {children}
    </SkyjoContext.Provider>
  )
}

export const useSkyjo = () => useContext(SkyjoContext)
export default SkyjoContextProvider
