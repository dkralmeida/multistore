Migration scripts for Firestore store documents.

migrate_stores.js
- Purpose: normalize `stores` documents to have canonical fields:
  - `name` (string)
  - `primaryDomain` (string)
  - `status` (string, default "active")
  - `domains` (string[])
  - `theme` (object, preferably with `logoUrl`)

Usage (PowerShell):
$env:FIREBASE_PROJECT_ID = "your-project-id";
$env:FIREBASE_CLIENT_EMAIL = "...@...iam.gserviceaccount.com";
$env:FIREBASE_PRIVATE_KEY = (Get-Content .\serviceAccountKey.json -Raw);
node scripts/migrate_stores.js          # dry-run (no writes)
node scripts/migrate_stores.js --apply  # apply changes

Notes:
- Keep a backup or export of your Firestore before running --apply.
- The script expects a service account key or equivalent env vars.
