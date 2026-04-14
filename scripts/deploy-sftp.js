import Client from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';

dotenv.config({ path: '.env.local' });

const HOST = process.env.SFTP_HOST || 'lx42.hoststar.hosting';
const PORT = parseInt(process.env.SFTP_PORT || '5544', 10);
const USER = process.env.SFTP_USER;
const PASS = process.env.SFTP_PASS;
const REMOTE_ROOT = process.env.SFTP_REMOTE || '/httpdocs';

if (!USER || !PASS) { console.error('missing SFTP_USER / SFTP_PASS in .env.local'); process.exit(1); }

async function main() {
  const sftp = new Client();
  await sftp.connect({ host: HOST, port: PORT, username: USER, password: PASS });

  const local = path.resolve('dist/static');
  try { await fs.access(local); } catch { console.error('run pnpm build first'); process.exit(1); }

  console.log(`[deploy] uploading ${local} → ${REMOTE_ROOT}`);
  await sftp.uploadDir(local, REMOTE_ROOT);
  console.log('[deploy] done');

  await sftp.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
