import { z } from "zod"

const styleSchema = z
  .object({
    backgroundColor: z.string(),
    textColor: z.string(),
    fontFamily: z.string(),
    alignment: z.enum(["left", "center", "right"]),
    padding: z.number().nonnegative(),
  })
  .strict()

const emptyContentSchema = z.object({}).strict()

const pageBlockSchema = z.discriminatedUnion("type", [
  z
    .object({
      id: z.string().uuid(),
      type: z.literal("HERO"),
      content: z
        .object({
          bannerUrl: z.string(),
          avatarUrl: z.string(),
          title: z.string(),
          subtitle: z.string(),
        })
        .strict(),
      style: styleSchema,
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      type: z.literal("BIO"),
      content: z.object({ text: z.string() }).strict(),
      style: styleSchema,
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      type: z.literal("STATS"),
      content: emptyContentSchema,
      style: styleSchema,
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      type: z.literal("PLANS"),
      content: emptyContentSchema,
      style: styleSchema,
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      type: z.literal("SOCIAL_LINKS"),
      content: z
        .object({
          links: z.array(
            z.object({ platform: z.string(), url: z.string() }).strict(),
          ),
        })
        .strict(),
      style: styleSchema,
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      type: z.literal("CUSTOM_TEXT"),
      content: z.object({ title: z.string(), paragraph: z.string() }).strict(),
      style: styleSchema,
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      type: z.literal("IMAGE"),
      content: z
        .object({ url: z.string(), caption: z.string().optional() })
        .strict(),
      style: styleSchema,
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      type: z.literal("DIVIDER"),
      content: emptyContentSchema,
      style: styleSchema,
    })
    .strict(),
])

export const pageDocumentBodySchema = z
  .object({
    templateId: z.string().trim().min(1),
    blocks: z.array(pageBlockSchema),
    globalTheme: z
      .object({
        primaryColorId: z.string().trim().min(1),
        fontPairingId: z.string().trim().min(1),
      })
      .strict(),
  })
  .strict()

export const applyTemplateBodySchema = z
  .object({
    templateId: z.enum([
      "clube-essencial",
      "dia-de-jogo",
      "resultados-abertos",
      "cartao-do-tipster",
    ]),
  })
  .strict()
