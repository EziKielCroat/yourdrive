/**
 * Load .env BEFORE any other module — import this as the first line of index.ts.
 * With tsx/esbuild CJS compilation, imports execute in declaration order,
 * so this module's side effect (dotenv.config) runs before prisma is required.
 */
import { config } from "dotenv";
config();
