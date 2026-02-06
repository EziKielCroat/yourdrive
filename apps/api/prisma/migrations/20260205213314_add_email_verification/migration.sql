-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_verification_expires" TIMESTAMP(3),
ADD COLUMN     "email_verification_token" TEXT;

-- CreateIndex
CREATE INDEX "User_email_verification_token_idx" ON "User"("email_verification_token");
