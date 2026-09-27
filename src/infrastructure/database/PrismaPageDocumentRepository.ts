import { Prisma } from "@prisma/client"
import type { PageBlock } from "../../domain/entities/PageBlock"
import {
  PageDocument,
  type GlobalTheme,
} from "../../domain/entities/PageDocument"
import type { PageDocumentRepository } from "../../application/ports/PageDocumentRepository"
import { prisma } from "./prisma"

export class PrismaPageDocumentRepository implements PageDocumentRepository {
  async obterPorCanal(channelId: string): Promise<PageDocument | null> {
    const record = await prisma.pageDocument.findUnique({
      where: { channelId },
    })
    return record ? this.toDomain(record) : null
  }

  async salvar(pageDocument: PageDocument): Promise<void> {
    const data = this.toPersistence(pageDocument)
    await prisma.pageDocument.upsert({
      where: { channelId: pageDocument.channelId },
      create: data,
      update: {
        templateId: data.templateId,
        blocks: data.blocks,
        globalTheme: data.globalTheme,
        updatedAt: data.updatedAt,
      },
    })
  }

  private toPersistence(pageDocument: PageDocument) {
    return {
      channelId: pageDocument.channelId,
      templateId: pageDocument.templateId,
      blocks: pageDocument.blocks as unknown as Prisma.InputJsonValue,
      globalTheme: pageDocument.globalTheme as unknown as Prisma.InputJsonValue,
      updatedAt: pageDocument.updatedAt,
    }
  }

  private toDomain(record: {
    channelId: string
    templateId: string
    blocks: Prisma.JsonValue
    globalTheme: Prisma.JsonValue
    updatedAt: Date
  }): PageDocument {
    return new PageDocument({
      channelId: record.channelId,
      templateId: record.templateId,
      blocks: record.blocks as unknown as PageBlock[],
      globalTheme: record.globalTheme as unknown as GlobalTheme,
      updatedAt: record.updatedAt,
    })
  }
}
