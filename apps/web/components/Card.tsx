"use client"

import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { ClassValue } from "clsx"
import { m, useAnimate, useAnimationControls } from "framer-motion"
import { Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { SkyjoCardToJson } from "shared/types/skyjoCard"

const cardClass = cva(
  "text-black border-2 border-black flex justify-center items-center select-none focus-visible:outline-black focus-visible:-outline-offset-2",
  {
    variants: {
      size: {
        tiny: " h-12 w-8 border-[1.5px] rounded shadow-[0.75px_0.75px_0px_0px_rgba(0,0,0)] text-base",
        normal:
          " h-12 w-8 mdh:md:h-16 mdh:md:w-12 rounded mdh:md:rounded-md shadow-[0.75px_0.75px_0px_0px_rgba(0,0,0)] mdh:md:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0)] text-base mdh:md:text-2xl ",
      },
      value: {
        discard: "bg-transparent border-dashed border-red-600 !shadow-none",
        "no-card": "bg-transparent border-dashed !shadow-none",
        "not-visible": " bg-container text-container",
        negative: " bg-card-negative",
        neutral: " bg-card-neutral",
        low: " bg-card-low",
        medium: "bg-card-medium",
        high: " bg-card-high",
      },
      disabled: {
        true: "",
        false: "",
      },
    },
  },
)

const throwIconClass = cva("text-red-600", {
  variants: {
    size: {
      tiny: "w-4 aspect-square",
      small: " w-5 aspect-square",
      normal: " w-5 md:w-6 aspect-square",
      big: " w-8 aspect-square",
    },
  },
})

type CardValue =
  | "no-card"
  | "discard"
  | "not-visible"
  | "negative"
  | "neutral"
  | "low"
  | "medium"
  | "high"

const cardValue: Record<string, CardValue> = {
  "-99": "no-card",
  "-98": "discard",
  "not-visible": "not-visible",
  "-2": "negative",
  "-1": "negative",
  "0": "neutral",
  "1": "low",
  "2": "low",
  "3": "low",
  "4": "low",
  "5": "medium",
  "6": "medium",
  "7": "medium",
  "8": "medium",
  "9": "high",
  "10": "high",
  "11": "high",
  "12": "high",
}

type CardProps = {
  card: SkyjoCardToJson
  size?: VariantProps<typeof cardClass>["size"]
  onClick?: () => void
  className?: ClassValue
  title?: string
  disabled?: boolean
  flipAnimation?: boolean
  exitAnimation?: boolean
}
const Card = ({
  card,
  size = "normal",
  onClick,
  className,
  title,
  disabled = false,
  flipAnimation = true,
  exitAnimation = false,
}: CardProps) => {
  const { game } = useSkyjo()
  const [scope, animate] = useAnimate()
  const controls = useAnimationControls()

  const [isInAnimation, setIsInAnimation] = useState<boolean>(false)

  useEffect(() => {
    const animation = async () => {
      setIsInAnimation(true)
      controls.set({ rotateY: -180 })
      const animation = animate(
        scope.current,
        {
          rotateY: 0,
          transformStyle: "preserve-3d",
        },
        {
          duration: 0.4,
        },
      )

      setTimeout(() => {
        setIsInAnimation(false)
      }, 220)

      Promise.all([animation])

      controls.set({ rotateY: 0 })
    }

    if (flipAnimation && card.isVisible && game?.lastMove === "turn")
      animation()
  }, [flipAnimation, card.isVisible])

  let cardContent: string | JSX.Element = ""

  if (card.value === -98) {
    cardContent = <Trash2Icon className={throwIconClass({ size })} />
  } else if (card.isVisible && card.value !== undefined) {
    cardContent = card.value.toString()
  }

  return (
    <m.button
      ref={scope}
      animate={controls}
      exit={
        exitAnimation
          ? {
              opacity: 0,
              scale: 0,
              transition: {
                duration: 2,
                ease: "easeInOut",
              },
            }
          : undefined
      }
      className={cn(
        cardClass({
          size,
          value: isInAnimation
            ? "not-visible"
            : cardValue[card.value ?? "not-visible"],
          disabled,
        }),
        className,
      )}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {cardContent}
    </m.button>
  )
}

export { Card }
