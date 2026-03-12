#!/usr/bin/env python3
"""
test_maps_api.py — The Pet Point
Phase 2 / Link: Google Maps Geocoding API Test

Usage:
  1. Copy .env.example to .env and set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
  2. pip install requests python-dotenv
  3. python tools/test_maps_api.py

This script geocodes a test address ("123 Queen St W, Toronto, ON") and
verifies the Maps API returns a valid lat/lng.

Expected output (PASS):
  ✅ Google Maps Geocoding API is working.
  📍 Address: 123 Queen St W, Toronto, ON, Canada
  🌐 Coordinates: lat=43.6487, lng=-79.3947
"""

import sys
import os
import json
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)
else:
    print("⚠️  No .env file found. Using system environment variables.")

try:
    import requests
except ImportError:
    print("❌ requests not installed. Run: pip install requests")
    sys.exit(1)

# Note: NEXT_PUBLIC_ prefix is Next.js convention; Python reads it directly
API_KEY = os.getenv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "")

if not API_KEY:
    print("❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in your .env file.")
    sys.exit(1)

TEST_ADDRESS = "123 Queen St W, Toronto, ON"
GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json"

print("🗺️  Testing Google Maps Geocoding API...")
print(f"   Test address: {TEST_ADDRESS}")

try:
    response = requests.get(
        GEOCODING_URL,
        params={"address": TEST_ADDRESS, "key": API_KEY},
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()

    status = data.get("status")

    # ── Status checks ──────────────────────────────────────────────────────────
    if status == "OK":
        result   = data["results"][0]
        address  = result["formatted_address"]
        location = result["geometry"]["location"]
        lat, lng = location["lat"], location["lng"]

        print(f"\n✅ Google Maps Geocoding API is working.")
        print(f"📍 Address:     {address}")
        print(f"🌐 Coordinates: lat={lat:.4f}, lng={lng:.4f}")

        # Sanity check: Toronto should be around 43.65°N, 79.38°W
        if 43.0 < lat < 44.0 and -80.0 < lng < -79.0:
            print("🏙️  Coordinates look right for Toronto, Ontario. ✅")
        else:
            print("⚠️  Coordinates seem off — double-check the API key restrictions.")

        print(f"\n✅ Google Maps API check passed. Ready to use in vendor profiles.")
        sys.exit(0)

    elif status == "REQUEST_DENIED":
        print(f"\n❌ API request denied.")
        print(f"   Error message: {data.get('error_message', 'No message')}")
        print("\nTroubleshooting:")
        print("  • Is the 'Geocoding API' enabled in your Google Cloud project?")
        print("    Visit: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com")
        print("  • Is the API key restricted to a specific IP/referrer that blocks this script?")
        print("    Consider creating an unrestricted key for server-side use.")
        sys.exit(1)

    elif status == "ZERO_RESULTS":
        print(f"\n⚠️  API connected but no results found for test address.")
        print("   API key is valid. This may be a geocoding issue for the specific address.")
        sys.exit(0)

    else:
        print(f"\n❌ Unexpected status: {status}")
        print(f"   Full response: {json.dumps(data, indent=2)}")
        sys.exit(1)

except requests.exceptions.Timeout:
    print("\n❌ Request timed out. Check your internet connection.")
    sys.exit(1)
except requests.exceptions.ConnectionError as e:
    print(f"\n❌ Connection error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Unexpected error: {e}")
    sys.exit(1)
