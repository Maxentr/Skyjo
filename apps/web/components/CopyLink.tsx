"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getGameInviteLink } from "@/lib/utils"
import { CheckIcon, ClipboardCopyIcon } from "lucide-react"
import { MouseEvent, useState } from "react"

type CopyLinkProps = {
  gameCode: string
}

const CopyLink = ({ gameCode }: CopyLinkProps) => {
  const [copied, setCopied] = useState(false)
  const [interval, setInterval] = useState<NodeJS.Timeout>()
  const inviteLink = getGameInviteLink(gameCode)

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)

    if (copied) clearInterval(interval)
    setInterval(setTimeout(() => setCopied(false), 2000))
  }

  const onCopyFromInput = (e: MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select()
    copyLink()
  }

  return (
    <div className="flex flex-row items-center gap-2 w-full sm:w-fit">
      <Input
        type="text"
        value={inviteLink}
        onClick={onCopyFromInput}
        readOnly
        className="sm:w-[300px] select-text"
      />
      <Button variant="icon" onClick={copyLink}>
        {copied ? <CheckIcon /> : <ClipboardCopyIcon />}
      </Button>
    </div>
  )
}

export default CopyLink
