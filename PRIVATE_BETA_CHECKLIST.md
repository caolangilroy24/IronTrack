# Private Beta Launch Checklist (Milestone 6)

Use this as the handoff checklist from local dev to whitelist-only MVP hosting.

## 1. Quality Validation (Before Handoff)

- [ ] Run tests: `npm run test`
- [ ] Build production bundle: `npm run build`
- [ ] Smoke-test local production preview: `npm run preview`
- [ ] Verify all Vue files still follow `<template>` -> `<script setup lang="ts">` -> `<style scoped>`

## 2. Repository Hygiene

- [ ] Ensure `.env`, `.env.*`, cert/key files, and generated backup JSON files are ignored
- [ ] Confirm no private JSON backups are committed (`laidir_backup_*.json`, `irontrack-backup*.json`)
- [ ] Keep `.github` versioned unless a file contains private host credentials
- [ ] If private host-specific notes are needed, place them in `*.local` files (already ignored)

## 3. Hosting Mode Decision (Whitelist-Only)

Choose one of these:

- [ ] Preferred: private network access only via Tailscale/WireGuard/VPN and keep app non-public
- [ ] Alternate: public endpoint with strict IP allowlist at reverse proxy/firewall

## 4. HTTPS Decision

- [ ] If accessed over the public internet: enable HTTPS now (required)
- [ ] If only reachable through private VPN/Tailscale: HTTPS can be deferred briefly, but still strongly recommended
- [ ] If TLS is deferred, set a deadline to enable it before broader testing

## 5. Reverse Proxy + Access Controls

- [ ] Serve static `dist/` through Nginx or Caddy
- [ ] Restrict access to allowlisted IPs and/or VPN source ranges
- [ ] Disable directory listing and add basic security headers
- [ ] Add optional basic auth for extra gatekeeping during beta

## 6. Data Protection & Backup Operations

- [ ] Confirm users understand local browser storage is device-bound and not cloud synced yet
- [ ] Define backup cadence (for example weekly JSON export)
- [ ] Store backup files in a private folder outside the repo
- [ ] Test restore/import flow before onboarding beta users

## 7. Deploy & Verify

- [ ] Copy repo to host and run `npm ci`
- [ ] Build with `npm run build`
- [ ] Serve `dist/` from reverse proxy/static server
- [ ] Validate from allowlisted client and block from non-allowlisted client
- [ ] Capture first-round UX issues from trusted users

## 8. Explicit MVP Limits (Communicate to Testers)

- [ ] No real authentication yet (Milestone 7)
- [ ] Multi-user mode is local/trust-based only
- [ ] Browser storage can be cleared by users accidentally; backups are essential
