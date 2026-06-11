import mysql from "mysql2/promise";

// Re-use a single connection pool for the entire Next.js process lifetime.
// Next.js hot-reloading creates new module instances; storing on globalThis
// prevents exhausting MySQL connections during development.
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "travel_app",
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
  });
}

// Lazy getter — pool is only created when first accessed, so module load
// never causes ECONNREFUSED at startup when MySQL isn't running.
export function getDb(): mysql.Pool {
  if (!globalThis._mysqlPool) {
    try {
      globalThis._mysqlPool = createPool()
    } catch (err) {
      console.error("[db] Failed to create MySQL pool:", err)
      throw err
    }
  }
  return globalThis._mysqlPool
}

// Legacy named export kept for backward compatibility with existing callers.
// This is a getter so the pool is still created lazily on first use.
export const db: mysql.Pool = new Proxy({} as mysql.Pool, {
  get(_target, prop) {
    return (getDb() as any)[prop]
  },
})
