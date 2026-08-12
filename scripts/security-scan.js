import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST = join(ROOT, '.security', 'config-manifest.json');

const SUSPICIOUS_PATTERNS = [
  { name: 'unicode-obfuscation', regex: /\\u00[0-9a-f]{2}.*\\u00[0-9a-f]{2}.*\\u00[0-9a-f]{2}/i },
  { name: 'dynamic-eval', regex: /\beval\s*\(/ },
  { name: 'detached-spawn', regex: /spawn\s*\([^)]*detached\s*:\s*true/ },
  { name: 'eth-wallet-marker', regex: /global\.i\s*=/ },
  { name: 'remote-payload-path', regex: /0x\/(cls|ls)/ },
  { name: 'blockscout-api', regex: /blockscout/i },
  { name: 'hidden-require-setup', regex: /createRequire\s*\(\s*import\.meta\.url\s*\)/ },
];

const SCANNED_GLOBS = [
  'eslint.config.mjs',
  '.husky/*',
  'scripts/*.js',
  'package.json',
  '.github/workflows/*.yml',
];

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST, 'utf8'));
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: ROOT,
      encoding: 'utf8',
    });
    return output.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function scanContent(relativePath, content) {
  const violations = [];

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.regex.test(content)) {
      violations.push(`${relativePath}: suspicious pattern "${pattern.name}"`);
    }
  }

  if (relativePath === 'eslint.config.mjs') {
    const closing = content.lastIndexOf('];');
    if (closing !== -1) {
      const trailing = content.slice(closing + 2).trim();
      if (trailing.length > 0) {
        violations.push(
          `${relativePath}: unexpected content after ESLint config closing bracket`,
        );
      }
    }
  }

  return violations;
}

function verifyProtectedFile(entry) {
  const absolutePath = join(ROOT, entry.path);
  const violations = [];

  if (!existsSync(absolutePath)) {
    violations.push(`${entry.path}: protected file is missing`);
    return violations;
  }

  const content = readFileSync(absolutePath, 'utf8');
  const bytes = Buffer.byteLength(content, 'utf8');

  if (entry.maxBytes && bytes > entry.maxBytes) {
    violations.push(
      `${entry.path}: file size ${bytes}B exceeds limit ${entry.maxBytes}B`,
    );
  }

  if (entry.sha256) {
    const digest = sha256(content);
    if (digest !== entry.sha256) {
      violations.push(
        `${entry.path}: SHA-256 mismatch (expected ${entry.sha256}, got ${digest})`,
      );
    }
  }

  violations.push(...scanContent(entry.path, content));
  return violations;
}

function listFilesToScan(scanAll) {
  if (scanAll) {
    const files = [];
    for (const pattern of SCANNED_GLOBS) {
      if (pattern.includes('*')) {
        const dir = dirname(pattern);
        const prefix = pattern.replace('*', '');
        const absoluteDir = join(ROOT, dir === '.' ? '' : dir);
        if (!existsSync(absoluteDir)) continue;
        for (const name of execSync(`ls -1 "${absoluteDir}"`, { encoding: 'utf8' })
          .split('\n')
          .filter(Boolean)) {
          if (name.endsWith(prefix.replace('*', '')) || pattern.endsWith('/*')) {
            files.push(join(dir === '.' ? '' : dir, name).replace(/^\//, ''));
          }
        }
      } else if (existsSync(join(ROOT, pattern))) {
        files.push(pattern);
      }
    }
    return [...new Set(files)];
  }

  const staged = getStagedFiles();
  const protectedPaths = loadManifest().protectedFiles.map((entry) => entry.path);
  return [...new Set([...staged, ...protectedPaths])].filter((file) =>
    SCANNED_GLOBS.some((glob) => {
      if (!glob.includes('*')) return file === glob;
      const [dir] = glob.split('*');
      return file.startsWith(dir.replace(/\/$/, ''));
    }),
  );
}

function main() {
  const scanAll = process.argv.includes('--all');
  const manifest = loadManifest();
  const violations = [];

  for (const entry of manifest.protectedFiles) {
    violations.push(...verifyProtectedFile(entry));
  }

  for (const relativePath of listFilesToScan(scanAll)) {
    const absolutePath = join(ROOT, relativePath);
    if (!existsSync(absolutePath) || absolutePath.endsWith('security-scan.js')) {
      continue;
    }
    const content = readFileSync(absolutePath, 'utf8');
    violations.push(...scanContent(relativePath, content));
  }

  if (violations.length > 0) {
    console.error('Security scan failed:\n');
    for (const violation of violations) {
      console.error(`  - ${violation}`);
    }
    process.exit(1);
  }

  console.info('Security scan passed.');
}

main();
