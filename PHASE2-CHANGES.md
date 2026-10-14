# Phase 2 Changes

## Security
- Added strict DTO validation for Mongo IDs, coordinates, rating, dates, pagination, and numeric ranges.
- Added global in-memory rate limiting and stricter rate limiting on `/auth/register` and `/auth/login`.
- Added security response headers (nosniff, frame protection, referrer policy, permissions policy).
- CORS now requires explicit `FRONTEND_ORIGINS` instead of allowing every origin.
- Added a global HTTP exception filter with safe JSON error responses and server-side logging for 5xx errors.

> Note: the environment used to prepare this ZIP could not download npm packages, so the security headers are implemented directly rather than adding the `helmet` package. If you prefer actual Helmet, run `npm install helmet` and replace the small middleware in `src/main.ts` with `app.use(helmet())`.

## Admin / Worker verification
- Customers can create a worker profile application, but it starts `isVerified=false` and `isAvailable=false`.
- Admin-only `PATCH /workers/:id/verify` verifies the worker, enables availability, and promotes the linked user to `WORKER`.
- Public worker responses no longer expose phone numbers.
- Worker nearby search returns only verified + available workers.

## API / Database
- Added pagination to `GET /bookings/my-bookings` and `GET /reviews/worker/:workerId`.
- Booking creation validates that the worker is verified/available, the category is active, and the scheduled date is in the future.
- Booking location uses a `2dsphere` index.
- Review creation now recalculates `Worker.ratingAvg`.
- User lookup by arbitrary ID is restricted to ADMIN; normal users use `/users/me`.
- Duplicate phone/category conflicts are handled explicitly.

## Important deployment note
There is intentionally no `.env` in this ZIP. Before using the project, create `.env` from `.env.example`, rotate any previously exposed MongoDB credentials, and generate a new strong `JWT_SECRET`.

## First admin
Because public registration can no longer choose `ADMIN`, create the first admin manually in MongoDB (or through a separate private seed script). Do not add an `admin` role field to public registration.
