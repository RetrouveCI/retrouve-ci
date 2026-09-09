-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('NATIONAL_ID', 'DRIVER_LICENCE', 'BANK_CARD', 'INSURANCE_CARD', 'PASSPORT', 'STUDENT_CARD', 'OTHER');

-- AlterTable
ALTER TABLE "lost_item" ADD COLUMN     "documentHolderName" TEXT,
ADD COLUMN     "documentIssuer" TEXT,
ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "documentType" "DocumentType";

