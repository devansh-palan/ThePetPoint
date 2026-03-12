# 🛠️ tools/ — The Pet Point Connectivity Test Scripts

Run these scripts **before starting Phase 3 (build)** to confirm all external integrations are healthy.

---

## Prerequisites

1. **Copy** `.env.example` to `.env` at the project root.
2. **Fill in** your real credentials in `.env`.
3. **Install Python dependencies:**

```bash
pip install psycopg2-binary python-dotenv requests cloudinary resend
```

> Using a virtual environment is recommended:
> ```bash
> python -m venv .venv
> .venv\Scripts\activate      # Windows
> source .venv/bin/activate   # macOS / Linux
> pip install psycopg2-binary python-dotenv requests cloudinary resend
> ```

---

## Run All Tests

From the **project root** (`d:/Test/`):

```bash
python tools/test_db_connection.py
python tools/test_email.py
python tools/test_maps_api.py
python tools/test_storage.py
```

All four should exit with `✅ ... checks passed.`

---

## Individual Script Reference

### 1. `test_db_connection.py` — PostgreSQL

**What it tests:**
- Connects to the PostgreSQL database using `DATABASE_URL`
- Prints server version
- Lists existing tables (empty on fresh DB)
- Checks `uuid-ossp` extension is installed

**Required `.env` variables:**
```
DATABASE_URL=postgresql://user:password@host:5432/thepetpoint
```

**Common errors:**
| Error | Fix |
|---|---|
| `could not connect to server` | Is PostgreSQL running? Check `pg_ctl status` |
| `database does not exist` | Run `createdb thepetpoint` |
| `password authentication failed` | Check username/password in DATABASE_URL |

---

### 2. `test_email.py` — Email Service (Resend / SendGrid / SMTP)

**What it tests:**
- Sends a real HTML test email to `ADMIN_EMAIL`
- Supports all three providers automatically via `EMAIL_PROVIDER`

**Required `.env` variables:**
```
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_...
EMAIL_FROM=noreply@thepetpoint.ca
ADMIN_EMAIL=thepetpoint.ca@gmail.com
```

**Check your inbox** at `thepetpoint.ca@gmail.com` after running.

**Common errors:**
| Error | Fix |
|---|---|
| `REQUEST_DENIED` | Verify sender domain in Resend dashboard |
| `401 Unauthorized` | Check API key is correct and active |

---

### 3. `test_maps_api.py` — Google Maps Geocoding API

**What it tests:**
- Geocodes `"123 Queen St W, Toronto, ON"` using the Geocoding API
- Verifies the returned coordinates are in the Toronto area
- Catches API key permission errors with clear guidance

**Required `.env` variables:**
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Enable required APIs** in Google Cloud Console:
- Geocoding API
- Maps JavaScript API (for frontend embeds)

**Common errors:**
| Error | Fix |
|---|---|
| `REQUEST_DENIED` | Enable Geocoding API in Google Cloud Console |
| Key restricted | Create a server-side key with no IP restrictions for this script |

---

### 4. `test_storage.py` — Cloudinary File Upload

**What it tests:**
- Uploads a programmatically-generated 10×10 PNG (brand color `#6B4EFF`) to `thepetpoint/test/`
- Verifies the secure URL is publicly accessible via HTTP HEAD
- Cleans up by deleting the test image after verification

**No Pillow or external image files required** — PNG is generated in pure Python.

**Required `.env` variables:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Common errors:**
| Error | Fix |
|---|---|
| `Must supply api_key` | Check CLOUDINARY_API_KEY in .env |
| `Invalid cloud_name` | Check CLOUDINARY_CLOUD_NAME in .env |

---

## Expected Results Summary

| Script | Pass Condition |
|---|---|
| `test_db_connection.py` | `✅ All database checks passed.` |
| `test_email.py` | `✅ Test email sent successfully via resend.` + email arrives in inbox |
| `test_maps_api.py` | `✅ Google Maps API check passed.` + Toronto coordinates shown |
| `test_storage.py` | `✅ All storage checks passed.` |

Once all 4 pass → **🟢 Ready for Phase 3 (Full Build).**

---

*Last updated: 2026-03-12 | Phase 2 Link*
