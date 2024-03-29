import { locales } from "@/i18n"
import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const url = process.env.SITE_URL || ""
  const pages = ["", "rules"]

  const sitemap = pages.map((page) => {
    return locales.map((locale) => {
      return {
        url: `${url}/${locale}/${page}`,
        lastModified: new Date(),
        priority: 1,
      }
    })
  })

  return sitemap.flat()
}
