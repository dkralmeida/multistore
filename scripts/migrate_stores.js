#!/usr/bin/env node
/**
 * scripts/migrate_stores.js
 *
 * Safe migration tool to normalize `stores` documents in Firestore.
 * - Dry-run by default (no writes). Use --apply to perform updates.
 * - Reads FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY from env.
 *
 * Usage (PowerShell):
 *  $env:FIREBASE_PROJECT_ID = "...";
 *  $env:FIREBASE_CLIENT_EMAIL = "...";
 *  $env:FIREBASE_PRIVATE_KEY = (Get-Content .\serviceAccountKey.json -Raw);
 *  node scripts/migrate_stores.js          # dry-run
 *  node scripts/migrate_stores.js --apply  # actually apply changes
 */

const admin = require('firebase-admin');

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[migrate_stores] Missing env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }

  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }

  return { projectId, clientEmail, privateKey };
}

const { projectId, clientEmail, privateKey } = getServiceAccount();

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const db = admin.firestore();

const APPLY = process.argv.includes('--apply');

function isString(v) {
  return typeof v === 'string' && v.length > 0;
}

function extractStringsFromObject(obj) {
  const out = [];
  if (!obj || typeof obj !== 'object') return out;
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (isString(v)) out.push(v);
    if (Array.isArray(v)) {
      for (const it of v) if (isString(it)) out.push(it);
    }
  }
  return [...new Set(out)];
}

async function run() {
  console.log('[migrate_stores] Starting migration. APPLY=', APPLY);
  const snap = await db.collection('stores').get();
  console.log('[migrate_stores] Found', snap.size, 'store documents');

  let updatedCount = 0;
  for (const doc of snap.docs) {
    const id = doc.id;
    const data = doc.data();

    const updates = {};

    // Ensure domains is array of strings
    const rawDomains = data.domains;
    let domainsArr = [];
    if (Array.isArray(rawDomains)) {
      domainsArr = rawDomains.filter(isString);
    } else if (isString(rawDomains)) {
      domainsArr = [rawDomains];
    } else if (rawDomains && typeof rawDomains === 'object') {
      domainsArr = extractStringsFromObject(rawDomains);
    }
    if (domainsArr.length > 0) {
      // only set if different
      const same = Array.isArray(data.domains) && data.domains.length === domainsArr.length && data.domains.every((v, i) => v === domainsArr[i]);
      if (!same) updates.domains = domainsArr;
    }

    // primaryDomain: prefer top-level, fall back to domains[0]
    if (!isString(data.primaryDomain)) {
      if (domainsArr.length > 0) {
        updates.primaryDomain = domainsArr[0];
      } else if (data.domains && typeof data.domains === 'object' && isString(data.domains.primaryDomain)) {
        updates.primaryDomain = data.domains.primaryDomain;
      }
    }

    // name: prefer top-level, fall back to domains.name or primaryDomain
    if (!isString(data.name)) {
      if (data.domains && typeof data.domains === 'object' && isString(data.domains.name)) {
        updates.name = data.domains.name;
      } else if (updates.primaryDomain) {
        updates.name = updates.primaryDomain;
      }
    }

    // status default
    if (!isString(data.status)) {
      updates.status = 'active';
    }

    // theme.logoUrl: try several locations
    const theme = (data.theme && typeof data.theme === 'object') ? { ...data.theme } : {};
    let logo = theme.logoUrl || data.logoUrl || null;
    if (!logo && data.domains && typeof data.domains === 'object') {
      if (isString(data.domains.logoUrl)) logo = data.domains.logoUrl;
      else if (isString(data.domains.logo)) logo = data.domains.logo;
    }
    if (logo && logo !== theme.logoUrl) {
      theme.logoUrl = logo;
    }
    if (Object.keys(theme).length > 0) {
      // only set if different
      const sameTheme = data.theme && JSON.stringify(data.theme) === JSON.stringify(theme);
      if (!sameTheme) updates.theme = theme;
    }

    if (Object.keys(updates).length === 0) {
      // nothing to do
      continue;
    }

    console.log('Document:', id, 'will be updated with', updates);
    if (APPLY) {
      await db.collection('stores').doc(id).update(updates);
      updatedCount++;
    }
  }

  console.log('[migrate_stores] Done. Updated documents:', updatedCount);
  if (!APPLY) console.log('[migrate_stores] Dry-run only. Rerun with --apply to persist changes.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[migrate_stores] Error', err);
  process.exit(1);
});
