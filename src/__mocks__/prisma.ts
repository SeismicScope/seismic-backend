export const PrismaService = jest.fn().mockImplementation(() => ({
  earthquake: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    createMany: jest.fn(),
  },
  importJob: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $transaction: jest.fn(),
  $connect: jest.fn(),
}));
