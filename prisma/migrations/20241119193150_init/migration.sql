-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "sourceCurrency" VARCHAR(3) NOT NULL,
    "destinationCurrency" VARCHAR(3) NOT NULL,
    "buyPrice" DECIMAL(10,5) NOT NULL,
    "sellPrice" DECIMAL(10,5) NOT NULL,
    "capAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);
