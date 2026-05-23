import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const connectionUrl = new URL(databaseUrl);
const isNeonLocalProxy = ['localhost', '127.0.0.1', 'neon-local'].includes(connectionUrl.hostname);

if (isNeonLocalProxy) {
  const port = connectionUrl.port || '5432';
  neonConfig.fetchEndpoint = `http://${connectionUrl.hostname}:${port}/sql`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

export { db, sql };
