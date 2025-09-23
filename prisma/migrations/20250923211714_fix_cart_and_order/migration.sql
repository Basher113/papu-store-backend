/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `OrderItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,cartId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,orderId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Cart" DROP COLUMN "totalAmount";

-- AlterTable
ALTER TABLE "public"."CartItem" DROP COLUMN "totalAmount";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "totalAmount";

-- AlterTable
ALTER TABLE "public"."OrderItem" DROP COLUMN "totalAmount";

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_productId_cartId_key" ON "public"."CartItem"("productId", "cartId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_productId_orderId_key" ON "public"."OrderItem"("productId", "orderId");
