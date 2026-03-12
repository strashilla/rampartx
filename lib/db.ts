import { createPool, type Pool, type RowDataPacket } from "mysql2/promise";

const globalForDb = globalThis as unknown as { dbPool: Pool | undefined };

function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Не задан DATABASE_URL. Добавьте в .env.local: DATABASE_URL=mysql://user:password@localhost:3306/rampartx"
    );
  }
  const u = new URL(url);
  return createPool({
    host: u.hostname,
    port: parseInt(u.port || "3306", 10),
    user: u.username,
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, "") || "rampartx",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
  });
}

export const pool = globalForDb.dbPool ?? getPool();
if (process.env.NODE_ENV !== "production") globalForDb.dbPool = pool;

/** Выполнить запрос и вернуть строки (для SELECT). */
export async function query<T extends RowDataPacket>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const [rows] = await pool.execute<T[]>(sql, params);
  return Array.isArray(rows) ? rows : [];
}

/** Выполнить запрос без возврата строк (INSERT/UPDATE/DELETE). */
export async function execute(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<{ affectedRows: number; insertId: number }> {
  const [result] = await pool.execute(sql, params);
  const r = result as { affectedRows?: number; insertId?: number };
  return {
    affectedRows: r.affectedRows ?? 0,
    insertId: r.insertId ?? 0,
  };
}
