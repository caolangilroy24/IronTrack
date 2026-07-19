About HTTPS right away:

If your app is reachable over the public internet (even with IP whitelist), use HTTPS immediately.
If access is only through private network paths (Tailscale/WireGuard/VPN), you can defer briefly, but set a near-term deadline to enable HTTPS anyway.
For your case (friend-hosted, whitelist MVP), the safest practical route is private network access first, then TLS as soon as possible.
Your TODO list from local dev to whitelist-only friend-hosted MVP:

Code hygiene

Pull latest repo and ensure only intended files are tracked.

Verify no private data files are committed (backup JSON, certs, env files).

Keep .github tracked unless it contains host secrets; put machine-specific notes in \*.local files.

Quality gate

Run: npm ci

Run: npm run test

Run: npm run build

Run: npm run preview and do a quick smoke test on core flows.

Host setup (friend machine)

Serve dist via Nginx or Caddy as static site.

Restrict inbound access to whitelist only (preferred: VPN/Tailscale-only reachability).

If public endpoint is used, enforce IP allowlist at reverse proxy/firewall.

Add basic auth as an extra temporary gate for beta.

TLS decision

Public endpoint: HTTPS now.

VPN-only endpoint: temporary HTTP is acceptable for initial trusted testing, but schedule TLS enablement.

Data safety for MVP

Communicate that data is browser-local and not cloud-synced yet.

Define a weekly backup/export routine.

Keep backup files outside the repo.

Test restore/import once before onboarding users.

Beta launch

Share only with trusted allowlisted users.

Validate both allowed-client access and blocked-client behavior.

Collect UX feedback and log issues for pre-V1.1 cleanup.

If you want, I can next generate a ready-to-use Caddy or Nginx whitelist config you can send directly to your friend.
