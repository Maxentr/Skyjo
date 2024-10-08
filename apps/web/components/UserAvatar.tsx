import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Avatar } from "shared/constants"

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

// Ajouter une sdh pour le mobile pour que la taille soit plus adaptée
const imageVariants = cva("select-none", {
  variants: {
    size: {
      small: " size-8 sm:size-10",
      normal: " size-12 sdh:sm:size-16 mdh:md:size-[6.25rem]",
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
        <span
          className={cn(
            imageVariants({ size }),
            "bg-zinc-200 rounded-3xl animate-pulse scale-50",
          )}
        />
      )}
      {pseudo && <p className={textVariants({ size })}>{pseudo}</p>}
    </div>
  )
}

export default UserAvatar
