"use client"

import Chat from "@/components/Chat"
import CopyLink from "@/components/CopyLink"
import UserAvatar from "@/components/UserAvatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogOverlay } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RadioNumber from "@/components/ui/radio-number"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { LockIcon, UnlockIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { useLocalStorage } from "react-use"
import { SKYJO_DEFAULT_SETTINGS } from "shared/constants"
import { ChangeSettings } from "shared/validations/changeSettings"

type ChangeSettingsKey = keyof ChangeSettings
type ChangeSettingsValue = ChangeSettings[ChangeSettingsKey]

const Lobby = () => {
  const t = useTranslations("components.Lobby")
  const {
    player,
    game: { players, status, settings, admin },
    actions,
  } = useSkyjo()
  const [value, setValue] = useLocalStorage<ChangeSettings>("settings")

  useEffect(() => {
    if (value) {
      actions.changeSettings(value)
    }
  }, [])

  const open = status === "lobby"
  const isAdmin = player.socketId == admin.socketId
  const hasMinPlayers = players.length < 2

  const changeSettings = (
    key: ChangeSettingsKey,
    value: ChangeSettingsValue,
  ) => {
    actions.changeSettings({ ...settings, [key]: value })
  }

  const beforeStartGame = () => {
    setValue(settings)

    actions.startGame()
  }

  const nbCards = settings.cardPerColumn * settings.cardPerRow
  const maxInitialTurnedCount = nbCards === 1 ? 1 : nbCards - 1

  return (
    <Dialog open={open}>
      <DialogOverlay>
        <div className="fixed inset-0 z-20 flex mdh:md:items-center justify-center overflow-auto">
          <div className="flex flex-col gap-4 md:gap-8 items-center h-fit w-full md:max-w-4xl p-4">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="bg-container border-2 border-black rounded-2xl w-full px-8 md:px-12 py-8 relative">
                <span className="absolute top-4 right-4">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger className="relative">
                        {settings.private ? (
                          <LockIcon
                            className={cn(
                              "h-6 w-6 text-slate-700",
                              !isAdmin && "cursor-default",
                            )}
                            onClick={() => changeSettings("private", false)}
                          />
                        ) : (
                          <UnlockIcon
                            className={cn(
                              "h-6 w-6 text-slate-500",
                              !isAdmin && "cursor-default",
                            )}
                            onClick={() => changeSettings("private", true)}
                          />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {settings.private
                          ? t("settings.private.tooltip.on")
                          : t("settings.private.tooltip.off")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <h2 className="text-slate-900 text-center text-2xl mb-2 md:mb-5">
                  {t("settings.title")}
                </h2>

                <div className="flex flex-col gap-4 md:gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <Switch
                      id="skyjo-for-column"
                      checked={settings.allowSkyjoForColumn}
                      onCheckedChange={(checked) =>
                        changeSettings("allowSkyjoForColumn", checked)
                      }
                      disabled={!isAdmin}
                      title={t("settings.allow-skyjo-for-column")}
                    />
                    <Label htmlFor="skyjo-for-column">
                      {t("settings.allow-skyjo-for-column")}
                    </Label>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <Switch
                      id="skyjo-for-row"
                      checked={settings.allowSkyjoForRow}
                      onCheckedChange={(checked) =>
                        changeSettings("allowSkyjoForRow", checked)
                      }
                      disabled={!isAdmin}
                      title={t("settings.allow-skyjo-for-row")}
                    />
                    <Label htmlFor="skyjo-for-row">
                      {t("settings.allow-skyjo-for-row")}
                    </Label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="nb-columns">
                      {t("settings.nb-columns.label")}
                    </Label>
                    <RadioNumber
                      name="nb-columns"
                      max={SKYJO_DEFAULT_SETTINGS.CARDS.PER_COLUMN}
                      selected={settings.cardPerColumn}
                      onChange={(value) =>
                        changeSettings("cardPerColumn", value)
                      }
                      title={t("settings.nb-columns.title")}
                      disabled={!isAdmin}
                      disabledRadioNumber={settings.cardPerRow === 1 ? [1] : []}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="nb-rows">
                      {t("settings.nb-rows.label")}
                    </Label>
                    <RadioNumber
                      name="nb-rows"
                      max={SKYJO_DEFAULT_SETTINGS.CARDS.PER_ROW}
                      selected={settings.cardPerRow}
                      onChange={(value) => changeSettings("cardPerRow", value)}
                      title={t("settings.nb-rows.title")}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="initial-turned-count">
                      {t("settings.initial-turned-count.label")}
                    </Label>
                    <div className="flex flex-row gap-2 items-center">
                      <Slider
                        name={"initial-turned-count"}
                        step={1}
                        min={1}
                        max={maxInitialTurnedCount}
                        defaultValue={[settings.initialTurnedCount]}
                        onValueCommit={(value) =>
                          changeSettings("initialTurnedCount", +value)
                        }
                        title={t("settings.initial-turned-count.title", {
                          number: settings.initialTurnedCount,
                        })}
                        disabled={!isAdmin}
                      />
                      <Input
                        name={"initial-turned-count"}
                        type="number"
                        max={maxInitialTurnedCount}
                        value={settings.initialTurnedCount}
                        onChange={(e) =>
                          changeSettings("initialTurnedCount", +e.target.value)
                        }
                        title={t("settings.initial-turned-count.title", {
                          number: settings.initialTurnedCount,
                        })}
                        disabled={!isAdmin}
                        className="w-16 text-center"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="multiplier-for-first-player">
                      {t("settings.multiplier-for-first-player.label")}
                    </Label>
                    <div className="flex flex-row gap-2 items-center">
                      <Slider
                        name={"multiplier-for-first-player"}
                        step={1}
                        min={1}
                        max={10}
                        defaultValue={[settings.multiplierForFirstPlayer]}
                        onValueCommit={(value) =>
                          changeSettings("multiplierForFirstPlayer", +value)
                        }
                        title={t("settings.multiplier-for-first-player.title", {
                          number: settings.multiplierForFirstPlayer,
                        })}
                        disabled={!isAdmin}
                      />
                      <Input
                        name={"multiplier-for-first-player"}
                        type="number"
                        max={10}
                        value={settings.multiplierForFirstPlayer}
                        onChange={(e) =>
                          changeSettings(
                            "multiplierForFirstPlayer",
                            +e.target.value,
                          )
                        }
                        title={t("settings.multiplier-for-first-player.title", {
                          number: settings.multiplierForFirstPlayer,
                        })}
                        disabled={!isAdmin}
                        className="w-16 text-center"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="score-to-end-game">
                      {t("settings.score-to-end-game.label")}
                    </Label>
                    <div className="flex flex-row gap-2 items-center">
                      <Slider
                        name={"score-to-end-game"}
                        step={10}
                        max={1000}
                        defaultValue={[settings.scoreToEndGame]}
                        onValueCommit={(value) =>
                          changeSettings("scoreToEndGame", +value)
                        }
                        title={t("settings.score-to-end-game.title", {
                          number: settings.scoreToEndGame,
                        })}
                        disabled={!isAdmin}
                      />
                      <Input
                        name={"score-to-end-game"}
                        type="number"
                        max={1000}
                        value={settings.scoreToEndGame}
                        onChange={(e) =>
                          changeSettings("scoreToEndGame", +e.target.value)
                        }
                        title={t("settings.score-to-end-game.title", {
                          number: settings.scoreToEndGame,
                        })}
                        disabled={!isAdmin}
                        className="w-20 text-center"
                      />
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex flex-row justify-center items-center gap-8 mt-6 md:mt-8">
                    <button onClick={actions.resetSettings}>
                      <p className="underline">
                        {t("settings.reset-settings")}
                      </p>
                    </button>
                    <Button onClick={beforeStartGame} disabled={hasMinPlayers}>
                      {t("start-game-button")}
                    </Button>
                  </div>
                )}
              </div>
              <div className="block bg-container border-2 border-black rounded-2xl w-full md:w-80 p-4 md:p-8">
                <h3 className="text-slate-900 text-center text-xl mb-2 md:mb-5">
                  {t("player-section.title")}
                </h3>
                <div className="flex flex-row flex-wrap justify-center gap-2">
                  {players.map((player) => (
                    <UserAvatar
                      key={player.socketId}
                      avatar={player.avatar}
                      pseudo={player.name}
                      size="small"
                    />
                  ))}
                </div>
              </div>
            </div>
            <CopyLink />
          </div>
        </div>
        <Chat className="z-[60]" />
      </DialogOverlay>
    </Dialog>
  )
}

export default Lobby
