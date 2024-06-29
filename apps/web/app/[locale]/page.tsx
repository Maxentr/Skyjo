import IndexPage from "@/app/[locale]/IndexPage"
import FeedbackButton from "@/components/FeedbackButton"
import Footer from "@/components/Footer"
import LanguageSettings from "@/components/LanguageSettings"
import MovingArrow from "@/components/MovingArrow"
import RulesDialog from "@/components/RulesDialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Link } from "@/navigation"
import { useTranslations } from "next-intl"
import Image from "next/image"

type IndexServerPageProps = {
  searchParams: {
    gameId?: string
  }
  params: {
    locale: string
  }
}
const IndexServerPage = ({ searchParams, params }: IndexServerPageProps) => {
  const t = useTranslations("pages.Index")

  return (
    <>
      <div className="bg-body flex flex-col">
        <div className="h-dvh !p-6 bg-body flex flex-col gap-4 md:gap-0">
          <div className="w-full grid grid-cols-3 grid-flow-row min-h-1/6 h-fit">
            <div></div>
            <div></div>
            <div className="flex flex-row justify-end">
              <div className="w-10 flex flex-col gap-4 z-10">
                <LanguageSettings locale={params.locale} />
                <RulesDialog />
                <FeedbackButton className="md:mt-4" />
              </div>
            </div>
          </div>
          <div className="w-full grid grid-cols-1 grid-flow-row h-4/6">
            <div className="h-full flex items-center justify-center">
              <div className="bg-container border-2 border-black px-16 py-12 rounded-xl md:w-3/6 max-w-2xl flex flex-col items-center">
                <h1 className="mb-5">
                  <Image
                    src="/svg/logo.svg"
                    width={0}
                    height={0}
                    style={{ width: "auto", height: "2.5rem" }}
                    className="select-none"
                    priority
                    loading="eager"
                    title="Skyjo"
                    alt="Skyjo"
                  />
                </h1>
                <IndexPage gameId={searchParams.gameId} />
              </div>
            </div>
          </div>
          <div className="w-full flex flex-row items-end justify-center h-1/6">
            <MovingArrow href="#explanation" />
          </div>
        </div>
        <section className="container bg-body my-8 max-w-4xl flex flex-col items-center">
          <h2
            id="explanation"
            className="text-center text-3xl text-slate-800 mb-4"
          >
            {t("explanation.title")}
          </h2>
          <p className="text-justify text-slate-800">
            {t("explanation.content")}
          </p>
          <Link href="/rules" className="mt-8">
            <Button>{t("explanation.button")}</Button>
          </Link>
        </section>

        <section className="container bg-body mt-16 mb-32 max-w-4xl flex flex-col items-center">
          <h2 className="text-center text-3xl text-slate-800 mb-4">
            {t("faq.title")}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t("faq.meaning.title")}</AccordionTrigger>
              <AccordionContent>{t("faq.meaning.content")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>{t("faq.pronounce.title")}</AccordionTrigger>
              <AccordionContent>{t("faq.pronounce.content")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>{t("faq.how-to-play.title")}</AccordionTrigger>
              <AccordionContent>
                {t.rich("faq.how-to-play.content", {
                  rules: (chunks) => (
                    <Link href="/rules" className="underline">
                      {chunks}
                    </Link>
                  ),
                })}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>{t("faq.how-to-win.title")}</AccordionTrigger>
              <AccordionContent>{t("faq.how-to-win.content")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                {t("faq.play-classic-with-action.title")}
              </AccordionTrigger>
              <AccordionContent>
                {t("faq.play-classic-with-action.content")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
      <Footer />
    </>
  )
}

export default IndexServerPage
