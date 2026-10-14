# USAI Backend

NestJS + MongoDB backend for the USAI service marketplace.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in:

```env
MONGODB_URI=...
JWT_SECRET=...
PORT=3000
FRONTEND_ORIGINS=http://localhost:5173
```

3. Start development server:

```bash
npm run start:dev
```

4. Build:

```bash
npm run build
```

## Security workflow

Public registration always creates `CUSTOMER`. A customer can submit a worker profile. An administrator verifies the profile with:

```http
PATCH /workers/:id/verify
Authorization: Bearer <admin-access-token>
```

After verification, the linked user becomes `WORKER` and the worker becomes available.

See `PHASE1-CHANGES.md` and `PHASE2-CHANGES.md` for the security changes.
