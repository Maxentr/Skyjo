import Rules from "@/components/Rules"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpenIcon } from "lucide-react"
import { useTranslations } from "next-intl"

const RulesDialog = () => {
  const t = useTranslations("components.RulesDialog")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="icon" aria-label={t("trigger.aria-label")}>
          <BookOpenIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-2/3 px-0 bg-off-white">
        <DialogHeader className="px-6">
          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 text-slate-900 bg-off-white overflow-y-auto">
          <Rules showTitle={false} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RulesDialog
