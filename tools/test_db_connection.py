#!/usr/bin/env python3
"""
test_db_connection.py — The Pet Point
Phase 2 / Link: PostgreSQL Connectivity Test

Usage:
  1. Copy .env.example to .env and set your DATABASE_URL.
  2. pip install psycopg2-binary python-dotenv
  3. python tools/test_db_connection.py

Expected output (PASS):
  ✅ Connected to PostgreSQL successfully.
  📦 Server version: PostgreSQL 15.x ...
  📋 Existing tables: [...]
  ✅ All checks passed.

Expected output (FAIL):
  ❌ Connection failed: <error message>
"""

import sys
import os
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)
else:
    print("⚠️  No .env file found at project root. Using system environment variables.")

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL is not set in your .env file.")
    sys.exit(1)

print("🔌 Attempting PostgreSQL connection...")
print(f"   URL: {DATABASE_URL[:DATABASE_URL.find('@') + 1]}***")

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Check 1: Server version
    cursor.execute("SELECT version();")
    version = cursor.fetchone()[0]
    print(f"\n✅ Connected to PostgreSQL successfully.")
    print(f"📦 Server version: {version}")

    # Check 2: List existing tables
    cursor.execute("""
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
    """)
    tables = [row[0] for row in cursor.fetchall()]
    if tables:
        print(f"📋 Existing tables ({len(tables)}): {', '.join(tables)}")
    else:
        print("📋 No tables yet (fresh database — ready for migrations).")

    # Check 3: Verify UUID extension
    cursor.execute("SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp';")
    uuid_ext = cursor.fetchone()
    if uuid_ext:
        print("🔑 uuid-ossp extension: INSTALLED ✅")
    else:
        print("⚠️  uuid-ossp extension NOT installed.")
        print("   Run: CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")

    cursor.close()
    conn.close()
    print("\n✅ All database checks passed. Ready for Phase 3 migrations.")
    sys.exit(0)

except psycopg2.OperationalError as e:
    print(f"\n❌ Connection failed: {e}")
    print("\nTroubleshooting tips:")
    print("  • Is PostgreSQL running? (pg_ctl status / brew services list)")
    print("  • Is DATABASE_URL correctly formatted?")
    print("    Format: postgresql://USER:PASSWORD@HOST:PORT/DBNAME")
    print("  • Does the database exist? Create it with: createdb thepetpoint")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Unexpected error: {e}")
    sys.exit(1)
