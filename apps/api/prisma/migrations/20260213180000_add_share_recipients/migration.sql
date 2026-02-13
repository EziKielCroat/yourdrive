-- CreateTable
CREATE TABLE "share_recipients" (
    "id" TEXT NOT NULL,
    "share_id" TEXT NOT NULL,
    "recipient_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "share_recipients_share_id_recipient_user_id_key" ON "share_recipients"("share_id", "recipient_user_id");

-- CreateIndex
CREATE INDEX "share_recipients_recipient_user_id_idx" ON "share_recipients"("recipient_user_id");

-- AddForeignKey
ALTER TABLE "share_recipients" ADD CONSTRAINT "share_recipients_share_id_fkey" FOREIGN KEY ("share_id") REFERENCES "file_shares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_recipients" ADD CONSTRAINT "share_recipients_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
