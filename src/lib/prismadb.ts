// File: lib/prismadb.ts
// Purpose: This file is used to create a new instance of the PrismaClient and attach it to the `global` object in development mode. This is done to prevent circular dependencies when hot reloading. The PrismaClient instance is then exported to be used in the rest of the application.

import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent circular dependencies when hot reloading.
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development mode from being created and attached to `global` object. This prevents circular dependencies when hot reloading.
const prismadb = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prismadb;

export default prismadb;