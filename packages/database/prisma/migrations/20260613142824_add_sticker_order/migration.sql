-- CreateEnum
CREATE TYPE "StickerOrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "sticker_order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "packName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "StickerOrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryCity" TEXT NOT NULL,
    "deliveryNotes" TEXT,
    "trackingNumber" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "sticker_order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sticker_order_orderNumber_key" ON "sticker_order"("orderNumber");

-- CreateIndex
CREATE INDEX "sticker_order_userId_idx" ON "sticker_order"("userId");

-- CreateIndex
CREATE INDEX "sticker_order_status_idx" ON "sticker_order"("status");

-- AddForeignKey
ALTER TABLE "sticker_order" ADD CONSTRAINT "sticker_order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
