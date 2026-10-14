# Phase 1 Security Fixes

## Changed

1. Auth DTOs now match the real phone/password authentication flow.
2. Public registration can only create `CUSTOMER` accounts.
3. Password hashing uses bcrypt cost 12.
4. JWT secret has no hard-coded fallback.
5. JWT access token lifetime changed from 7 days to 1 hour.
6. Booking access checks customer ownership or worker ownership through `Worker.userId -> Worker._id`.
7. Workers can only perform valid booking status transitions.
8. Customers can only cancel their own PENDING/ACCEPTED bookings.
9. Booking and worker/category IDs are validated before MongoDB queries.
10. New worker bookings require a verified and available worker.
11. Booking location now has a `2dsphere` index.
12. `.env.example` added; real `.env` is intentionally excluded from this package.

## Required after downloading

Create a local `.env` from `.env.example` and set:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`

Because the original project archive contained a real MongoDB connection string and JWT secret, rotate both credentials before using the application again.

## Build verification

The patched source was compiled successfully with the Nest CLI.

## Booking status rules

Customer:
- `PENDING -> CANCELLED`
- `ACCEPTED -> CANCELLED`

Worker:
- `PENDING -> ACCEPTED`
- `PENDING -> REJECTED`
- `ACCEPTED -> IN_PROGRESS`
- `IN_PROGRESS -> COMPLETED`

Other transitions are rejected.
