import Client from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';

dotenv.config({ path: '.env.local' });

const HOST = process.env.SFTP_HOST || 'lx42.hoststar.hosting';
const PORT = parseInt(process.env.SFTP_PORT || '5544', 10);
const USER = process.env.SFTP_USER;
const PASS = process.env.SFTP_PASS;
const REMOTE_PUBLIC  = process.env.SFTP_REMOTE         || '/httpdocs';
const REMOTE_PRIVATE = process.env.SFTP_REMOTE_PRIVATE || '';

if (!USER || !PASS) {
  console.error('missing SFTP_USER / SFTP_PASS in .env.local');
  process.exit(1);
}

async function main() {
  const sftp = new Client();
  await sftp.connect({ host: HOST, port: PORT, username: USER, password: PASS });

  // 1. Public static (fonts, media, images, assets, api/)
  const localStatic = path.resolve('dist/static');
  try { await fs.access(localStatic); }
  catch { console.error('run pnpm build first'); await sftp.end(); process.exit(1); }

  console.log(`[deploy] uploading ${localStatic} → ${REMOTE_PUBLIC}`);
  await sftp.uploadDir(localStatic, REMOTE_PUBLIC);
  console.log('[deploy] public done');

  // 2. Private (migrations, sample config) — only if SFTP_REMOTE_PRIVATE is set
  if (REMOTE_PRIVATE) {
    const localPrivate = path.resolve('private');
    try { await fs.access(localPrivate); }
    catch {
      console.log('[deploy] no local private/ — skip');
      await sftp.end();
      return;
    }

    console.log(`[deploy] uploading private (skip config.php + *.db) → ${REMOTE_PRIVATE}`);

    // Only upload migrations + sample. NEVER upload real config.php or .db files.
    await uploadDirFiltered(sftp, localPrivate, REMOTE_PRIVATE, (rel) => {
      if (rel === 'config.php') return false;      // per-env, lives only on server
      if (rel.endsWith('.db'))   return false;     // SQLite data, must not be overwritten
      if (rel.endsWith('.db-wal') || rel.endsWith('.db-shm')) return false;
      return true;
    });
    console.log('[deploy] private done');
  } else {
    console.log('[deploy] SFTP_REMOTE_PRIVATE not set — skipping private/ upload');
  }

  await sftp.end();
}

async function uploadDirFiltered(sftp, localDir, remoteDir, accept, relPrefix = '') {
  await ensureRemoteDir(sftp, remoteDir);
  for (const entry of await fs.readdir(localDir, { withFileTypes: true })) {
    const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
    const localPath = path.join(localDir, entry.name);
    const remotePath = `${remoteDir}/${entry.name}`;
    if (entry.isDirectory()) {
      await uploadDirFiltered(sftp, localPath, remotePath, accept, rel);
    } else {
      if (!accept(rel)) { console.log(`[deploy]   skip ${rel}`); continue; }
      await sftp.put(localPath, remotePath);
      console.log(`[deploy]   ${rel}`);
    }
  }
}

async function ensureRemoteDir(sftp, dir) {
  try { await sftp.mkdir(dir, true); } catch { /* ignore if exists */ }
}

main().catch((e) => { console.error(e); process.exit(1); });
