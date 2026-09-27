CREATE TABLE "page_documents" (
    "channelId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "globalTheme" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_documents_pkey" PRIMARY KEY ("channelId")
);

ALTER TABLE "page_documents"
ADD CONSTRAINT "page_documents_channelId_fkey"
FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;