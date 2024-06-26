import ScoreTable from "@/components/ScoreTable"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { getConnectedPlayers, getWinner } from "@/lib/skyjo"
import { CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { useTranslations } from "next-intl"

const EndGameDialog = () => {
  const { player, game, actions } = useSkyjo()
  const t = useTranslations("components.EndGameDialog")

  const isGameFinished =
    game.roundState === "over" && game.status === "finished"

  if (!isGameFinished) return null

  const winner = getWinner(game)

  return (
    <Dialog open={isGameFinished}>
      <DialogContent allowClose={false}>
        <DialogHeader>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
          <DialogDescription className="mt-2 text-center">
            {t("description", {
              name: winner.name,
              score: winner.score,
            })}
          </DialogDescription>
        </DialogHeader>
        <ScoreTable players={game.players} winner={winner} />
        {game.status !== "stopped" && (
          <div className="mt-2 flex flex-col items-center gap-4">
            <div className="flex flex-row gap-1">
              {getConnectedPlayers(game.players).map((player) =>
                player.wantReplay ? (
                  <CheckCircle2Icon
                    key={player.socketId}
                    size={24}
                    className="text-emerald-600"
                  />
                ) : (
                  <XCircleIcon key={player.socketId} size={24} />
                ),
              )}
            </div>
            <Button onClick={actions.replay} className="w-full">
              {player.wantReplay
                ? t("replay-button.cancel")
                : t("replay-button.replay")}
            </Button>

            <Button onClick={actions.leave} className="w-full">
              {t("leave-button")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EndGameDialog
