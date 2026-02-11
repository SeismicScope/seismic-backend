export class PrismaClient {
  $connect = jest.fn();
  $disconnect = jest.fn();
  $queryRawUnsafe = jest.fn();
  $executeRawUnsafe = jest.fn();
  $transaction = jest.fn();
  earthquake = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    createMany: jest.fn(),
  };
  importJob = {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  };
}

export const Prisma = {
  EarthquakeOrderByWithRelationInput: {},
  EarthquakeWhereInput: {},
};
