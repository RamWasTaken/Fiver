CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "img" TEXT,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "desc" TEXT,
    "isSeller" BOOLEAN NOT NULL DEFAULT false,
    "isSocialLogin" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "Gigs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "coverImage" TEXT,
    "images" TEXT[],
    "category" TEXT NOT NULL,
    "deliveryTime" INTEGER NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "totalStars" INTEGER NOT NULL DEFAULT 0,
    "starNumber" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT[],
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "paymentIntent" TEXT UNIQUE NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("gigId") REFERENCES "Gigs"("id") ON DELETE CASCADE
);

CREATE TABLE "Reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gigId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "star" INTEGER NOT NULL CHECK("star" BETWEEN 1 AND 5),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("gigId") REFERENCES "Gigs"("id") ON DELETE CASCADE,
    FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE,
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE
);
