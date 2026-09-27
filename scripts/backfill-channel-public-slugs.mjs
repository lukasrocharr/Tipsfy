import { PrismaClient } from '@prisma/client'
import { generateUniquePublicChannelSlug } from '../src/domain/services/publicChannelSlug.mjs'

const BATCH_SIZE = 20
const prisma = new PrismaClient()

async function backfillChannelPublicSlugs() {
  let totalUpdated = 0
  let batchNumber = 0

  while (true) {
    const candidates = await prisma.channel.findMany({
      where: { OR: [{ publicSlug: null }, { publicSlug: '' }] },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      select: { id: true, name: true },
    })

    if (candidates.length === 0) break

    const assigned = await prisma.$transaction(async (transaction) => {
      const updates = []

      for (const channel of candidates) {
        const publicSlug = await generateUniquePublicChannelSlug(
          channel.name,
          async (slug) =>
            Boolean(
              await transaction.channel.findUnique({
                where: { publicSlug: slug },
                select: { id: true },
              }),
            ),
        )

        await transaction.channel.update({
          where: { id: channel.id },
          data: { publicSlug },
        })
        updates.push({ id: channel.id, publicSlug })
      }

      return updates
    })

    batchNumber += 1
    totalUpdated += assigned.length
    console.log(`Lote ${batchNumber}: ${assigned.length} canal(is) corrigido(s).`)
    for (const update of assigned) {
      console.log(`  ${update.id} -> ${update.publicSlug}`)
    }
  }

  console.log(`Backfill concluído: ${totalUpdated} canal(is) corrigido(s).`)
}

backfillChannelPublicSlugs()
  .catch((error) => {
    console.error('Falha no backfill de slugs públicos.', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })