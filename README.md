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

Local development using a .env file

1. Copy the example: `cp .env.example .env`
2. Edit `.env` and set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET`.
3. Start the app:

```bash
npm start
```

The project uses `dotenv` to load `.env` in development. Never commit your `.env` file; it's listed in `.gitignore`.
