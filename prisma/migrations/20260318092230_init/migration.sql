-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW', 'EDIT');

-- CreateTable
CREATE TABLE "User" (
    "userId" UUID NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "tokenVersion" INTEGER NOT NULL DEFAULT 1,
    "resetPasswordToken" TEXT,
    "avatarUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "DocumentImage" (
    "imageId" UUID NOT NULL,
    "filename" TEXT,
    "documentId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentImage_pkey" PRIMARY KEY ("imageId")
);

-- CreateTable
CREATE TABLE "Document" (
    "documentId" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "documentContent" JSONB NOT NULL,
    "documentOwnerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("documentId")
);

-- CreateTable
CREATE TABLE "UsersDocuments" (
    "userId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "permission" "Permission" NOT NULL DEFAULT 'VIEW',

    CONSTRAINT "UsersDocuments_pkey" PRIMARY KEY ("userId","documentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Document_documentOwnerId_key" ON "Document"("documentOwnerId");

-- AddForeignKey
ALTER TABLE "DocumentImage" ADD CONSTRAINT "DocumentImage_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("documentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_documentOwnerId_fkey" FOREIGN KEY ("documentOwnerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersDocuments" ADD CONSTRAINT "UsersDocuments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersDocuments" ADD CONSTRAINT "UsersDocuments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("documentId") ON DELETE RESTRICT ON UPDATE CASCADE;
