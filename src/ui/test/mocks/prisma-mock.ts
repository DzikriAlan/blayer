// Mock Prisma Client for testing

import type { PrismaClient } from '@prisma/client';

/**
 * Creates a mock Prisma Client for testing
 * @returns Mock Prisma client
 */
export const createMockPrismaClient = (): jest.Mocked<PrismaClient> => {
  return {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $executeQuery: jest.fn().mockResolvedValue({}),
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient>;
};

/**
 * Mock database connection helper
 */
export const mockDatabaseConnection = {
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  isConnected: jest.fn().mockReturnValue(true),
};
