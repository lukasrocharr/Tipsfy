import { describe, expect, it } from "vitest"
import { PageDocument } from "../../src/domain/entities/PageDocument"
import { PAGE_BUILDER_TEMPLATES } from "../../src/infrastructure/page-builder/templates"

describe("templates do Page Builder", () => {
  it.each(Object.entries(PAGE_BUILDER_TEMPLATES))(
    "valida o template %s no domínio",
    (_templateId, template) => {
      const pageDocument = new PageDocument({
        channelId: "template-validation",
        ...template,
      })

      expect(pageDocument).toBeInstanceOf(PageDocument)
    },
  )
})
