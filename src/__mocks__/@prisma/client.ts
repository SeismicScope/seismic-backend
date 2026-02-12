export class PrismaClient {
  $connect = jest.fn();
  $disconnect = jest.fn();
  $queryRaw = jest.fn();
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

class Sql {
  constructor(
    public strings: TemplateStringsArray | string[],
    public values: unknown[],
  ) {}
}

function sql(strings: TemplateStringsArray, ...values: unknown[]): Sql {
  const flatStrings: string[] = [];
  const flatValues: unknown[] = [];

  let strIdx = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] instanceof Sql) {
      const nested = values[i] as Sql;
      flatStrings.push(strings[strIdx] + nested.strings[0]);
      for (let j = 0; j < nested.values.length; j++) {
        flatValues.push(nested.values[j]);
        flatStrings.push(nested.strings[j + 1]);
      }
      strIdx = i + 1;
    } else {
      flatStrings.push(strings[strIdx]);
      flatValues.push(values[i]);
      strIdx = i + 1;
    }
  }
  flatStrings.push(strings[strIdx]);

  return new Sql(flatStrings, flatValues);
}

function raw(value: string): Sql {
  return new Sql([value], []);
}

function join(values: Sql[], separator: string): Sql {
  if (values.length === 0) return new Sql([""], []);

  const strings: string[] = [""];
  const flatValues: unknown[] = [];

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    strings[strings.length - 1] += v.strings[0];
    for (let j = 0; j < v.values.length; j++) {
      flatValues.push(v.values[j]);
      strings.push(v.strings[j + 1]);
    }
    if (i < values.length - 1) {
      strings[strings.length - 1] += separator;
    }
  }

  return new Sql(strings, flatValues);
}

const empty = new Sql([""], []);

export const Prisma = {
  EarthquakeOrderByWithRelationInput: {},
  EarthquakeWhereInput: {},
  sql,
  raw,
  join,
  empty,
  Sql,
};
