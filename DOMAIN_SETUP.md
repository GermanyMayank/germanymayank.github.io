# Portfolio domain

Canonical domain: `mayankvekariya.de`; alternate: `www.mayankvekariya.de`.
Hosting remains GitHub Pages from `main` at `/`. No paid hosting is needed.

## DNS target

- Apex ALIAS: `GermanyMayank.github.io`, TTL 600.
- `www` CNAME: `GermanyMayank.github.io`, TTL 600.
- No wildcard address record.
- Apex CAA: `0 issue "letsencrypt.org"`.

GitHub Pages should show `mayankvekariya.de` as its custom domain. Confirm a valid certificate covering apex and www, and enable Enforce HTTPS after issuance. A CNAME file is used for branch-based publishing.

## Security completion

Verify domain ownership in GitHub account Settings > Pages using GitHub's generated TXT record. Keep that record permanently. Enable Porkbun DNSSEC using the Porkbun DNSSEC toggle; do not invent or manually submit DS values without a matching signed zone. Account MFA and any supported transfer lock must be confirmed in the account UI. Security state is not implied by this document.

## Rollback

Stable source before this setup: `b19e49e8ceb5aabede0089599c13a1ea02ca413b`, retained as branch `checkpoint/before-custom-domain-2026-10-31`.

Before setup, DNS used apex ALIAS `pixie.porkbun.com` and wildcard CNAME `pixie.porkbun.com`, both TTL 600. The four Porkbun NS records and registry nameservers remain unchanged. Porkbun automatically creates a DNS restore point before zone writes.

To return to the old GitHub URL: restore the old DNS destination first, then remove the custom domain from Pages and remove CNAME through a reviewed revert commit. Remove the added www and CAA records if restoring the exact old zone. Do not force-push shared history. Do not restore DNSSEC DS records independently of the matching signed zone.
