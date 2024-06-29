import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Avatar } from "shared/types/player"

const containerVariants = cva("flex flex-col items-center", {
  variants: {
    size: {
      small: " gap-0",
      normal: " gap-2",
    },
  },
  defaultVariants: {
    size: "normal",
  },
})

const imageVariants = cva("select-none", {
  variants: {
    size: {
      small: " size-8 sm:size-10",
      normal: " size-16 sm:size-[6.25rem]",
    },
  },
  defaultVariants: {
    size: "normal",
  },
})

const textVariants = cva(
  "text-slate-900 dark:text-primary text-center text-ellipsis overflow-hidden whitespace-nowrap",
  {
    variants: {
      size: {
        small: "text-sm w-20",
        normal: "text-lg w-[6.25rem]",
      },
    },
    defaultVariants: {
      size: "normal",
    },
  },
)

interface UserAvatarProps extends VariantProps<typeof containerVariants> {
  avatar?: Avatar
  pseudo?: string
}

const UserAvatar = ({ avatar, pseudo, size = "normal" }: UserAvatarProps) => {
  const t = useTranslations("components.Avatar")

  return (
    <div
      className={containerVariants({
        size,
      })}
    >
      {avatar ? (
        <Image
          src={`/avatars/${avatar}.png`}
          width={size === "small" ? 40 : 100}
          height={size === "small" ? 40 : 100}
          alt={t(avatar)}
          title={t(avatar)}
          className={imageVariants({ size })}
          priority
        />
      ) : (
        <div
          className={cn(
            containerVariants({ size }),
            "bg-zinc-200 rounded-full",
          )}
        >
          <p className="text-center text-2xl text-zinc-400">?</p>
        </div>
      )}
      {pseudo && <p className={textVariants({ size })}>{pseudo}</p>}
    </div>
  )
}

export default UserAvatar
