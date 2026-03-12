-- ============================================================
-- The Pet Point — Database Migration 001
-- Creates all 8 tables defined in gemini.md §3
-- Run: psql $DATABASE_URL -f src/db/migrations/001_create_tables.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  location      TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── PETS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pets (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  breed      TEXT,
  age        INTEGER,
  photo_url  TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── VENDORS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id),
  business_name   TEXT NOT NULL,
  owner_name      TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('grooming','training','boarding','veterinary','daycare','walking','other')),
  description     TEXT,
  services        TEXT[],
  address         TEXT,
  lat             FLOAT,
  lng             FLOAT,
  contact_phone   TEXT,
  email           TEXT NOT NULL,
  price_range     TEXT,
  photo_urls      TEXT[],
  approved_status BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── BOOKINGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id),
  vendor_id      UUID REFERENCES vendors(id),
  pet_id         UUID REFERENCES pets(id),
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  vendor_id   UUID REFERENCES vendors(id),
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  location    TEXT NOT NULL,
  date_time   TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_by  UUID REFERENCES users(id),
  rsvp_count  INTEGER DEFAULT 0,
  approved_status BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENT RSVPS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_rsvps (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id   UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT event_rsvps_unique_user_event UNIQUE (event_id, user_id)
);

-- ── COMMUNITY POSTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id),
  content    TEXT NOT NULL,
  deleted    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vendors_category        ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_approved        ON vendors(approved_status);
CREATE INDEX IF NOT EXISTS idx_bookings_user           ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor         ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_messages_vendor         ON messages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_posts_deleted           ON community_posts(deleted);
CREATE INDEX IF NOT EXISTS idx_events_datetime         ON events(date_time);
