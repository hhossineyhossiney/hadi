import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

type DrizzleDb = ReturnType<typeof drizzle>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDrizzleDb?: DrizzleDb;
};

// Create a chainable dummy query builder for build-time safety when DATABASE_URL is missing
function createMockDb(): DrizzleDb {
  const createChainable = (): any => {
    const target = function () {};
    return new Proxy(target, {
      get(_t, prop) {
        if (prop === "then") {
          return (resolve: (val: any) => void) => resolve([]);
        }
        if (prop === "catch") {
          return (_reject: any) => Promise.resolve([]);
        }
        if (prop === "finally") {
          return (cb: () => void) => {
            cb();
            return Promise.resolve([]);
          };
        }
        return createChainable();
      },
      apply() {
        return createChainable();
      },
    });
  };

  return createChainable() as DrizzleDb;
}

function createRealDb(databaseUrl: string): DrizzleDb {
  if (globalForDb.__arenaNextJsDrizzleDb) {
    return globalForDb.__arenaNextJsDrizzleDb;
  }

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({ connectionString: databaseUrl });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  const instance = drizzle(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsDrizzleDb = instance;
  }

  return instance;
}

let cachedDb: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // Return mock DB during build/prerender if DATABASE_URL is not provided
    return createMockDb();
  }

  if (!cachedDb) {
    cachedDb = createRealDb(databaseUrl);
  }

  return cachedDb;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
  has(_target, prop) {
    return Reflect.has(getDb() as object, prop);
  },
});
