# Security Policy

## Supported Versions

Security fixes are expected for:

- the `main` branch
- the latest tagged release on `main`

Older tags and the benchmark archive branch are not guaranteed to receive fixes.

## Reporting A Vulnerability

If you find a security issue:

1. do not open a public GitHub issue with exploit details
2. contact the maintainer through GitHub security reporting or a private channel
3. include reproduction steps, affected files, and impact summary

Please allow time for triage before public disclosure.

## Security Posture Summary

- this template is meant for private Worker-to-Worker RPC, not a public password hashing API
- the public HTTP surface is intentionally limited to `GET /` metadata and health by default
- plaintext passwords are not intentionally logged by the template
- canonical preset `standard-2026q1` is the repository's OWASP-aligned floor
- `free-tier-fallback-2026q1` is an operational fallback for constrained Workers Free deployments, not the baseline recommendation

Operator guidance:

- review persisted logs and traces against your policy
- disable `GET /` after deployment verification if you do not want the metadata route exposed
- use `verifyAndMaybeRehash()` or `needsPasswordRehash()` when raising cost parameters so older hashes are upgraded gradually

Operational hardening detail lives in [docs/security-and-operations.md](./docs/security-and-operations.md).
