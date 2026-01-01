# Business Site

Small Express app. Recommended environment variables:

- `ADMIN_PASSWORD` (required): strong password for the admin account.
- `SESSION_SECRET` (required): a random, long secret used to sign session cookies.
- `ADMIN_EMAIL` (required): admin email (no default; set to your admin address).
- `DB_PATH` (optional): path to SQLite database file (defaults to `database.db`).
- `PORT` (optional): server port (defaults to `3000`).

Start the server with:

```bash
cd "$(dirname "$0")"
ADMIN_EMAIL=admin@business.com ADMIN_PASSWORD=yourStrongPassword SESSION_SECRET=yourSecret npm start
```

Notes:
- Keep secret values out of source control and use a proper secret manager in production.
- Consider enabling HTTPS and secure cookie flags for production deployments.
