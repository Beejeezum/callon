# Database Restore and Continuity

## Objective

Prove that posted domain records, private contact/location ciphertext, storage references, and audit history can be restored to an isolated project without contaminating production.

## Drill

1. Record target recovery point and current migration version.
2. Restore backup/PITR into a new isolated Supabase project.
3. Apply missing forward migrations.
4. Validate row counts and sampled referential integrity without exposing plaintext PII.
5. Validate RLS as multiple synthetic identities.
6. Validate private schema is inaccessible to anon/authenticated roles.
7. Confirm storage objects and database paths reconcile.
8. Run core Ask/Offer/Loan read paths in a temporary Netlify branch deploy.
9. Destroy the drill project according to retention policy.

Record RPO, RTO, gaps, owner, date, and corrective actions. Production launch requires a successful drill.
