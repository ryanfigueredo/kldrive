-- CreateTable
CREATE TABLE "RotaRecord" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kmSaida" DOUBLE PRECISION NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "partida" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "alterouRota" BOOLEAN NOT NULL DEFAULT false,
    "alteracaoRota" TEXT,
    "realizouAbastecimento" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RotaRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RotaRecord" ADD CONSTRAINT "RotaRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RotaRecord" ADD CONSTRAINT "RotaRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
