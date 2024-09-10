"use client"

import { LanguageCombobox } from "@/components/LanguageCombobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { ChatNotificationSize, useSettings } from "@/contexts/SettingsContext"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction } from "react"

type SettingsDialogProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const t = useTranslations("components.SettingsDialog")
  const { settings, updateSetting } = useSettings()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{t("general.title")}</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>
                  {t("general.language")} ({t("general.language-warn")})
                </Label>
                <LanguageCombobox />
              </div>
              <div className="flex flex-col gap-2 opacity-50">
                <Label>{t("general.appearance")}</Label>
                <p className="text-sm">{t("general.coming-soon")}</p>
              </div>
            </div>
          </div>

          <div className="flex md:hidden flex-col gap-2">
            <h2 className="text-lg font-semibold">{t("mobile.title")}</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="switch-to-player-who-is-playing">
                  {t("mobile.switch-to-player-who-is-playing")}
                </Label>
                <Switch
                  id="switch-to-player-who-is-playing"
                  checked={settings.switchToPlayerWhoIsPlaying}
                  onCheckedChange={(value) =>
                    updateSetting("switchToPlayerWhoIsPlaying", value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{t("chat.title")}</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="chat-visibility">
                  {t("chat.chat-visibility")}
                </Label>
                <Switch
                  id="chat-visibility"
                  checked={settings.chatVisibility}
                  onCheckedChange={(value) =>
                    updateSetting("chatVisibility", value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("chat.chat-notification-size.label")}</Label>
                <RadioGroup
                  value={settings.chatNotificationSize}
                  onValueChange={(value) =>
                    updateSetting(
                      "chatNotificationSize",
                      value as ChatNotificationSize,
                    )
                  }
                  disabled={!settings.chatVisibility}
                  className="flex gap-4"
                >
                  {Object.values(ChatNotificationSize).map((size) => (
                    <div className="flex items-center space-x-2" key={size}>
                      <RadioGroupItem value={size} id={size} />
                      <Label htmlFor={size}>
                        {t(`chat.chat-notification-size.values.${size}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog