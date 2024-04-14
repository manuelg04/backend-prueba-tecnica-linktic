/*
  Warnings:

  - You are about to drop the `_OrderToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_OrderToProduct" DROP CONSTRAINT "_OrderToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToProduct" DROP CONSTRAINT "_OrderToProduct_B_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "orderId" INTEGER;

-- DropTable
DROP TABLE "_OrderToProduct";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
