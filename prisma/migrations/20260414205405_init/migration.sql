-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW', 'EDIT', 'OWNER');

-- CreateTable
CREATE TABLE "User" (
    "userId" UUID NOT NULL,
    "googleId" TEXT,
    "username" VARCHAR(30) NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "tokenVersion" INTEGER NOT NULL DEFAULT 1,
    "resetPasswordToken" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Image" (
    "imageId" UUID NOT NULL,
    "filename" TEXT,
    "userId" UUID,
    "documentId" UUID,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("imageId")
);

-- CreateTable
CREATE TABLE "Document" (
    "documentId" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "documentContent" BYTEA,
    "documentPreview" TEXT,
    "documentOwnerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("documentId")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "linkId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "permission" "Permission" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("linkId")
);

-- CreateTable
CREATE TABLE "UsersDocuments" (
    "userId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "permission" "Permission" NOT NULL DEFAULT 'VIEW',

    CONSTRAINT "UsersDocuments_pkey" PRIMARY KEY ("userId","documentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Image_userId_key" ON "Image"("userId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("documentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_documentOwnerId_fkey" FOREIGN KEY ("documentOwnerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("documentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersDocuments" ADD CONSTRAINT "UsersDocuments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersDocuments" ADD CONSTRAINT "UsersDocuments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("documentId") ON DELETE RESTRICT ON UPDATE CASCADE;
